import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import {
  getPublicActivities,
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivity,
} from "../controller/activityController.js";
import adminAuth from "../middleware/adminauth.js";

const router = express.Router();

// Reusable single-file upload middleware (field name: "image")
const uploadActivityImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Public
router.get("/activities", getPublicActivities);

// Admin
router.get("/admin/activities", adminAuth, getAllActivities);
router.get("/admin/activities/:id", adminAuth, getActivityById);
router.post(
  "/admin/activities",
  adminAuth,
  uploadActivityImage,
  createActivity,
);
router.put(
  "/admin/activities/:id",
  adminAuth,
  uploadActivityImage,
  updateActivity,
);
router.delete("/admin/activities/:id", adminAuth, deleteActivity);
router.patch("/admin/activities/:id/toggle", adminAuth, toggleActivity);

export default router;
