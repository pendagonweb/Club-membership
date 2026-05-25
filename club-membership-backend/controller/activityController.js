// controllers/activity.controller.js
import Activity from "../models/Activity.js";
import { v2 as cloudinary } from "cloudinary";

const deleteOldImage = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      // non-fatal — log and continue
      console.warn("Cloudinary delete failed for:", publicId);
    }
  }
};


export const getPublicActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN
───────────────────────────────────────────── */

export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).select("-__v");
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const createActivity = async (req, res) => {
  try {
    const { title, description, tag, date, order, isActive } = req.body;

    const image = req.file?.path || "";
    const imageId = req.file?.filename || "";

    const activity = await Activity.create({
      title,
      description,
      tag,
      date,
      image,
      imageId,
      order: order ?? 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res
      .status(201)
      .json({ success: true, message: "Activity created", data: activity });
  } catch (error) {
    // If DB save fails, clean up the uploaded image
    if (req.file?.filename) await deleteOldImage(req.file.filename);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const allowedFields = ["title", "description", "tag", "date", "order", "isActive"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If a new image was uploaded, swap it out
    if (req.file) {
      const existing = await Activity.findById(req.params.id).select("imageId");
      if (existing?.imageId) await deleteOldImage(existing.imageId);

      updates.image = req.file.path;
      updates.imageId = req.file.filename;
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-__v");

    if (!activity) {
      // Clean up newly uploaded image since doc wasn't found
      if (req.file?.filename) await deleteOldImage(req.file.filename);
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Activity updated", data: activity });
  } catch (error) {
    if (req.file?.filename) await deleteOldImage(req.file.filename);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    // Delete image from Cloudinary on record deletion
    if (activity.imageId) await deleteOldImage(activity.imageId);

    res.status(200).json({ success: true, message: "Activity deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const toggleActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res
        .status(404)
        .json({ success: false, message: "Activity not found" });
    }

    activity.isActive = !activity.isActive;
    await activity.save();

    res.status(200).json({
      success: true,
      message: `Activity ${activity.isActive ? "activated" : "deactivated"}`,
      data: activity,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
