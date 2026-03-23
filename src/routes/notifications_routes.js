const express = require("express");
const router = express.Router();
const Alert = require("../models/Accident");

// GET notifications (alias of alerts)
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });

    // Convert alerts → notifications format if needed
    const notifications = alerts.map(alert => ({
      id: alert._id,
      type: alert.type || "accident",
      message: alert.message || "New alert",
      severity: alert.severity || "info",
      createdAt: alert.createdAt
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
