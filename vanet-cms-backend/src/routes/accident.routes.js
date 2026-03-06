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
    const accidents = await Accident.find().sort({ timestamp: -1 });
    res.json(accidents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;