import express from "express";
import User from "../models/User.js";
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();

/* ======================
   REGISTER (NO MEMBERSHIP ID HERE)
====================== */
router.post(
  "/register",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "paymentProof", maxCount: 1 },
  ]),
  async (req, res) => {
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
        $or: [{ phone: cleanPhone }, { whatsapp: cleanWhatsapp }],
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Phone or WhatsApp already exists",
        });
      }

      /* ======================
         CREATE USER (NO membershipId)
      ====================== */
      const user = await User.create({
        name,
        fatherName,
        nickname,
        email: email || null,
        age,
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        bloodGroup:
          bloodGroup.toUpperCase() === "NIL" ? "Nil" : bloodGroup,
        address,
        dob: dob || null,

        membershipId: null, // ✅ IMPORTANT
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
  }
);

export default router;
