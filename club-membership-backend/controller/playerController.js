// controllers/playerController.js
import PlayerRegistration from "../models/PlayerRegistration.js";
import User from "../models/User.js";

/* Fetch member details by membershipId */
export const fetchMemberByMembershipId = async (req, res) => {
  try {
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

    // Check if already registered
    const existing = await PlayerRegistration.findOne({ userId: user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This member is already registered for the tournament.",
      });
    }

    res.status(200).json({ success: true, member: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Register player */
export const registerPlayer = async (req, res) => {
  try {
    const { membershipId, position, jerseyNumber } = req.body;

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

    // Duplicate check
    const existing = await PlayerRegistration.findOne({ userId: user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This member is already registered for the tournament.",
      });
    }

    const player = await PlayerRegistration.create({
      membershipId: user.membershipId,
      userId: user._id,
      name: user.name,
      age: user.age,
      phone: user.phone,
      nickname: user.nickname,
      bloodGroup: user.bloodGroup,
      position,
    });

    res.status(201).json({
      success: true,
      message: "Player registered successfully!",
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

/* Admin: get all registered players */
export const getAllPlayers = async (req, res) => {
  try {
    const players = await PlayerRegistration.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, players });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};