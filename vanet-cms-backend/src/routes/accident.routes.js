const express = require("express");
const axios = require("axios");
const Accident = require("../models/Accident");

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

    let severity = "UNKNOWN";
    let confidence = 0;

    /*
    -----------------------------
    CALL ML MICROSERVICE
    -----------------------------
    */

    if (features) {

      const mlResponse = await axios.post(
        process.env.ML_SERVICE_URL + "/predict",
        features
      );

      severity = mlResponse.data.severity;
      confidence = mlResponse.data.confidence;

    }

    /*
    -----------------------------
    SAVE ACCIDENT
    -----------------------------
    */

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

    res.json({
      message: "Accident saved successfully",
      accident
    });

  } catch (error) {

    console.error("Accident processing error:", error.message);

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

    res.status(500).json({ error: error.message });

  }

});

module.exports = router;
