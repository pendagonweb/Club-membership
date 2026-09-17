import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import adminAuth from "../middleware/adminauth.js";
import requirePermission from "../middleware/requirePermission.js";
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
const guard = [adminAuth, requirePermission("gallery")];

const uploadGalleryImages = (req, res, next) => {
  upload.array("images", 20)(req, res, (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.get("/galleries", getPublicGalleries);
router.get("/galleries/:id", getPublicGalleryById);

router.get("/admin/galleries", ...guard, getAllGalleries);
router.get("/admin/galleries/:id", ...guard, getGalleryById);
router.post("/admin/galleries", ...guard, uploadGalleryImages, createGallery);
router.put(
  "/admin/galleries/:id",
  ...guard,
  uploadGalleryImages,
  updateGallery,
);
router.delete("/admin/galleries/:id", ...guard, deleteGallery);
router.patch("/admin/galleries/:id/toggle", ...guard, toggleGallery);
router.patch(
  "/admin/galleries/:id/images/:publicId",
  ...guard,
  deleteGalleryImage,
);

export default router;
