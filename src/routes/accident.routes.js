const express = require("express");
const axios = require("axios");

const Accident = require("../models/Accident");
const findNearest = require("../utils/findNearest");
const sendAlert = require("../utils/sendAlert");

const router = express.Router();

/*
POST /api/accidents
RSU sends accident data here
*/
router.post("/", async (req, res) => {

  try {

    const {
      rsuId,
      vehicleId,
      latitude,
      longitude,
      features,
      description
    } = req.body;

    /* -----------------------------
       VALIDATION
    ----------------------------- */

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Missing GPS coordinates"
      });
    }

    let severity = "UNKNOWN";
    let confidence = 0;

    /* -----------------------------
       CALL ML MICROSERVICE
    ----------------------------- */

    if (features) {

      try {

        const mlResponse = await axios.post(
          process.env.ML_SERVICE_URL + "/predict",
          features
        );

        severity = mlResponse.data.severity || "UNKNOWN";
        confidence = mlResponse.data.confidence || 0;

      } catch (mlError) {

        console.error("ML service failed:", mlError.message);

      }

    }

    /* -----------------------------
       SAVE ACCIDENT
    ----------------------------- */

    const accident = new Accident({
      rsuId,
      vehicleId,
      latitude,
      longitude,
      severity,
      confidence,
      description,
      status: "open"
    });

    await accident.save();

    console.log("✅ Accident saved:", accident._id);

    /* -----------------------------
       FIND NEAREST SERVICES
    ----------------------------- */

    let nearestServices = [];

    try {

      nearestServices = await findNearest(latitude, longitude);

    } catch (geoError) {

      console.error("Geo lookup failed:", geoError.message);

    }

    /* -----------------------------
       SEND ALERTS
    ----------------------------- */

    for (const service of nearestServices) {

      try {

        await sendAlert(service, accident);

      } catch (alertError) {

        console.error(
          `Alert failed for ${service.name}:`,
          alertError.message
        );

      }

    }

    res.json({
      message: "Accident processed successfully",
      accident,
      notified: nearestServices.length
    });

  } catch (error) {

    console.error("Accident processing error:", error);

    res.status(500).json({
      error: "Accident processing failed"
    });

  }

});


/*
GET /api/accidents
Dashboard fetch accidents
*/

router.get("/", async (req, res) => {

  try {

    const { status, search, limit = 50, offset = 0 } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { vehicleId: { $regex: search, $options: "i" } },
        { severity: { $regex: search, $options: "i" } }
      ];
    }

    const accidents = await Accident.find(filter)
      .sort({ timestamp: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    res.json(accidents);

  } catch (error) {

    console.error("Fetch error:", error.message);

    res.status(500).json({
      error: "Failed to fetch accidents"
    });

  }

});

module.exports = router;