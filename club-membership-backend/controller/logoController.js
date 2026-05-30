// controllers/logo.controller.js
import Logo from "../models/Logo.js";
import { v2 as cloudinary } from "cloudinary";

/* ─────────────────────────────────────────────
   HELPER
───────────────────────────────────────────── */

const destroyCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    console.warn("Cloudinary delete failed for:", publicId);
  }
};

/* ─────────────────────────────────────────────
   PUBLIC — GET
───────────────────────────────────────────── */

/**
 * GET /api/logo
 * Returns the single logo document (or 404 if none uploaded yet).
 */
export const getLogo = async (req, res) => {
  try {
    const logo = await Logo.findOne().select("-__v");
    if (!logo)
      return res
        .status(404)
        .json({ success: false, message: "No logo found" });

    res.status(200).json({ success: true, data: logo });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ─────────────────────────────────────────────
   ADMIN — CREATE
───────────────────────────────────────────── */

/**
 * POST /admin/logo
 * Uploads the logo for the first time.
 * Accepts a single file field named "logo" (png / jpg / webp).
 * Rejects if a logo already exists — use PATCH to replace it.
 */
export const uploadLogo = async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "An image file is required" });
    }

    const existing = await Logo.findOne();
    if (existing) {
      // Roll back the just-uploaded file to avoid orphans
      await destroyCloudinary(file.filename);
      return res.status(409).json({
        success: false,
        message:
          "A logo already exists. Use the update endpoint (PATCH /admin/logo) to replace it.",
      });
    }

    const logo = await Logo.create({
      url: file.path,        // Cloudinary secure_url via multer-storage-cloudinary
      publicId: file.filename, // Cloudinary public_id
      altText: req.body.altText ?? "Logo",
    });

    res.status(201).json({ success: true, message: "Logo uploaded", data: logo });
  } catch (error) {
    await destroyCloudinary(file?.filename);

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

/* ─────────────────────────────────────────────
   ADMIN — UPDATE
───────────────────────────────────────────── */

/**
 * PATCH /admin/logo
 * Replaces the existing logo image (and/or updates altText).
 * A new image file is optional — if omitted, only altText is updated.
 */
export const updateLogo = async (req, res) => {
  const file = req.file;

  try {
    const logo = await Logo.findOne();
    if (!logo) {
      await destroyCloudinary(file?.filename);
      return res.status(404).json({
        success: false,
        message: "No logo found. Upload one first via POST /admin/logo.",
      });
    }

    // If a new image was sent, swap it out
    if (file) {
      await destroyCloudinary(logo.publicId); // remove old from Cloudinary
      logo.url = file.path;
      logo.publicId = file.filename;
    }

    if (req.body.altText !== undefined) {
      logo.altText = req.body.altText;
    }

    await logo.save();

    res.status(200).json({ success: true, message: "Logo updated", data: logo });
  } catch (error) {
    await destroyCloudinary(file?.filename);

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

/* ─────────────────────────────────────────────
   ADMIN — DELETE
───────────────────────────────────────────── */

/**
 * DELETE /admin/logo
 * Removes the logo document and deletes the asset from Cloudinary.
 */
export const deleteLogo = async (req, res) => {
  try {
    const logo = await Logo.findOneAndDelete();
    if (!logo)
      return res
        .status(404)
        .json({ success: false, message: "No logo found" });

    await destroyCloudinary(logo.publicId);

    res.status(200).json({ success: true, message: "Logo deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
