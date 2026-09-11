import Tournament from "../models/Tournament.js";
import PlayerRegistration from "../models/PlayerRegistration.js";

/* List every tournament, newest first, with a live player count for each. */
export const listTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 }).lean();
    const counts = await PlayerRegistration.aggregate([
      { $group: { _id: "$tournament", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
    const data = tournaments.map((t) => ({
      ...t,
      playerCount: countMap.get(String(t._id)) || 0,
    }));
    res.status(200).json({ success: true, tournaments: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Create a new tournament. Optionally activate it immediately (closing any other open one). */
export const createTournament = async (req, res) => {
  try {
    const { name, activate } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Tournament name is required" });
    }

    const existing = await Tournament.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "A tournament with this name already exists" });
    }

    if (activate) {
      await Tournament.updateMany({ isActive: true }, { $set: { isActive: false } });
    }

    const tournament = await Tournament.create({
      name: name.trim(),
      isActive: !!activate,
    });

    res.status(201).json({ success: true, message: "Tournament created", tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Open this tournament for registration and close every other one. */
export const activateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: "Tournament not found" });
    }

    await Tournament.updateMany({ _id: { $ne: id } }, { $set: { isActive: false } });
    tournament.isActive = true;
    await tournament.save();

    res.status(200).json({
      success: true,
      message: `"${tournament.name}" is now open for registration`,
      tournament,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Close registration for a tournament without touching its data. */
export const closeTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: "Tournament not found" });
    }
    tournament.isActive = false;
    await tournament.save();
    res.status(200).json({
      success: true,
      message: `Registration closed for "${tournament.name}"`,
      tournament,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* Delete a tournament — only allowed while it has zero registrations, so
   existing player data can never be silently wiped through this endpoint. */
export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const playerCount = await PlayerRegistration.countDocuments({ tournament: id });
    if (playerCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${playerCount} player${playerCount !== 1 ? "s" : ""} already registered for this tournament.`,
      });
    }
    const tournament = await Tournament.findByIdAndDelete(id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: "Tournament not found" });
    }
    res.status(200).json({ success: true, message: "Tournament deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};