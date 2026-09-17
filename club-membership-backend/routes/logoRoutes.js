import express from "express";
import {
  uploadLogo,
  updateLogo,
  deleteLogo,
  getLogo,
} from "../controller/logoController.js";
import adminAuth from "../middleware/adminauth.js";
import requirePermission from "../middleware/requirePermission.js";
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();
const guard = [adminAuth, requirePermission("logo")];

const logoUpload = upload.single("logo");
const allowedMimes = ["image/png", "image/jpeg", "image/webp"];

const validateImageType = (req, res, next) => {
  logoUpload(req, res, (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });
    if (req.file && !allowedMimes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Only PNG, JPG/JPEG, and WEBP images are accepted",
        });
    }
    next();
  });
};

router.get("/", getLogo);
router.post("/", ...guard, validateImageType, uploadLogo);
router.patch("/", ...guard, validateImageType, updateLogo);
router.delete("/", ...guard, deleteLogo);

export default router;
