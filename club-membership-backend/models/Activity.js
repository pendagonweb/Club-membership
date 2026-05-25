// models/Activity.model.js
import mongoose from "mongoose";
const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    tag: {
      type: String,
      required: [true, "Tag is required"],
      trim: true,
      maxlength: [40, "Tag cannot exceed 40 characters"],
    },
    image: {
      type: String,          // URL string (Cloudinary / S3 / local path)
      default: "",
    },
    order: {
      type: Number,          // for manual sort ordering on homepage
      default: 0,
    },
    isActive: {
      type: Boolean,         // hide/show on homepage without deleting
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);