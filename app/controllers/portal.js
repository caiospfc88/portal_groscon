const models = require("../../db/models");

module.exports.inserirMuralDados = async function (application, req, res) {};

module.exports.logar = async function (req, res) {
  var user = await models.usuarios.findOne({
    where: { login: req.body.login },
  });
  console.log("usuario login: ", user);
  if (
    req.body.login == user.login &&
    (await user.validarSenha(req.body.senha))
  ) {
    res.send("Tá logado porra");
  } else {
    res.send("Login inválido");
  }
};

module.exports.home = async function (application, req, res) {
  res.send("Faça o login!!!");
};

module.exports.criarRootUser = async function (application, req, res) {
  const rootUser = await models.usuarios.findOne({ where: { login: "Admin" } });
  console.log("findOne: ", rootUser);
  if (rootUser !== null) {
    res.send("Usuario já cadastrado");
  } else {
    const rootUser = await models.usuarios.create({
      nome: "Administrador",
      sobrenome: "Portal Groscon",
      login: "Admin",
      senha: "tempDev2023",
      email: "ti@consorciogroscon.com.br",
      data_nascimento: "1988-4-07",
      celular: "16991827470",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(rootUser);
    res.send(rootUser.dataValues);
  }
};
