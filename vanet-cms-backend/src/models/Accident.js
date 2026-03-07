const mongoose = require("mongoose");

const AccidentSchema = new mongoose.Schema({
  rsuId: String,
  vehicleId: String,
  severity: String,
  latitude: Number,
  longitude: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Accident", AccidentSchema);