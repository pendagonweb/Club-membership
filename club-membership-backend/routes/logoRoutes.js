// routes/logo.routes.js
import express from "express";
import {
  uploadLogo,
  updateLogo,
  deleteLogo,
  getLogo,
} from "../controller/logoController.js";
import adminAuth from "../middleware/adminauth.js"; // JWT admin auth middleware
import upload from "../middleware/cloudinaryUpload.js";
const router = express.Router();

// ── Multer: single file, field name "logo", restricted to png/jpg/webp ──────
const logoUpload = upload.single("logo");

// Wrapper to validate mime type before hitting the controller
const allowedMimes = ["image/png", "image/jpeg", "image/webp"];

const validateImageType = (req, res, next) => {
  logoUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    // If a file was sent, check its type
    if (req.file && !allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only PNG, JPG/JPEG, and WEBP images are accepted",
      });
    }
    next();
  });
};

/* ─── PUBLIC ────────────────────────────────── */
router.get("/", getLogo);

/* ─── ADMIN (protected) ──────────────────────── */
router.post("/", adminAuth, validateImageType, uploadLogo);
router.patch("/", adminAuth, validateImageType, updateLogo);
router.delete("/", adminAuth, deleteLogo);

export default router;

/* ─────────────────────────────────────────────────────────────────────────────
   Mount in your main app.js / server.js:

   import logoRouter from "./routes/logo.routes.js";
   app.use("/api/logo",        logoRouter);          // public GET
   app.use("/admin/logo",      logoRouter);          // protected POST/PATCH/DELETE
   
   Or simply mount once and rely on the protect middleware per-method:
   app.use("/api/logo", logoRouter);
───────────────────────────────────────────────────────────────────────────── */
