const express = require("express");
const axios   = require("axios");

const Accident            = require("../models/Accident");
const findNearest         = require("../utils/findNearest");
const sendAlert           = require("../utils/sendalert");
const sendTelegramAlert   = require("../utils/sendTelegramAlert");
const { requireApiKey }   = require("../middleware/auth_middleware");

const router = express.Router();

// ── POST /api/accidents ───────────────────────────────────────────────────────
// Called by RSU — requires x-api-key header
router.post("/", requireApiKey, async (req, res) => {
  try {
    const body = req.body;

    // Map OBU EAM fields — RSU forwards the raw JSON from OBU
    const latitude  = body.latitude  || body.lat;
    const longitude = body.longitude || body.lon;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Missing GPS coordinates" });
    }

    let severity   = "UNKNOWN";
    let confidence = 0;

    // ── ML classification ───────────────────────────────────────────────────
    const mlFeatures = body.features || {
      acc:   body.acc,
      gyro:  body.gyro,
      vib:   body.vib,
      temp:  body.temp,
      abag:  body.abag,
      wdrop: body.wdrop,
      spd:   body.spd,
      cons:  body.cons,
      idur:  body.idur
    };

    if (process.env.ML_SERVICE_URL) {
      try {
        const mlResp = await axios.post(
          process.env.ML_SERVICE_URL + "/predict",
          mlFeatures,
          { timeout: 5000 }
        );
        severity   = mlResp.data.severity   || "UNKNOWN";
        confidence = mlResp.data.confidence || 0;
      } catch (mlErr) {
        console.error("[ML] Service failed:", mlErr.message);
      }
    }

    // ── Save accident ───────────────────────────────────────────────────────
    const accident = new Accident({
      rsuId:     body.rsuId,
      vehicleId: body.vehicleId,
      latitude,
      longitude,
      severity,
      confidence,
      description: body.description,
      status: "open",
      features: mlFeatures,
      eam: {
        acc:   body.acc,
        gyro:  body.gyro,
        a6050: body.a6050,
        a9250: body.a9250,
        cons:  body.cons,
        idur:  body.idur,
        vib:   body.vib,
        temp:  body.temp,
        abag:  body.abag,
        wdrop: body.wdrop,
        spd:   body.spd,
        hh:    body.hh,
        mm:    body.mm,
        ss:    body.ss
      }
    });

    await accident.save();
    console.log("[CMS] Accident saved:", accident._id);

    // ── Find nearest emergency services ─────────────────────────────────────
    let nearestServices = [];
    try {
      nearestServices = await findNearest(latitude, longitude);
    } catch (geoErr) {
      console.error("[CMS] Geo lookup failed:", geoErr.message);
    }

    // ── Send per-service alerts (hospital / police / fire) ───────────────────
    for (const service of nearestServices) {
      try {
        await sendAlert(service, accident);
      } catch (alertErr) {
        console.error(`[CMS] Alert failed for ${service.name}:`, alertErr.message);
      }
    }

    // ── Send general Telegram alert (broadcast channel) ─────────────────────
    try {
      await sendTelegramAlert(accident);
    } catch (tgErr) {
      console.error("[CMS] Telegram broadcast failed:", tgErr.message);
    }

    res.json({
      message:  "Accident processed successfully",
      id:       accident._id,
      severity,
      notified: nearestServices.length
    });

  } catch (err) {
    console.error("[CMS] Accident processing error:", err);
    res.status(500).json({ error: "Accident processing failed" });
  }
});

// ── GET /api/accidents ────────────────────────────────────────────────────────
// Dashboard — requires JWT
const { requireAuth } = require("../middleware/auth_middleware");

router.get("/", requireAuth, async (req, res) => {
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
    console.error("[CMS] Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch accidents" });
  }
});

// ── PATCH /api/accidents/:id/resolve ─────────────────────────────────────────
router.patch("/:id/resolve", requireAuth, async (req, res) => {
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
