const express = require("express");
const bodyParser = require("body-parser");
const consign = require("consign");
const session = require("express-session");
const { criptografaSenha } = require("../app/utils/auth");
const hash = criptografaSenha("tempDev2023");
console.log("server", hash);
var app = express();

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(
  session({
    secret: "groscon@1035",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

consign()
  .include("app/routes")
  .then("config/dbConnection.js")
  .then("app/models")
  .then("app/controllers")
  .into(app);

module.exports = app;
