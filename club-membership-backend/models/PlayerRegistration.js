import mongoose from "mongoose";

const playerRegistrationSchema = new mongoose.Schema(
  {
    membershipId: {
      type: String,
      required: true,
      trim: true,
    },

    // NEW: which schema this registration's member comes from
    memberType: {
      type: String,
      enum: ["member", "junior"],
      default: "member",
    },

    // Only set when memberType === "member"
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.memberType === "member";
      },
    },

    // NEW: only set when memberType === "junior"
    juniorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Junior",
      required: function () {
        return this.memberType === "junior";
      },
    },

    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    tournamentName: {
      type: String,
      required: true,
      trim: true,
    },
    name: { type: String, required: true },

    // Juniors don't reliably have an age  only dob (which may be empty)
    age: { type: Number },

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

// One registration per tournament, per member  now split across both member types.
// `sparse: true` is important: junior docs have no userId, member docs have no juniorId,
// and without sparse, mongo would treat every "missing field" as null and collide.
playerRegistrationSchema.index(
  { userId: 1, tournament: 1 },
  { unique: true, sparse: true },
);
playerRegistrationSchema.index(
  { juniorId: 1, tournament: 1 },
  { unique: true, sparse: true },
);
playerRegistrationSchema.index({ tournament: 1 });

export default mongoose.model("PlayerRegistration", playerRegistrationSchema);
