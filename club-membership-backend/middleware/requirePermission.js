export default function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    if (req.admin.role === "superadmin") return next();
    if (req.admin.permissions?.includes(permission)) return next();

    return res.status(403).json({
      success: false,
      message: `You don't have "${permission}" access. Ask the superadmin to grant it.`,
    });
  };
}