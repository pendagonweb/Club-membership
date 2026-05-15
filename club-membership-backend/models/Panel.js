import mongoose from "mongoose";

const panelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    logo: {
      type: String, // Cloudinary secure_url (optional)
      default: null,
    },

    members: [
      {
        name: { type: String, required: true },
        role: { type: String }, // e.g. "President", "Secretary"
        photo: { type: String, default: null },
      },
    ],

    voteCount: {
      type: Number,
      default: 0, // denormalized count for fast reads
    },

    isActive: {
      type: Boolean,
      default: true, // toggle to disable voting for this panel
    },
  },
  { timestamps: true }
);

export default mongoose.model("Panel", panelSchema);