// routes/user.js
import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* ======================
   AUTH MIDDLEWARE
   Verifies the Bearer token and sets req.userId
   Used only on routes that need it (the update route)
====================== */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Support both { id } and { _id } in JWT payload
    req.userId = (decoded.id || decoded._id)?.toString();
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};

/* ======================
   MEMBERSHIP ID GENERATOR
====================== */
const getNextMembershipId = async () => {
  const lastUser = await User.findOne({
    membershipId: { $regex: "^K-STAR2026/" },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastUser?.membershipId) {
    nextNumber = parseInt(lastUser.membershipId.split("/")[1], 10) + 1;
  }
  return `K-STAR2026/${String(nextNumber).padStart(4, "0")}`;
};

/* ======================
   GET ALL USERS (Admin)
====================== */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   GET USER BY ID
====================== */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   UPLOAD PAYMENT PROOF
====================== */
router.post(
  "/upload-payment/:id",
  upload.single("paymentProof"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      user.paymentProof = req.file.path;
      user.paymentProofId = req.file.filename;
      user.membershipStatus = "payment_received";
      await user.save();

      res.json({
        success: true,
        message: "Payment proof uploaded successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

/* ======================
   UPDATE MEMBERSHIP STATUS (Admin)
====================== */
router.patch("/update-status/:id", async (req, res) => {
  try {
    const { membershipStatus } = req.body;
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (membershipStatus === "approved" && !user.membershipId) {
      user.membershipId = await getNextMembershipId();
    }
    user.membershipStatus = membershipStatus;
    await user.save();

    res.json({ success: true, message: "Membership status updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ======================
   DELETE PAYMENT PROOF (Reject case)
====================== */
router.delete("/payment-proof/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.paymentProofId) {
      await cloudinary.uploader.destroy(user.paymentProofId);
    }
    user.paymentProof = null;
    user.paymentProofId = null;
    user.membershipStatus = "rejected";
    await user.save();

    res.json({ success: true, message: "Payment proof removed", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ======================
   UPDATE USER PROFILE
   Protected: requires valid Bearer token
====================== */
const uploadPhotoOptional = (req, res, next) => {
  upload.fields([{ name: "photo", maxCount: 1 }])(req, res, (err) => {
    if (err) {
      if (err.message === "Unexpected end of form") return next();
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.put(
  "/update/:userId",
  verifyToken,
  uploadPhotoOptional,
  async (req, res) => {
    try {
      const { userId } = req.params;

      // req.userId is set by verifyToken above
      if (req.userId !== userId) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized" });
      }

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

      const normalize = (num) => num?.replace(/\D/g, "").slice(-10);
      const phoneRegex = /^[6-9]\d{9}$/;

      const cleanPhone = phone ? normalize(phone) : undefined;
      const cleanWhatsapp = whatsapp ? normalize(whatsapp) : undefined;

      if (cleanPhone && !phoneRegex.test(cleanPhone))
        return res
          .status(400)
          .json({ success: false, message: "Invalid phone number" });
      if (cleanWhatsapp && !phoneRegex.test(cleanWhatsapp))
        return res
          .status(400)
          .json({ success: false, message: "Invalid WhatsApp number" });
      if (aadhaar && !/^\d{12}$/.test(aadhaar))
        return res
          .status(400)
          .json({ success: false, message: "Valid 12-digit Aadhaar required" });

      if (cleanPhone || cleanWhatsapp || aadhaar) {
        const orConditions = [];
        if (cleanPhone) orConditions.push({ phone: cleanPhone });
        if (cleanWhatsapp) orConditions.push({ whatsapp: cleanWhatsapp });
        if (aadhaar) orConditions.push({ aadhaar });

        const duplicate = await User.findOne({
          _id: { $ne: userId },
          $or: orConditions,
        });
        if (duplicate) {
          return res.status(409).json({
            success: false,
            message:
              "Phone, WhatsApp, or Aadhaar already in use by another account",
          });
        }
      }

      const updates = {};
      if (name) updates.name = name;
      if (fatherName) updates.fatherName = fatherName;
      if (nickname) updates.nickname = nickname;
      if (email !== undefined) updates.email = email || null;
      if (age) updates.age = age;
      if (cleanPhone) updates.phone = cleanPhone;
      if (cleanWhatsapp) updates.whatsapp = cleanWhatsapp;
      if (bloodGroup)
        updates.bloodGroup =
          bloodGroup.toUpperCase() === "NIL" ? "Nil" : bloodGroup;
      if (address) updates.address = address;
      if (dob !== undefined) updates.dob = dob || null;
      if (nri !== undefined) updates.nri = nri;
      if (aadhaar) updates.aadhaar = aadhaar;

      if (req.files?.photo) {
        // Optionally delete old photo: await cloudinary.uploader.destroy(oldUser.photoId)
        updates.photo = req.files.photo[0].path;
        updates.photoId = req.files.photo[0].filename;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true },
      );

      if (!updatedUser)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      res
        .status(200)
        .json({
          success: true,
          message: "Profile updated successfully",
          user: updatedUser,
        });
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

export default router;
