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
import requirePermission from "../middleware/requirePermission.js";

const router = express.Router();
const guard = [adminAuth, requirePermission("panels")];

router.post("/", ...guard, createPanel);
router.get("/", getAllPanels);
router.get("/:id", getAllPanels);
router.patch("/:id", ...guard, updatePanel);
router.patch("/:id/toggle", ...guard, togglePanelStatus);
router.delete("/:id", ...guard, deletePanel);

export default router;
