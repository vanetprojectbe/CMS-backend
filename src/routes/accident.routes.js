// accident_routes.js — top of file
const express = require("express");
const axios   = require("axios");
const Accident = require("../models/Accident");
const findNearest = require("../utils/findNearest");
const sendAlert   = require("../utils/sendAlert");
const router = express.Router();

// POST /api/accidents — RSU sends data (no auth for now, add x-api-key later)
router.post("/", async (req, res) => {
  try {
    const { rsuId, vehicleId, latitude, longitude, features, description } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing GPS coordinates" });
    }

    let severity = "UNKNOWN";
    let confidence = 0;

    if (features && process.env.ML_SERVICE_URL) {
      try {
        const mlResp = await axios.post(
          process.env.ML_SERVICE_URL + "/predict", features, { timeout: 5000 }
        );
        severity   = mlResp.data.severity   || "UNKNOWN";
        confidence = mlResp.data.confidence || 0;
      } catch (mlErr) {
        console.error("ML service failed:", mlErr.message);
      }
    }

    const accident = new Accident({
      rsuId, vehicleId, latitude, longitude,
      severity, confidence, description, status: "open"
    });
    await accident.save();
    console.log("✅ Accident saved:", accident._id);

    let nearestServices = [];
    try {
      nearestServices = await findNearest(latitude, longitude);
    } catch (geoErr) {
      console.error("Geo lookup failed:", geoErr.message);
    }

    for (const service of nearestServices) {
      try { await sendAlert(service, accident); }
      catch (e) { console.error(`Alert failed for ${service.name}:`, e.message); }
    }

    res.json({ message: "Accident processed", accident, notified: nearestServices.length });

  } catch (err) {
    console.error("Accident error:", err);
    res.status(500).json({ error: "Accident processing failed" });
  }
});

// GET /api/accidents — dashboard fetch (open for now)
router.get("/", async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { vehicleId: { $regex: search, $options: "i" } },
      { severity:  { $regex: search, $options: "i" } }
    ];

    const accidents = await Accident.find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json(accidents);

  } catch (err) {
    console.error("Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch accidents" });
  }
});

// PATCH /api/accidents/:id/resolve
router.patch("/:id/resolve", async (req, res) => {
  try {
    const accident = await Accident.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    );
    if (!accident) return res.status(404).json({ error: "Not found" });
    res.json(accident);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
