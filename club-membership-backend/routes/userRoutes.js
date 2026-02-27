// routes/user.js
import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const getNextMembershipId = async () => {
  const lastUser = await User.findOne({
    membershipId: { $regex: "^K-STAR2026/" },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastUser?.membershipId) {
    nextNumber =
      parseInt(lastUser.membershipId.split("/")[1], 10) + 1;
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
      return res.status(404).json({ success: false, message: "User not found" });

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
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ success: false, message: "User not found" });

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
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* ======================
   UPDATE MEMBERSHIP STATUS (Admin)
====================== */
router.patch("/update-status/:id", async (req, res) => {
  try {
    const { membershipStatus } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // ✅ Generate ID only on approval & only once
    if (membershipStatus === "approved" && !user.membershipId) {
      user.membershipId = await getNextMembershipId();
    }

    user.membershipStatus = membershipStatus;
    await user.save();

    res.json({
      success: true,
      message: "Membership status updated",
      user,
    });
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
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.paymentProofId) {
      await cloudinary.uploader.destroy(user.paymentProofId);
    }

    user.paymentProof = null;
    user.paymentProofId = null;
    user.membershipStatus = "rejected";

    await user.save();

    res.json({
      success: true,
      message: "Payment proof removed",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
