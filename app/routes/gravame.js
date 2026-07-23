// app/routes/gravame.js
const { verifyJWT } = require("../utils/auth");

module.exports = function (application) {
  application.get("/listarGravames", verifyJWT, function (req, res) {
    application.app.controllers.gravame.listarGravames(req, res);
  });

  application.post("/cadastrarGravame", verifyJWT, function (req, res) {
    application.app.controllers.gravame.cadastrarGravame(req, res);
  });
};
