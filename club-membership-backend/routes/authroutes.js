import express from "express";
import User from "../models/User.js";
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();

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
   PHONE HELPERS
====================== */

// Strip everything except digits
const normalize = (num) => String(num).replace(/\D/g, "");

// Strip leading + from country code e.g. "+91" → "91"
const cleanCode = (code) => String(code).replace(/^\+/, "");

// Build full international number: "+91" + "9876543210" → "+919876543210"
const toFullNumber = (code, num) => `+${cleanCode(code)}${normalize(num)}`;

const phoneLengths = {
  91: [10], // India
  971: [9], // UAE
  974: [8], // Qatar
  966: [9], // Saudi Arabia
  973: [8], // Bahrain
  965: [8], // Kuwait
  968: [8], // Oman
  44: [10, 11], // UK
};

const isValidPhone = (num, code) => {
  const digits = normalize(num);
  const key = cleanCode(code);
  const valid = phoneLengths[key] ?? [7, 8, 9, 10, 11]; // permissive fallback
  return digits.length > 0 && valid.includes(digits.length);
};

/* ======================
   REGISTER
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
      phoneCode,
      whatsapp,
      whatsappCode,
      bloodGroup,
      address,
      dob,
      nri,
      aadhaar,
      password,
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
      !phoneCode ||
      !whatsapp ||
      !whatsappCode ||
      !bloodGroup ||
      !address ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    if (!req.files?.photo) {
      return res.status(400).json({
        success: false,
        message: "Photo is required",
      });
    }

    const isMinor = Number(age) > 0 && Number(age) < 20;

    if (!isMinor && !req.files?.paymentProof) {
      return res.status(400).json({
        success: false,
        message: "Payment proof is required",
      });
    }

    if (nri === undefined || nri === "") {
      return res.status(400).json({
        success: false,
        message: "NRI status is required",
      });
    }

    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        success: false,
        message: "Valid 12-digit Aadhaar number is required",
      });
    }
    if (
      !password ||
      password.length < 5 ||
      !/[a-zA-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 5 characters and contain both letters and numbers",
      });
    }

    /* ======================
       PHONE VALIDATION
    ====================== */
    if (!isValidPhone(phone, phoneCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!isValidPhone(whatsapp, whatsappCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid WhatsApp number",
      });
    }

    // Full international numbers ready for WhatsApp API usage
    // e.g. "+919876543210", "+971501234567"
    const fullPhone = toFullNumber(phoneCode, phone);
    const fullWhatsapp = toFullNumber(whatsappCode, whatsapp);

    /* ======================
       DUPLICATE CHECK
    ====================== */
    const existingUser = await User.findOne({
      $or: [
        { phone: fullPhone },
        { whatsapp: fullWhatsapp },
        { aadhaar: aadhaar },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Phone, WhatsApp or Aadhaar already registered",
      });
    }

    /* ======================
       CREATE USER
    ====================== */
    await User.create({
      name,
      fatherName,
      nickname,
      email: email || null,
      age,
      phone: fullPhone,
      whatsapp: fullWhatsapp,
      nri,
      aadhaar,
      bloodGroup: bloodGroup.toUpperCase() === "NIL" ? "Nil" : bloodGroup,
      address,
      dob: dob || null,
      password,

      membershipStatus: "pending_approval",

      photo: req.files.photo[0].path,
      photoId: req.files.photo[0].filename,

      ...(req.files.paymentProof && {
        paymentProof: req.files.paymentProof[0].path,
        paymentProofId: req.files.paymentProof[0].filename,
      }),
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
