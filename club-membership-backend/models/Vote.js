import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    panel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panel",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevents a user from voting more than once
voteSchema.index({ user: 1, panel: 1 }, { unique: true });

// Also useful: quickly find all votes by user (to check if voted)
voteSchema.index({ user: 1 });

export default mongoose.model("Vote", voteSchema);