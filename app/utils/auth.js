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
module.exports = { verifyJWT };
