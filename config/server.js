const express = require("express");
const bodyParser = require("body-parser");
const consign = require("consign");
const session = require("express-session");
const cors = require("cors");
var app = express();

const corsOptions = {
  origin: "https://192.168.201.116:3030/*",
  optionsSuccessStatus: 200,
};
//app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

consign()
  .include("app/routes")
  .then("config/dbConnection.js")
  .then("app/models")
  .then("app/controllers")
  .into(app);

module.exports = app;
