import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/adminauth.js";
import requirePermission from "../middleware/requirePermission.js";

const router = express.Router();

/* ADMIN LOGIN */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username and password are required",
        });
    }

    const admin = await Admin.findOne({ username: username.trim() });
    if (!admin || !admin.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.role === "superadmin" ? [] : admin.permissions,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* GET ALL PENDING USERS  [requests] */
router.get(
  "/pending-users",
  adminAuth,
  requirePermission("requests"),
  async (req, res) => {
    try {
      const users = await User.find({
        membershipStatus: "pending_approval",
      }).sort({ createdAt: -1 });
      res.status(200).json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

/* APPROVE USER  [requests] */
router.put(
  "/approve/:id",
  adminAuth,
  requirePermission("requests"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const isMinor = Number(user.age) > 0 && Number(user.age) < 20;
      if (!user.photo) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Profile photo is required before approval",
          });
      }
      if (!isMinor && !user.paymentProof) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Payment proof is required before approval",
          });
      }

      const lastUser = await User.findOne({
        membershipId: { $regex: /^K-STAR2026\// },
      }).sort({ membershipId: -1 });
      let nextNumber = 1;
      if (lastUser?.membershipId) {
        const match = lastUser.membershipId.match(/\/(\d+)$/);
        if (match) nextNumber = parseInt(match[1]) + 1;
      }

      user.membershipId = `K-STAR2026/${String(nextNumber).padStart(4, "0")}`;
      user.membershipStatus = "approved";
      user.approvedAt = new Date();
      user.expiryDate = new Date("2027-03-31");
      await user.save();

      res.status(200).json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

/* REJECT USER  [requests] */
router.put(
  "/reject/:id",
  adminAuth,
  requirePermission("requests"),
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      user.membershipStatus = "rejected";
      user.membershipId = undefined;
      user.approvedAt = undefined;
      user.expiryDate = undefined;
      await user.save({ validateBeforeSave: false });

      res
        .status(200)
        .json({ success: true, message: "User rejected successfully", user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

/* GET ALL USERS — shared read, any authenticated admin (used for counts + pickers) */
router.get("/all-users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* GET COMMITTEE (public) */
router.get("/committee", async (req, res) => {
  try {
    const users = await User.find({ membershipStatus: "approved" })
      .select(
        "name age membershipId expiryDate phone nickname designation photo bloodGroup place nri whatsapp bloodDonations",
      )
      .sort({ name: 1 });
    const leaders = users.filter((u) => u.designation !== "member");
    const members = users.filter((u) => u.designation === "member");
    res.status(200).json({ success: true, data: { leaders, members } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* EDIT USER  [members] */
router.put(
  "/user/:id",
  adminAuth,
  requirePermission("members"),
  async (req, res) => {
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
        "bloodDonations",
      ];
      const updates = {};
      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined && req.body[field] !== "")
          updates[field] = req.body[field];
      });

      const updatedUser = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      res
        .status(200)
        .json({
          success: true,
          message: "User updated successfully",
          user: updatedUser,
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

/* DELETE USER  [members] */
router.delete(
  "/user/:id",
  adminAuth,
  requirePermission("members"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      res
        .status(200)
        .json({ success: true, message: "User deleted permanently" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

export default router;
