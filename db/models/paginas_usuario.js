"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Paginas_usuario extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.paginas_usuario.belongsTo(models.usuarios, {
        foreignKey: "id_usuario",
      });
      models.paginas_usuario.belongsTo(models.paginas_portal, {
        foreignKey: "id_pagina",
      });
    }
  }
  Paginas_usuario.init(
    {
      id_pagina: DataTypes.INTEGER,
      id_usuario: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "paginas_usuario",
      freezeTableName: true,
    }
  );
  return Paginas_usuario;
};
