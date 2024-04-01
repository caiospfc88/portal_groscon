const models = require("../../db/models");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.logar = async function (req, res) {
  var user = await models.usuarios.findOne({
    where: { login: req.body.login },
  });
  //console.log("usuario login: ", user);
  if (
    req.body.login == user.login &&
    (await user.validarSenha(req.body.senha))
  ) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 14400,
    });
    return res.json({ auth: true, token: token });
  } else {
    res.status(500).json({ message: "Login inválido!" });
  }
};

module.exports.home = async function (application, req, res) {
  res.send("Faça o login!!!");
};
