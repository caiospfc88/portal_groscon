const models = require("../../db/models");
require("dotenv").config();
const jwt = require("jsonwebtoken");

async function verifyJWT(req, res, next) {
  const token = req.headers["authorization"];
  if (!token)
    return res
      .status(401)
      .json({ auth: false, message: "Token não fornecido." });

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: "Falha na autenticação do token." });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}
async function criarRootUser() {
  const rootUser = await models.usuarios.findOne({ where: { login: "Admin" } });
  const UserId1 = await models.usuarios.findOne({ where: { id: 1 } });
  if (rootUser !== null) {
    console.log("Usuario root já cadastrado");
  } else if (UserId1 !== null) {
    const rootUser = await models.usuarios.create({
      nome: "Administrador",
      sobrenome: "Portal Groscon",
      login: "Admin",
      senha: process.env.ROOT_USER_PASS,
      email: "ti@consorciogroscon.com.br",
      data_nascimento: "1988-4-07",
      celular: "16991827470",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(rootUser.dataValues);
  } else {
    const rootUser = await models.usuarios.create({
      id: 1,
      nome: "Administrador",
      sobrenome: "Portal Groscon",
      login: "Admin",
      senha: process.env.ROOT_USER_PASS,
      email: "ti@consorciogroscon.com.br",
      data_nascimento: "1988-4-07",
      celular: "16991827470",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(rootUser.dataValues);
  }
}

module.exports = { verifyJWT, criarRootUser };
