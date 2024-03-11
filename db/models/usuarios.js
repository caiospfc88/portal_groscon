"use strict";
const { Model } = require("sequelize");
require("dotenv").config();
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    const hash = await bcrypt.hash(usuarios.senha, process.env.JWT_SECRET);
    usuarios.senha = hash;
  });

  return Usuarios;
};
