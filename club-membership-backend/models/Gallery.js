// models/Gallery.js
import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
});

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [600, "Description cannot exceed 600 characters"],
      default: "",
    },
    label: {
      type: String,
      enum: {
        values: ["gallery", "newscutting", "news"],
        message: "Label must be one of: gallery, newscutting, news",
      },
      required: [true, "Label is required"],
      default: "gallery",
    },
    images: {
      type: [galleryImageSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message: "At least one image is required",
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gallery", gallerySchema);
