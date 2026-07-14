import express from "express";
import {
  castVote,
  getVoteStatus,
  getResults,
  getNriVotingStatus,
} from "../controller/voteController.js";
import adminAuth from "../middleware/adminauth.js";
import userAuth from "../middleware/userAuth.js";
import anyAuth from "../middleware/anyAuth.js";

const router = express.Router();

router.post("/cast", userAuth, castVote);
router.get("/status", userAuth, getVoteStatus);
router.get("/results", anyAuth, getResults);
router.get("/nri-status", userAuth, getNriVotingStatus);

export default router;
