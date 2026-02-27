import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ======================
   MEMBER LOGIN
====================== */
router.post("/login", async (req, res) => {
  try {
    const { phone, membershipId } = req.body;

    // 1️⃣ Validate input
    if (!phone || !membershipId) {
      return res.status(400).json({
        success: false,
        message: "Phone number and Membership ID are required",
      });
    }

    // 2️⃣ Find member
    const member = await User.findOne({ phone, membershipId });

    if (!member) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or Membership ID",
      });
    }

    // 3️⃣ Check approval
    if (member.membershipStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Membership not approved yet",
      });
    }

    // 4️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: member._id,
        role: "member",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5️⃣ Send ONLY what frontend needs
    return res.json({
      success: true,
      message: "Login successful back",
      token,
      userId: member._id, // ✅ THIS IS THE KEY
    });

  } catch (err) {
    console.error("Member login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

export default router;
