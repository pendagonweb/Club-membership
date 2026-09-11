// models/PlayerRegistration.js
import mongoose from "mongoose";

const playerRegistrationSchema = new mongoose.Schema(
  {
    membershipId: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    // Snapshot of the tournament's name at registration time, so the record
    // still reads fine even if the Tournament doc is ever renamed/removed.
    tournamentName: {
      type: String,
      required: true,
      trim: true,
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    nickname: { type: String },
    bloodGroup: { type: String },
    position: {
      type: String,
      enum: [
        "Goalkeeper",
        "Defender",
        "Midfielder",
        "Forward",
        "Winger",
        "Striker",
      ],
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// A member can register once per tournament, but can join other tournaments separately.
playerRegistrationSchema.index({ userId: 1, tournament: 1 }, { unique: true });
playerRegistrationSchema.index({ tournament: 1 });

export default mongoose.model("PlayerRegistration", playerRegistrationSchema);
