// club-membership-backend/routes/juniorRoutes.js
import express from "express";
import Juniors from "../models/Juniors.js";
import upload from "../middleware/cloudinaryUpload.js";
import adminAuth from "../middleware/adminauth.js";
import requirePermission from "../middleware/requirePermission.js";

const router = express.Router();

/* ======================
   OPTIONAL PHOTO UPLOAD MIDDLEWARE
   Used on both register and edit  photo is optional on both.
====================== */
const uploadJuniorPhoto = (req, res, next) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      if (err.message === "Unexpected end of form") return next();
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

/* ======================
   MEMBERSHIP ID VALIDATION HELPER
   Requires at least 3 digits somewhere in the ID.
====================== */
const hasAtLeastThreeDigits = (value) =>
  (String(value).match(/\d/g) || []).length >= 3;

/* ======================
   CREATE JUNIOR
====================== */
router.post("/juniorregister", uploadJuniorPhoto, async (req, res) => {
  try {
    const { name, fatherName, dob, occupation, mobile, place, membershipId } =
      req.body;

    /* VALIDATION */
    if (!name || name.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Invalid name" });
    }

    if (!fatherName || fatherName.trim().length < 3) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid father name" });
    }

    if (!occupation || occupation.trim().length < 2) {
      return res
        .status(400)
        .json({ success: false, message: "Occupation is required" });
    }

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid mobile number" });
    }

    /* MEMBERSHIP ID VALIDATION */
    if (!membershipId || !membershipId.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Membership ID is required" });
    }

    const trimmedMembershipId = membershipId.trim();

    if (!hasAtLeastThreeDigits(trimmedMembershipId)) {
      return res.status(400).json({
        success: false,
        message: "Membership ID must contain at least 3 digits",
      });
    }

    /* CHECK DUPLICATE MOBILE */
    const existing = await Juniors.findOne({ mobile });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Junior already registered with this mobile",
      });
    }

    /* CHECK DUPLICATE MEMBERSHIP ID */
    const existingId = await Juniors.findOne({
      membershipId: trimmedMembershipId,
    });
    if (existingId) {
      return res.status(409).json({
        success: false,
        message: "This Membership ID is already registered",
      });
    }

    /* CREATE */
    const junior = await Juniors.create({
      name: name.trim(),
      fatherName: fatherName.trim(),
      dob: dob || null,
      occupation: occupation.trim(),
      mobile,
      place: place || "",
      membershipId: trimmedMembershipId,
      photo: req.file?.path || null,
      photoId: req.file?.filename || null,
    });

    res.status(201).json({
      success: true,
      message: "Junior registered successfully",
      junior,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate membership ID or mobile number",
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   GET ALL JUNIORS
====================== */
router.get("/", async (req, res) => {
  try {
    const juniors = await Juniors.find().sort({ createdAt: -1 });
    res.json({ success: true, juniors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   GET SINGLE JUNIOR
====================== */
router.get("/:id", async (req, res) => {
  try {
    const junior = await Juniors.findById(req.params.id);

    if (!junior) {
      return res
        .status(404)
        .json({ success: false, message: "Junior not found" });
    }

    res.json({ success: true, junior });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   EDIT JUNIOR
====================== */
router.put(
  "/:id",
  adminAuth,
  requirePermission("juniors"),
  uploadJuniorPhoto,
  async (req, res) => {
    try {
      const { name, fatherName, dob, occupation, mobile, place, membershipId } =
        req.body;

      /* VALIDATION */
      if (name !== undefined && name.trim().length < 3) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid name" });
      }

      if (fatherName !== undefined && fatherName.trim().length < 3) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid father name" });
      }

      if (occupation !== undefined && occupation.trim().length < 2) {
        return res
          .status(400)
          .json({ success: false, message: "Occupation is required" });
      }

      if (mobile !== undefined && !/^\d{10}$/.test(mobile)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid mobile number" });
      }

      let trimmedMembershipId;
      if (membershipId !== undefined) {
        trimmedMembershipId = membershipId.trim();

        if (!trimmedMembershipId) {
          return res
            .status(400)
            .json({ success: false, message: "Membership ID is required" });
        }

        if (!hasAtLeastThreeDigits(trimmedMembershipId)) {
          return res.status(400).json({
            success: false,
            message: "Membership ID must contain at least 3 digits",
          });
        }

        /* CHECK DUPLICATE MEMBERSHIP ID (exclude current record) */
        const existingId = await Juniors.findOne({
          membershipId: trimmedMembershipId,
          _id: { $ne: req.params.id },
        });
        if (existingId) {
          return res.status(409).json({
            success: false,
            message: "This Membership ID is already in use by another junior",
          });
        }
      }

      /* CHECK DUPLICATE MOBILE (exclude current record) */
      if (mobile) {
        const existing = await Juniors.findOne({
          mobile,
          _id: { $ne: req.params.id },
        });
        if (existing) {
          return res.status(409).json({
            success: false,
            message: "Mobile number already in use by another junior",
          });
        }
      }

      /* BUILD UPDATE OBJECT */
      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (fatherName !== undefined) updates.fatherName = fatherName.trim();
      if (dob !== undefined) updates.dob = dob || null;
      if (occupation !== undefined) updates.occupation = occupation.trim();
      if (mobile !== undefined) updates.mobile = mobile;
      if (place !== undefined) updates.place = place;
      if (trimmedMembershipId !== undefined)
        updates.membershipId = trimmedMembershipId;

      if (req.file) {
        updates.photo = req.file.path;
        updates.photoId = req.file.filename;
      }

      /* UPDATE */
      const junior = await Juniors.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!junior) {
        return res
          .status(404)
          .json({ success: false, message: "Junior not found" });
      }

      res.json({
        success: true,
        message: "Junior updated successfully",
        junior,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Duplicate membership ID or mobile number",
        });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

/* ======================
   DELETE JUNIOR (ADMIN)
====================== */
router.delete(
  "/:id",
  adminAuth,
  requirePermission("juniors"),
  async (req, res) => {
    try {
      const junior = await Juniors.findById(req.params.id);

      if (!junior) {
        return res
          .status(404)
          .json({ success: false, message: "Junior not found" });
      }

      await junior.deleteOne();
      res.json({ success: true, message: "Junior deleted successfully" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
);

export default router;
