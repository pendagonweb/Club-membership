import express from "express";
import User from "../models/User.js";
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();

/* ======================
   SAFE MULTER WRAPPER
   Catches "Unexpected field" and returns a clean JSON error
   instead of crashing the server with an unhandled MulterError
====================== */
const uploadRegisterFiles = (req, res, next) => {
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "paymentProof", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          success: false,
          message: `Unexpected file field "${err.field}". Expected "photo" and "paymentProof".`,
        });
      }
      if (err.message === "Unexpected end of form") {
        return next(); // no file sent yet — caught later in validation
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

/* ======================
   REGISTER (NO MEMBERSHIP ID HERE)
====================== */
router.post("/register", uploadRegisterFiles, async (req, res) => {
  try {
    const {
      name,
      fatherName,
      nickname,
      email,
      age,
      phone,
      whatsapp,
      bloodGroup,
      address,
      dob,
      nri,
      aadhaar,
    } = req.body;

    /* ======================
       BASIC VALIDATION
    ====================== */
    if (
      !name ||
      !fatherName ||
      !nickname ||
      !age ||
      !phone ||
      !whatsapp ||
      !bloodGroup ||
      !address
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (!req.files?.photo || !req.files?.paymentProof) {
      return res.status(400).json({
        success: false,
        message: "Photo and payment proof are required",
      });
    }

    if (nri === undefined) {
      return res.status(400).json({
        success: false,
        message: "NRI status is required",
      });
    }

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        success: false,
        message: "Valid 12 digit Aadhaar number is required",
      });
    }

    /* ======================
       PHONE NORMALIZATION
    ====================== */
    const normalize = (num) => num.replace(/\D/g, "").slice(-10);

    const cleanPhone = normalize(phone);
    const cleanWhatsapp = normalize(whatsapp);

    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!phoneRegex.test(cleanWhatsapp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid WhatsApp number",
      });
    }

    /* ======================
       DUPLICATE CHECK
    ====================== */
    const existingUser = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { whatsapp: cleanWhatsapp },
        { aadhaar: aadhaar },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Phone, WhatsApp or Aadhaar already exists",
      });
    }

    /* ======================
       CREATE USER (NO membershipId)
    ====================== */
    await User.create({
      name,
      fatherName,
      nickname,
      email: email || null,
      age,
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      nri,
      aadhaar,
      bloodGroup: bloodGroup.toUpperCase() === "NIL" ? "Nil" : bloodGroup,
      address,
      dob: dob || null,

      membershipStatus: "pending_approval",

      photo: req.files.photo[0].path,
      photoId: req.files.photo[0].filename,

      paymentProof: req.files.paymentProof[0].path,
      paymentProofId: req.files.paymentProof[0].filename,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
