const express = require("express");
const bodyParser = require("body-parser");
const consign = require("consign");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
var app = express();

const corsOptions = {
  origin: "https://192.168.201.115:3030/*",
  optionsSuccessStatus: 200,
};
//app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(cors({ origin: "*" }));

const pastaAudios = path.join(process.cwd(), "uploads", "audios");

app.use("/audios", express.static(pastaAudios));

app.use(bodyParser.json({ limit: "10mb" })); // Ajuste o valor conforme necessário
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

consign()
  .include("config/dbConnection.js")
  .then("app/models")
  .then("app/controllers")
  .then("app/routes")
  .into(app);

module.exports = app;
