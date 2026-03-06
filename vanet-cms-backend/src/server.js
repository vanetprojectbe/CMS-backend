require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("VANET CMS Backend Running");
});

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/accidents", require("./routes/accident.routes"));
app.use("/api/rsu", require("./routes/rsu.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});