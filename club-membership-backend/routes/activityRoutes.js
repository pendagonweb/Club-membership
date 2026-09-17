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
import requirePermission from "../middleware/requirePermission.js";

const router = express.Router();
const guard = [adminAuth, requirePermission("activities")];

const uploadActivityImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
    next();
  });
};

router.get("/activities", getPublicActivities);
router.get("/activities/:id", getActivityById);

router.get("/admin/activities", ...guard, getAllActivities);
router.get("/admin/activities/:id", ...guard, getActivityById);
router.post("/admin/activities", ...guard, uploadActivityImage, createActivity);
router.put(
  "/admin/activities/:id",
  ...guard,
  uploadActivityImage,
  updateActivity,
);
router.delete("/admin/activities/:id", ...guard, deleteActivity);
router.patch("/admin/activities/:id/toggle", ...guard, toggleActivity);

export default router;
