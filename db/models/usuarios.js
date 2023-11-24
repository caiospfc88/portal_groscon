'use strict';
const {
  Model
} = require('sequelize');

import Bcrypt from 'bcrypt';

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
  Usuarios.init({
    nome: DataTypes.STRING,
    sobrenome: DataTypes.STRING,
    login: DataTypes.STRING,
    senha: DataTypes.STRING,
    email: DataTypes.STRING,
    data_nascimento: DataTypes.DATE,
    celular: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'usuarios',
  });

  Usuarios.associate = models => {
    models.usuarios.hasMany(models.mural_descricao);
  }

  Usuarios.addHook('beforeCreate', async (usuarios) => {
    const hash = await Bcrypt.hash(usuarios.senha, 1035);
    usuarios.senha = hash;
  });

  return Usuarios;
};