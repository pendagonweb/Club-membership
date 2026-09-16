import PlayerRegistration from "../models/PlayerRegistration.js";
import Tournament from "../models/Tournament.js";
import User from "../models/User.js";
import Junior from "../models/Juniors.js";

const getActiveTournament = () => Tournament.findOne({ isActive: true });

const STATIC_VALID_UPTO = new Date("2027-03-31");

const isMembershipExpired = (user) => {
  const effectiveExpiry =
    user.expiryDate && new Date(user.expiryDate) < STATIC_VALID_UPTO
      ? new Date(user.expiryDate)
      : new Date(STATIC_VALID_UPTO);
  effectiveExpiry.setHours(23, 59, 59, 999);
  return effectiveExpiry.getTime() < Date.now();
};

// Juniors only store dob, not age  derive it, and don't blow up if dob is missing.
const calcAgeFromDob = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());
  if (!hadBirthday) age--;
  return age;
};

// Junior membershipIds aren't forced to uppercase at registration time, so match case-insensitively.
const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* Fetch member details by membershipId, scoped to whichever tournament is currently open.
   Tries the approved-User registry first; if nothing matches there, falls back to the
   Junior registry. Juniors have no membershipStatus/expiryDate, so `membershipExpired`
   is always false for them  there is nothing to expire. */
export const fetchMemberByMembershipId = async (req, res) => {
  try {
    const activeTournament = await getActiveTournament();
    if (!activeTournament) {
      return res.status(400).json({
        success: false,
        message:
          "Registration is currently closed. No tournament is open right now.",
      });
    }

    const { membershipId } = req.params;
    const idUpper = membershipId.trim().toUpperCase();

    /* 1) Regular approved member */
    const user = await User.findOne({
      membershipId: idUpper,
      membershipStatus: "approved",
    }).select("name age phone nickname bloodGroup membershipId expiryDate _id");

    if (user) {
      const existing = await PlayerRegistration.findOne({
        userId: user._id,
        tournament: activeTournament._id,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `This member is already registered for ${activeTournament.name}.`,
        });
      }

      return res.status(200).json({
        success: true,
        memberType: "member",
        member: {
          _id: user._id,
          name: user.name,
          age: user.age,
          phone: user.phone,
          nickname: user.nickname,
          bloodGroup: user.bloodGroup,
          membershipId: user.membershipId,
        },
        membershipExpired: isMembershipExpired(user),
        tournament: { _id: activeTournament._id, name: activeTournament.name },
      });
    }

    /* 2) Fall back to Junior registry  no expiry concept applies here */
    const junior = await Junior.findOne({
      membershipId: {
        $regex: `^${escapeRegExp(membershipId.trim())}$`,
        $options: "i",
      },
    });

    if (!junior) {
      return res.status(404).json({
        success: false,
        message: "No approved member or junior found with this Membership ID.",
      });
    }

    const existingJunior = await PlayerRegistration.findOne({
      juniorId: junior._id,
      tournament: activeTournament._id,
    });
    if (existingJunior) {
      return res.status(409).json({
        success: false,
        message: `This junior member is already registered for ${activeTournament.name}.`,
      });
    }

    return res.status(200).json({
      success: true,
      memberType: "junior",
      member: {
        _id: junior._id,
        name: junior.name,
        age: calcAgeFromDob(junior.dob),
        phone: junior.mobile,
        nickname: null,
        bloodGroup: null,
        membershipId: junior.membershipId,
      },
      membershipExpired: false, // juniors never expire  nothing to check
      tournament: { _id: activeTournament._id, name: activeTournament.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Register player into whichever tournament is currently open.
   Regular members must have a currently-valid membership; juniors skip that check
   entirely since Junior has no expiry field. */
export const registerPlayer = async (req, res) => {
  try {
    const activeTournament = await getActiveTournament();
    if (!activeTournament) {
      return res.status(400).json({
        success: false,
        message:
          "Registration is currently closed. No tournament is open right now.",
      });
    }

    const { membershipId, position } = req.body;
    const idUpper = String(membershipId || "")
      .trim()
      .toUpperCase();

    /* 1) Regular approved member  expiry check applies */
    const user = await User.findOne({
      membershipId: idUpper,
      membershipStatus: "approved",
    });

    if (user) {
      if (isMembershipExpired(user)) {
        return res.status(403).json({
          success: false,
          message:
            "Your membership has expired. Please renew your membership before registering for the tournament.",
        });
      }

      const existing = await PlayerRegistration.findOne({
        userId: user._id,
        tournament: activeTournament._id,
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `This member is already registered for ${activeTournament.name}.`,
        });
      }

      const player = await PlayerRegistration.create({
        membershipId: user.membershipId,
        memberType: "member",
        userId: user._id,
        tournament: activeTournament._id,
        tournamentName: activeTournament.name,
        name: user.name,
        age: user.age,
        phone: user.phone,
        nickname: user.nickname,
        bloodGroup: user.bloodGroup,
        position,
      });

      return res.status(201).json({
        success: true,
        message: `Player registered successfully for ${activeTournament.name}!`,
        player,
      });
    }

    /* 2) Junior fallback  no expiry check, since Junior has no such field */
    const junior = await Junior.findOne({
      membershipId: {
        $regex: `^${escapeRegExp(String(membershipId || "").trim())}$`,
        $options: "i",
      },
    });

    if (!junior) {
      return res.status(404).json({
        success: false,
        message: "No approved member or junior found with this Membership ID.",
      });
    }

    const existingJunior = await PlayerRegistration.findOne({
      juniorId: junior._id,
      tournament: activeTournament._id,
    });
    if (existingJunior) {
      return res.status(409).json({
        success: false,
        message: `This junior member is already registered for ${activeTournament.name}.`,
      });
    }

    const player = await PlayerRegistration.create({
      membershipId: junior.membershipId,
      memberType: "junior",
      juniorId: junior._id,
      tournament: activeTournament._id,
      tournamentName: activeTournament.name,
      name: junior.name,
      age: calcAgeFromDob(junior.dob),
      phone: junior.mobile,
      nickname: null,
      bloodGroup: null,
      position,
    });

    return res.status(201).json({
      success: true,
      message: `Player registered successfully for ${activeTournament.name}!`,
      player,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate registration detected.",
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Admin: get all registered players, optionally filtered to one tournament */
export const getAllPlayers = async (req, res) => {
  try {
    const { tournamentId } = req.query;
    const filter = {};
    if (tournamentId) filter.tournament = tournamentId;

    const players = await PlayerRegistration.find(filter)
      .sort({ createdAt: -1 })
      .populate("tournament", "name isActive");

    res.status(200).json({ success: true, players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
