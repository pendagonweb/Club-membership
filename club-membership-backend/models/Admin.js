import mongoose from "mongoose";

export const ADMIN_PERMISSIONS = [
  "requests", // approve / reject pending membership requests
  "members", // edit / delete approved & rejected members
  "juniors", // edit / delete junior members
  "panels", // create / edit / delete election panels
  "gallery", // gallery, posters, news, news-cuttings, reports
  "activities", // homepage activities / events
  "logo", // site logo
];

const adminSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash
    name: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["superadmin", "admin"], default: "admin" },
    // Ignored for superadmin — they implicitly have every permission.
    permissions: { type: [String], enum: ADMIN_PERMISSIONS, default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Admin", adminSchema);
