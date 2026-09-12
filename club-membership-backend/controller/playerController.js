// controllers/playerController.js
import PlayerRegistration from "../models/PlayerRegistration.js";
import Tournament from "../models/Tournament.js";
import User from "../models/User.js";

const getActiveTournament = () => Tournament.findOne({ isActive: true });

/* ======================
   MEMBERSHIP EXPIRY CHECK
   Mirrors the "effective expiry" logic used on the member dashboard:
   whichever is earlier between the static club-wide expiry and the
   member's own expiryDate (if one is set and earlier).
====================== */
const STATIC_VALID_UPTO = new Date("2027-03-31");

const isMembershipExpired = (user) => {
  const effectiveExpiry =
    user.expiryDate && new Date(user.expiryDate) < STATIC_VALID_UPTO
      ? new Date(user.expiryDate)
      : new Date(STATIC_VALID_UPTO);
  effectiveExpiry.setHours(23, 59, 59, 999); // the expiry day itself still counts as valid
  return effectiveExpiry.getTime() < Date.now();
};

/* Fetch member details by membershipId, scoped to whichever tournament is currently open.
   NOTE: this still returns member details even if the membership has expired  it just
   flags it via `membershipExpired` so the frontend can show why registration is blocked. */
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

    const user = await User.findOne({
      membershipId: membershipId.trim().toUpperCase(),
      membershipStatus: "approved",
    }).select("name age phone nickname bloodGroup membershipId expiryDate _id");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No approved member found with this Membership ID.",
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

    const expired = isMembershipExpired(user);

    res.status(200).json({
      success: true,
      member: {
        _id: user._id,
        name: user.name,
        age: user.age,
        phone: user.phone,
        nickname: user.nickname,
        bloodGroup: user.bloodGroup,
        membershipId: user.membershipId,
      },
      membershipExpired: expired,
      tournament: { _id: activeTournament._id, name: activeTournament.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Register player into whichever tournament is currently open.
   Membership must be currently valid  expired members are blocked here,
   even though the lookup above still shows their details. */
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

    const user = await User.findOne({
      membershipId: membershipId.trim().toUpperCase(),
      membershipStatus: "approved",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No approved member found with this Membership ID.",
      });
    }

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

    res.status(201).json({
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
