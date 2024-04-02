"use strict";
const { Model } = require("sequelize");
require("dotenv").config();
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    static associate(models) {
      // define association here
    }
  }
  Usuarios.init(
    {
      nome: DataTypes.STRING,
      sobrenome: DataTypes.STRING,
      login: DataTypes.STRING,
      senha: DataTypes.STRING,
      email: DataTypes.STRING,
      data_nascimento: DataTypes.DATE,
      celular: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "usuarios",
    }
  );

  Usuarios.associate = (models) => {
    models.usuarios.hasMany(models.mural_descricao);
    models.usuarios.belongsToMany(models.paginas_portal, {
      through: models.paginas_usuario,
    });
  };

  Usuarios.addHook("beforeCreate", async (usuarios) => {
    const hash = await bcrypt.hash(usuarios.senha, 10);
    usuarios.senha = hash;
  });

  Usuarios.addHook("beforeUpdate", async (usuarios) => {
    const hash = await bcrypt.hash(usuarios.senha, 10);
    usuarios.senha = hash;
  });

  Usuarios.prototype.validarSenha = async function (senha) {
    return await bcrypt.compare(senha, this.senha);
  };

  return Usuarios;
};
