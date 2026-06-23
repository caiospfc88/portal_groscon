"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Gestores extends Model {
    static associate(models) {
      models.gestores.hasMany(models.leads, {
        foreignKey: "gestor_id",
        as: "leads",
      });
    }
  }
  Gestores.init(
    {
      nome: DataTypes.STRING,
      email: DataTypes.STRING,
      ddds: DataTypes.STRING,
    },
    { sequelize, modelName: "gestores" },
  );
  return Gestores;
};
