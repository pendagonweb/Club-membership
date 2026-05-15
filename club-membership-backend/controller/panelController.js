import Panel from "../models/Panel.js";

// POST /api/panels
export const createPanel = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const panel = await Panel.create({ name, description, members });

    res.status(201).json({
      success: true,
      message: "Panel created successfully",
      panel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/panels
export const getAllPanels = async (req, res) => {
  try {
    const panels = await Panel.find().sort({ createdAt: -1 });

    res.json({ success: true, panels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/panels/:id
export const getPanelById = async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      return res.status(404).json({ success: false, message: "Panel not found" });
    }

    res.json({ success: true, panel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/panels/:id
export const updatePanel = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const panel = await Panel.findByIdAndUpdate(
      req.params.id,
      { name, description, members },
      { new: true, runValidators: true }
    );

    if (!panel) {
      return res.status(404).json({ success: false, message: "Panel not found" });
    }

    res.json({ success: true, message: "Panel updated successfully", panel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/panels/:id/toggle
export const togglePanelStatus = async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);

    if (!panel) {
      return res.status(404).json({ success: false, message: "Panel not found" });
    }

    panel.isActive = !panel.isActive;
    await panel.save();

    res.json({
      success: true,
      message: `Panel ${panel.isActive ? "activated" : "deactivated"} successfully`,
      isActive: panel.isActive,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/panels/:id
export const deletePanel = async (req, res) => {
  try {
    const panel = await Panel.findByIdAndDelete(req.params.id);

    if (!panel) {
      return res.status(404).json({ success: false, message: "Panel not found" });
    }

    res.json({ success: true, message: "Panel deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};