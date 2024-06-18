const express = require("express");
const bodyParser = require("body-parser");
const consign = require("consign");
const session = require("express-session");
var app = express();

//app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(
  session({
    secret: "groscon@1035",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://192.168.201.116:5173/");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

consign()
  .include("app/routes")
  .then("config/dbConnection.js")
  .then("app/models")
  .then("app/controllers")
  .into(app);

module.exports = app;
