import express from "express";
import Juniors from "../models/Juniors.js";

const router = express.Router();

/* ======================
   CREATE JUNIOR
====================== */
router.post("/juniorregister", async (req, res) => {
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

    /* CHECK DUPLICATE */
    const existing = await Juniors.findOne({ mobile });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Junior already registered with this mobile",
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
      membershipId: membershipId.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Junior registered successfully",
      junior,
    });
  } catch (err) {
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
router.put("/:id", async (req, res) => {
  try {
    const { name, fatherName, dob, occupation, mobile, place, membershipId } =
      req.body;

    /* VALIDATION */
    if (name !== undefined && name.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Invalid name" });
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
    if (membershipId !== undefined) updates.membershipId = membershipId.trim();

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
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ======================
   DELETE JUNIOR (ADMIN)
====================== */
router.delete("/:id", async (req, res) => {
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
});

export default router;
