import express from "express";
import Juniors from "../models/Juniors.js";

const router = express.Router();

/* ======================
   CREATE JUNIOR
====================== */
router.post("/juniorregister", async (req, res) => {
  try {
    const { name, fatherName, dob, occupation, mobile, place } = req.body;

    /* VALIDATION */
    if (!name || name.trim().length < 3) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid name" });
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
    });

    res.status(201).json({
      success: true,
      message: "Junior registered successfully",
      junior,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ======================
   GET ALL JUNIORS
====================== */
router.get("/", async (req, res) => {
  try {
    const juniors = await Juniors.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      juniors,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ======================
   GET SINGLE JUNIOR
====================== */
router.get("/:id", async (req, res) => {
  try {
    const junior = await Junior.findById(req.params.id);

    if (!junior) {
      return res.status(404).json({
        success: false,
        message: "Junior not found",
      });
    }

    res.json({
      success: true,
      junior,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ======================
   DELETE JUNIOR (ADMIN)
====================== */
router.delete("/:id", async (req, res) => {
  try {
    const junior = await Junior.findById(req.params.id);

    if (!junior) {
      return res.status(404).json({
        success: false,
        message: "Junior not found",
      });
    }

    await junior.deleteOne();

    res.json({
      success: true,
      message: "Junior deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;