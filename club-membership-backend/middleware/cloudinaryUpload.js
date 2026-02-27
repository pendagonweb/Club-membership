import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

/* ======================
   CLOUDINARY STORAGE
====================== */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // ✅ explicitly pass v2 instance
  params: async (req, file) => {
    let folder = "uploads/others";

    // ✅ Member profile photo
    if (file.fieldname === "photo") {
      folder = "members/photos";
    }

    // ✅ Product main image
    if (file.fieldname === "image") {
      folder = "products/images";
    }

    return {
      folder,
      resource_type: "image", // ✅ IMPORTANT
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    };
  },
});

/* ======================
   FILE FILTER
====================== */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"),
      false
    );
  }

  cb(null, true);
};

/* ======================
   MULTER CONFIG
====================== */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
