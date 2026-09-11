import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
      unique: true,
    },
    // Only one tournament should be open for new registrations at a time.
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tournament", tournamentSchema);