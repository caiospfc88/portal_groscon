"use strict";
const { Model } = require("sequelize");
require("dotenv").config();
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class Usuarios extends Model {
    static associate(models) {
      // define association here
    }

    // Remove senha ao serializar para JSON
    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.senha;
      return values;
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
      acesso: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "usuarios",
    }
  );

  Usuarios.associate = (models) => {
    models.usuarios.hasMany(models.mural_descricao);
    models.usuarios.hasMany(models.retornoCobranca || models.RetornoCobranca, {
      foreignKey: "id_usuario",
      as: "retornos",
    });
    models.usuarios.belongsToMany(models.paginas_portal, {
      through: models.paginas_usuario,
      foreignKey: "id_usuario", // chave definida no pivot que aponta para usuarios
      otherKey: "id_pagina", // chave no pivot que aponta para paginas_portal
    });
    models.usuarios.belongsToMany(models.relatoriosNewcon, {
      through: models.relatoriosNewcon_usuario,
      foreignKey: "id_usuario", // chave no pivot que aponta para usuarios
      otherKey: "relatorio_id", // chave no pivot que aponta para relatoriosNewcon
    });
  };

  // Antes de criar -> hash sempre (como já tinha)
  Usuarios.addHook("beforeCreate", async (usuario) => {
    if (usuario.senha) {
      const hash = await bcrypt.hash(usuario.senha, 10);
      usuario.senha = hash;
    }
  });

  // Antes de atualizar -> hash somente se o campo senha foi alterado e não parece já ser um hash
  Usuarios.addHook("beforeUpdate", async (usuario) => {
    if (usuario.changed && usuario.changed("senha")) {
      const senha = usuario.senha || "";
      // Detecta hashes bcrypt típicos: $2a$, $2b$, $2y$
      const isBcryptHash = /^\$2[aby]\$/.test(senha);
      if (senha && !isBcryptHash) {
        usuario.senha = await bcrypt.hash(senha, 10);
      }
    }
  });

  Usuarios.prototype.validarSenha = async function (senha) {
    return await bcrypt.compare(senha, this.senha);
  };

  return Usuarios;
};
