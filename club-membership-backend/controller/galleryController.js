// controllers/gallery.controller.js
import Gallery from "../models/Gallery.js";
import { v2 as cloudinary } from "cloudinary";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const deleteImages = async (images = []) => {
  await Promise.allSettled(
    images.map(({ publicId }) => {
      if (publicId) return cloudinary.uploader.destroy(publicId);
    })
  );
};

const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    console.warn("Cloudinary delete failed for:", publicId);
  }
};

/* ─────────────────────────────────────────────
   PUBLIC
───────────────────────────────────────────── */

export const getPublicGalleries = async (req, res) => {
  try {
    const { label } = req.query; // optional filter: ?label=news
    const filter = { isActive: true };
    if (label) filter.label = label;

    const galleries = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getPublicGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-__v");

    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN
───────────────────────────────────────────── */

export const getAllGalleries = async (req, res) => {
  try {
    const { label } = req.query;
    const filter = {};
    if (label) filter.label = label;

    const galleries = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select("-__v");

    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id).select("-__v");
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const createGallery = async (req, res) => {
  // req.files is an array from multer's .array("images", 20)
  const uploadedFiles = req.files ?? [];

  try {
    const { title, description, date, label, order, isActive } = req.body;

    if (!uploadedFiles.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const images = uploadedFiles.map((f) => ({
      url: f.path,         // Cloudinary secure_url
      publicId: f.filename, // Cloudinary public_id
    }));

    const gallery = await Gallery.create({
      title,
      description: description ?? "",
      date,
      label,
      images,
      order: order ?? 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res
      .status(201)
      .json({ success: true, message: "Gallery created", data: gallery });
  } catch (error) {
    // Roll back any uploads if DB save fails
    await deleteImages(
      uploadedFiles.map((f) => ({ publicId: f.filename }))
    );

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

export const updateGallery = async (req, res) => {
  const uploadedFiles = req.files ?? [];

  try {
    const allowedFields = ["title", "description", "date", "label", "order", "isActive"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // If new images are provided, REPLACE the image set
    if (uploadedFiles.length) {
      const existing = await Gallery.findById(req.params.id).select("images");
      if (existing?.images?.length) await deleteImages(existing.images);

      updates.images = uploadedFiles.map((f) => ({
        url: f.path,
        publicId: f.filename,
      }));
    }

    const gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!gallery) {
      await deleteImages(uploadedFiles.map((f) => ({ publicId: f.filename })));
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Gallery updated", data: gallery });
  } catch (error) {
    await deleteImages(uploadedFiles.map((f) => ({ publicId: f.filename })));

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

/**
 * DELETE a single image from a gallery (by its publicId).
 * PATCH /admin/galleries/:id/images/:publicId
 */
export const deleteGalleryImage = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    const { publicId } = req.params; // URL-encoded public_id
    const decoded = decodeURIComponent(publicId);

    const imageExists = gallery.images.some((img) => img.publicId === decoded);
    if (!imageExists)
      return res
        .status(404)
        .json({ success: false, message: "Image not found in gallery" });

    if (gallery.images.length === 1)
      return res.status(400).json({
        success: false,
        message: "Cannot remove the only image. Delete the gallery instead.",
      });

    await deleteImage(decoded);
    gallery.images = gallery.images.filter((img) => img.publicId !== decoded);
    await gallery.save();

    res
      .status(200)
      .json({ success: true, message: "Image removed", data: gallery });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    await deleteImages(gallery.images);

    res.status(200).json({ success: true, message: "Gallery deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const toggleGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery)
      return res
        .status(404)
        .json({ success: false, message: "Gallery not found" });

    gallery.isActive = !gallery.isActive;
    await gallery.save();

    res.status(200).json({
      success: true,
      message: `Gallery ${gallery.isActive ? "activated" : "deactivated"}`,
      data: gallery,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
