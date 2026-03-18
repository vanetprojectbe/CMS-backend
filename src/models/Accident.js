const mongoose = require("mongoose");

const AccidentSchema = new mongoose.Schema({

  rsuId: String,

  vehicleId: String,

  severity: String,

  confidence: Number,

  latitude: Number,

  longitude: Number,

  features: Object,

  status: {
    type: String,
    default: "open"
  },

  description: String,

  timestamp: {
    type: Date,
    default: Date.now
  },

  resolvedAt: Date

});

module.exports = mongoose.model("Accident", AccidentSchema);
