'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RetornoCobranca extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RetornoCobranca.init({
    Contrato: DataTypes.STRING,
    Valor: DataTypes.DECIMAL,
    StatusID: DataTypes.INTEGER,
    Status: DataTypes.STRING,
    EnviaEmail: DataTypes.BOOLEAN,
    UrlPagamento: DataTypes.STRING,
    Hash: DataTypes.STRING,
    CodigoERP: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RetornoCobranca',
    tableName: 'retornocobrancas', // força o nome exato no DB
  freezeTableName: true
  });
  return RetornoCobranca;
};