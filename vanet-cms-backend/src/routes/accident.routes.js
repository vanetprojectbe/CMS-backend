const express = require("express");
const Accident = require("../models/Accident");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const accident = new Accident(req.body);
    await accident.save();
    res.json({ message: "Accident saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
