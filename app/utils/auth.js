const JWT = require("jsonwebtoken");
const usuarios = require("../../db/models/usuarios.js");
require("dotenv").config();
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
module.exports = { criptografaSenha };
