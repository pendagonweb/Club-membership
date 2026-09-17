import jwt from "jsonwebtoken";
import Admin, { ADMIN_PERMISSIONS } from "../models/Admin.js";

export default async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access denied" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Admin account not found or disabled",
        });
    }

    req.admin = {
      id: admin._id.toString(),
      username: admin.username,
      name: admin.name,
      role: admin.role, // "superadmin" | "admin"
      permissions:
        admin.role === "superadmin" ? ADMIN_PERMISSIONS : admin.permissions,
    };

    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
