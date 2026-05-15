import express from "express";
import { castVote, getVoteStatus, getResults } from "../controller/voteController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js"; // your existing user auth middleware

const router = express.Router();

router.post("/cast", userAuth, castVote);
router.get("/status", userAuth, getVoteStatus);
router.get("/results", adminAuth, getResults); 

export default router;