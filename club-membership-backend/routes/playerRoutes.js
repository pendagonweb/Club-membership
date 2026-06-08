// routes/playerRoutes.js
import express from "express";
import {
  fetchMemberByMembershipId,
  registerPlayer,
  getAllPlayers,
} from "../controller/playerController.js";
import adminAuth from "../middleware/adminauth.js";

const router = express.Router();

// Public: lookup membership
router.get("/lookup/:membershipId", fetchMemberByMembershipId);
// Public: register player
router.post("/register", registerPlayer);

// Admin only: view all registrations
router.get("/all", adminAuth, getAllPlayers);

export default router;