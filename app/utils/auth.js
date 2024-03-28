require("dotenv-safe").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function criptografaSenha(senha) {
  await bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(senha, salt, function (err, hash) {
      console.log("hash", hash);
      return hash;
      // Store hash in your password DB.
    });
  });
}
async function verifyJWT(req, res, next) {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(401).json({ auth: false, message: "No token provided." });

  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .json({ auth: false, message: "Failed to authenticate token." });

    // se tudo estiver ok, salva no request para uso posterior
    req.userId = decoded.id;
    next();
  });
}
module.exports = { criptografaSenha, verifyJWT };
