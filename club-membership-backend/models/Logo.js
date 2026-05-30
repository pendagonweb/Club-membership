// models/Logo.js
import mongoose from "mongoose";

const logoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [120, "Alt text cannot exceed 120 characters"],
      default: "Logo",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Logo", logoSchema);
