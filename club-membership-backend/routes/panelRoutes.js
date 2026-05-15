import express from "express";
import {
  createPanel,
  getAllPanels,
  getPanelById,
  updatePanel,
  togglePanelStatus,
  deletePanel,
} from "../controller/panelController.js";
import adminAuth from "../middleware/adminauth.js";

const router = express.Router();

router.post("/", adminAuth, createPanel);
router.get("/", getAllPanels);         // public — users need this to see panels
router.get("/:id", getAllPanels);      // public
router.patch("/:id", adminAuth, updatePanel);
router.patch("/:id/toggle", adminAuth, togglePanelStatus);
router.delete("/:id", adminAuth, deletePanel);

export default router;