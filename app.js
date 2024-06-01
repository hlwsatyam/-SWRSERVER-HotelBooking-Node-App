const express = require("express");
const app = express();
const cors = require("cors");
const https = require("https");
const errorCreate = require("./errorCreate/errorCreate.js");
const Router = require("./routes/route.js");
const path = require("path");
require("dotenv").config({
  path: "./.env",
});
require("./config/DBconnect.js");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors());
// Mounting the Router at a specific path
app.use("/api", Router);
// Error handling middleware
app.use(errorCreate);
// Server creation
const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log("Server Is Running On port: " + port);
});
