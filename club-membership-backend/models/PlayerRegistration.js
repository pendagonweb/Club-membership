// models/PlayerRegistration.js
import mongoose from "mongoose";

const playerRegistrationSchema = new mongoose.Schema(
  {
    membershipId: {
      type: String,
      required: true,
      unique: true, // prevents duplicate registration
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // extra guard at DB level
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true },
    nickname: { type: String },
    bloodGroup: { type: String },
    position: {
      type: String,
      enum: ["Goalkeeper", "Defender", "Midfielder", "Forward", "Winger", "Striker"],
      required: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlayerRegistration", playerRegistrationSchema);