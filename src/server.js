require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

/*
-----------------------------
CONNECT DATABASE
-----------------------------
*/

connectDB();

/*
-----------------------------
MIDDLEWARE
-----------------------------
*/

app.use(cors());
app.use(express.json());

/*
-----------------------------
HEALTH CHECK
-----------------------------
*/

app.get("/", (req, res) => {
  res.status(200).send("VANET CMS Backend Running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

/*
-----------------------------
API ROUTES
-----------------------------
*/

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/accidents", require("./routes/accident.routes"));
app.use("/api/rsu", require("./routes/rsu.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/alerts", require("./routes/alerts.routes"));

/*
-----------------------------
ERROR HANDLER
-----------------------------
*/

app.use((err, req, res, next) => {

  console.error(err.stack);

  res.status(500).json({
    message: "Server Error"
  });

});

/*
-----------------------------
START SERVER
-----------------------------
*/

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
