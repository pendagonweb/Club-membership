import express from "express";
import bcrypt from "bcryptjs";
import Admin, { ADMIN_PERMISSIONS } from "../models/Admin.js";
import adminAuth from "../middleware/adminauth.js";

const router = express.Router();

const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== "superadmin") {
    return res
      .status(403)
      .json({ success: false, message: "Superadmin access required" });
  }
  next();
};

router.use(adminAuth); // every route below needs a valid admin token

router.get("/me", (req, res) => res.json({ success: true, admin: req.admin }));
router.get("/permissions", (req, res) =>
  res.json({ success: true, permissions: ADMIN_PERMISSIONS }),
);

// Everything below is superadmin-only
router.get("/", requireSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const { username, password, name, role, permissions } = req.body;

    if (!username?.trim() || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username and password are required",
        });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters",
        });
    }
    if (await Admin.findOne({ username: username.trim() })) {
      return res
        .status(409)
        .json({ success: false, message: "Username already taken" });
    }

    const isSuper = role === "superadmin";
    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      username: username.trim(),
      password: hashed,
      name: (name || "").trim(),
      role: isSuper ? "superadmin" : "admin",
      permissions: isSuper
        ? []
        : (permissions || []).filter((p) => ADMIN_PERMISSIONS.includes(p)),
      createdBy: req.admin.id,
    });

    const safe = admin.toObject();
    delete safe.password;
    res
      .status(201)
      .json({ success: true, message: "Admin created", admin: safe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const { name, role, permissions, isActive, password } = req.body;
    const admin = await Admin.findById(req.params.id);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });

    const isSelf = String(admin._id) === String(req.admin.id);
    if (
      isSelf &&
      role &&
      role !== "superadmin" &&
      admin.role === "superadmin"
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot demote your own account",
        });
    }
    if (isSelf && isActive === false) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot deactivate your own account",
        });
    }

    if (name !== undefined) admin.name = name.trim();
    if (role !== undefined)
      admin.role = role === "superadmin" ? "superadmin" : "admin";
    if (permissions !== undefined) {
      admin.permissions =
        admin.role === "superadmin"
          ? []
          : permissions.filter((p) => ADMIN_PERMISSIONS.includes(p));
    }
    if (isActive !== undefined) admin.isActive = isActive;
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 6 characters",
          });
      }
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();
    const safe = admin.toObject();
    delete safe.password;
    res.json({ success: true, message: "Admin updated", admin: safe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    if (String(req.params.id) === String(req.admin.id)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own account",
        });
    }
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin)
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    res.json({ success: true, message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
