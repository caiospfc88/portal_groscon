"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Paginas_portal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Paginas_portal.init(
    {
      descricao: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "paginas_portal",
      freezeTableName: true,
    }
  );

  Paginas_portal.associate = (models) => {
    models.paginas_portal.belongsToMany(models.usuarios, {
      through: models.paginas_usuario,
      foreignKey: "id_pagina",
      otherKey: "id_usuario",
    });
  };

  return Paginas_portal;
};
