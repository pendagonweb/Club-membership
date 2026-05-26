// routes/gallery.routes.js
import express from "express";
import upload from "../middleware/cloudinaryUpload.js"; // same shared upload middleware you use in Activity
import adminAuth from "../middleware/adminauth.js";

import {
  getPublicGalleries,
  getPublicGalleryById,
  getAllGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGalleryImage,
  deleteGallery,
  toggleGallery,
} from "../controller/galleryController.js";

const router = express.Router();

/* ── Reusable multi-file upload middleware (field name: "images", max 20) ──
   Mirrors the uploadActivityImage wrapper from your activity route —
   catches multer errors and returns a clean 400 instead of crashing.       */
const uploadGalleryImages = (req, res, next) => {
  upload.array("images", 20)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

/* ─────────────────────────────────────────────
   PUBLIC
───────────────────────────────────────────── */
// GET /galleries          → all active galleries (optional ?label=news)
// GET /galleries/:id      → single active gallery
router.get("/galleries", getPublicGalleries);
router.get("/galleries/:id", getPublicGalleryById);

/* ─────────────────────────────────────────────
   ADMIN  (all protected)
───────────────────────────────────────────── */
// GET    /admin/galleries                          → all galleries (optional ?label=gallery)
// GET    /admin/galleries/:id                      → single gallery
// POST   /admin/galleries                          → create with up to 20 images
// PUT    /admin/galleries/:id                      → update (replaces images if new ones uploaded)
// DELETE /admin/galleries/:id                      → delete gallery + all Cloudinary images
// PATCH  /admin/galleries/:id/toggle               → toggle isActive
// PATCH  /admin/galleries/:id/images/:publicId     → remove a single image from the gallery
router.get("/admin/galleries", adminAuth, getAllGalleries);
router.get("/admin/galleries/:id", adminAuth, getGalleryById);

router.post("/admin/galleries", adminAuth, uploadGalleryImages, createGallery);
router.put(
  "/admin/galleries/:id",
  adminAuth,
  uploadGalleryImages,
  updateGallery,
);

router.delete("/admin/galleries/:id", adminAuth, deleteGallery);

router.patch("/admin/galleries/:id/toggle", adminAuth, toggleGallery);
router.patch(
  "/admin/galleries/:id/images/:publicId",
  adminAuth,
  deleteGalleryImage,
);

export default router;
