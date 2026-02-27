import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,   // 👈 make false if optional
      trim: true,
    },

    nickname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null,
    },

    dob: {
      type: Date,
      default: null,
    },

    age: {
      type: Number,
      required: true,
      min: 10,
      max: 100,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-" , "Nil"],
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

   phone: {
  type: String,
  required: true,
  unique: true,
  trim: true,
},

whatsapp: {
  type: String,
  required: true,
  trim: true,
},



    /* ======================
       CLOUDINARY PROFILE PHOTO
    ====================== */
    photo: {
      type: String, // secure_url
      default: null,
    },

    photoId: {
      type: String, // public_id
      default: null,
    },

    /* ======================
       CLOUDINARY PAYMENT PROOF
    ====================== */
    paymentProof: {
      type: String, // secure_url
      default: null,
    },

    paymentProofId: {
      type: String, // public_id
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    membershipStatus: {
      type: String,
      enum: ["registered", "pending_approval", "approved", "rejected"],
      default: "pending_approval",
    },

    membershipId: {
  type: String,
  unique: true,
  sparse: true,   // ✅ VERY IMPORTANT
  default: null,
    },
     place: { 
      type: String, 
      default: "" 
    },

    membershipCard: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
