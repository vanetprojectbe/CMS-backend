const mongoose = require("mongoose");

const EmergencyServiceSchema = new mongoose.Schema({

  name: String,

  type: {
    type: String,
    enum: ["hospital", "police", "fire"]
  },

  latitude: Number,
  longitude: Number,

  phone: String,
  email: String

});

module.exports = mongoose.model("EmergencyService", EmergencyServiceSchema);
