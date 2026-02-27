import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import connectCloudinary from "./config/cloudinary.js";

import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import membershipCardRoute from "./routes/membershipCard.js";
import memberAuthRoutes from "./routes/memberAuth.js";

dotenv.config();

const app = express();

/* DB Connection */
if (!mongoose.connection.readyState) {
  mongoose.set("bufferCommands", false);
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
}

/* Cloudinary */
connectCloudinary();

/* CORS */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://kingstareriyapady.club",
      "https://membership-front.vercel.app"
    ],
    credentials: true
  })
);

/* Body parsers */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.use("/api/auth", authRoutes);
app.use("/api/member", memberAuthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", membershipCardRoute);

app.get("/", (req, res) => {
  res.send("✅ Club Membership API running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
});


/* Export for Vercel */
export default app;
