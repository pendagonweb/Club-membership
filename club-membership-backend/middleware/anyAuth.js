// middleware/anyAuth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export default async function anyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "admin") {
      // admin token — attach admin info same as adminAuth does
      req.admin = { username: process.env.ADMIN_USERNAME, role: "admin" };
      req.user = decoded; // so controller doesn't break if it reads req.user
    } else {
      // user token — fetch full user from DB same as userAuth does
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }
      req.user = user;
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}