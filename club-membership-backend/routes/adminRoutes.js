import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import adminAuth from "../middleware/adminauth.js";

const router = express.Router();

/* =========================
   ADMIN LOGIN
========================= */
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { role: "admin", username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      token,
      admin: { username },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   GET ALL PENDING USERS
========================= */
router.get("/pending-users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({
      membershipStatus: "pending_approval",
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Pending users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   APPROVE USER
========================= */
router.put("/approve/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMinor = Number(user.age) > 0 && Number(user.age) < 19;

    if (!user.photo) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required before approval",
      });
    }

    if (!isMinor && !user.paymentProof) {
      return res.status(400).json({
        success: false,
        message: "Payment proof is required before approval",
      });
    }
    // Find last approved user's membership number
    const lastUser = await User.findOne({
      membershipId: { $regex: /^K-STAR2026\// },
    }).sort({ membershipId: -1 });
    let nextNumber = 1;

    if (lastUser && lastUser.membershipId) {
      const match = lastUser.membershipId.match(/\/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    user.membershipId = `K-STAR2026/${String(nextNumber).padStart(4, "0")}`;

    const approvedAt = new Date();
    user.membershipStatus = "approved";
    user.approvedAt = approvedAt;
    user.expiryDate = new Date("2027-03-31");

    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   REJECT USER
========================= */
router.put("/reject/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.membershipStatus = "rejected";
    user.membershipId = undefined;
    user.approvedAt = undefined;
    user.expiryDate = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "User rejected successfully",
      user,
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   GET ALL USERS (admin)
========================= */
router.get("/all-users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("All users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   GET COMMITTEE (public)
   Returns only approved members with safe public fields.
   Leaders (designation !== "member") are separated from members.
========================= */
router.get("/committee", async (req, res) => {
  try {
    const users = await User.find({ membershipStatus: "approved" })
      .select(
        "name membershipId phone nickname designation photo bloodGroup place nri whatsapp",
      )
      .sort({ name: 1 });

    const leaders = users.filter((u) => u.designation !== "member");
    const members = users.filter((u) => u.designation === "member");

    res.status(200).json({ success: true, data: { leaders, members } });
  } catch (error) {
    console.error("Committee fetch error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* =========================
   EDIT / UPDATE USER DETAILS
========================= */
router.put("/user/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const allowedUpdates = [
      "name",
      "designation",
      "nickname",
      "phone",
      "whatsapp",
      "email",
      "address",
      "dob",
      "bloodGroup",
      "gender",
      "expiryDate",
      "place",
      "nri",
      "aadhaar",
      "password",
      "paymentAmount",
    ];

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Edit user error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* =========================
   DELETE USER
========================= */
router.delete("/user/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted permanently",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
