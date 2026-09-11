// controllers/playerController.js
import PlayerRegistration from "../models/PlayerRegistration.js";
import Tournament from "../models/Tournament.js";
import User from "../models/User.js";

const getActiveTournament = () => Tournament.findOne({ isActive: true });

/* Fetch member details by membershipId, scoped to whichever tournament is currently open */
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
    }).select("name age phone nickname bloodGroup membershipId _id");

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

    res.status(200).json({
      success: true,
      member: user,
      tournament: { _id: activeTournament._id, name: activeTournament.name },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Register player into whichever tournament is currently open */
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
