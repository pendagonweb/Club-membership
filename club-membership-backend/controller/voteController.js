import Vote from "../models/Vote.js";
import Panel from "../models/Panel.js";

// POST /api/votes/cast
export const castVote = async (req, res) => {
  const userId = req.user._id; // from your auth middleware
  const { panelId } = req.body;

  try {
    const panel = await Panel.findById(panelId);
    if (!panel || !panel.isActive) {
      return res.status(404).json({ message: "Panel not found or inactive" });
    }

    // Only approved members can vote
    if (req.user.membershipStatus !== "approved") {
      return res.status(403).json({ message: "Only approved members can vote" });
    }

    // Check if user already voted for ANY panel
    const alreadyVoted = await Vote.findOne({ user: userId });
    if (alreadyVoted) {
      return res.status(409).json({ message: "You have already cast your vote" });
    }

    // Create vote + increment count atomically
    await Vote.create({ user: userId, panel: panelId });
    await Panel.findByIdAndUpdate(panelId, { $inc: { voteCount: 1 } });

    res.status(201).json({ message: "Vote cast successfully" });

  } catch (error) {
    // Duplicate key error (race condition safety net)
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already cast your vote" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/votes/status
// Returns whether the logged-in user has voted and for which panel
export const getVoteStatus = async (req, res) => {
  const userId = req.user._id;

  try {
    const vote = await Vote.findOne({ user: userId }).populate("panel", "name logo");
    if (!vote) {
      return res.json({ hasVoted: false, votedPanel: null });
    }
    res.json({ hasVoted: true, votedPanel: vote.panel });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/votes/results  (admin only)
export const getResults = async (req, res) => {
  try {
    const panels = await Panel.find().select("name voteCount logo").sort({ voteCount: -1 });
    const totalVotes = await Vote.countDocuments();
    res.json({ panels, totalVotes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};