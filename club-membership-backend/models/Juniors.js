// club-membership-backend/models/Juniors.js
import mongoose from "mongoose";

const juniorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  fatherName: {
    type: String,
    required: true,
    trim: true,
  },

  dob: {
    type: Date,
    default: null,
  },

  occupation: {
    type: String,
    required: true,
    trim: true,
  },

  mobile: {
    type: String,
    required: true,
    trim: true,
  },

  place: {
    type: String,
    default: "",
  },
  membershipId: {
    type: String,
    required: true,
    unique: true,
  },

  /* ======================
     CLOUDINARY PHOTO
  ====================== */
  photo: {
    type: String, // secure_url
    default: null,
  },
  photoId: {
    type: String, // public_id
    default: null,
  },
});

export default mongoose.model("Junior", juniorSchema);
