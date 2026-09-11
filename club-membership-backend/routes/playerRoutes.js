// routes/playerRoutes.js
import express from "express";
import {
  fetchMemberByMembershipId,
  registerPlayer,
  getAllPlayers,
} from "../controller/playerController.js";
import {
  listTournaments,
  createTournament,
  activateTournament,
  closeTournament,
  deleteTournament,
} from "../controller/tournamentController.js";

const router = express.Router();

// Public: lookup membership + register player (unchanged behaviour/shape)
router.get("/lookup/:membershipId", fetchMemberByMembershipId);
router.post("/register", registerPlayer);

// Admin: view all registrations (optionally ?tournamentId=...)
router.get("/all", getAllPlayers);

// Tournament management  used by the (password-gated) admin Player List page
router.get("/tournaments", listTournaments);
router.post("/tournaments", createTournament);
router.patch("/tournaments/:id/activate", activateTournament);
router.patch("/tournaments/:id/close", closeTournament);
router.delete("/tournaments/:id", deleteTournament);

export default router;
