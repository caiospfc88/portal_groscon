'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mural_dados extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mural_dados.init({
    ano_mes: {DataTypes: INTEGER, unique:true, allowNull:false},
    bens_entregues: DataTypes.INTEGER,
    percent_inadimplencia: DataTypes.FLOAT,
    bens_pendentes_entrega: DataTypes.INTEGER,
    recuperacao_cotas: DataTypes.INTEGER,
    boletos_dev_nao_entregues: DataTypes.INTEGER,
    impressoes_n_copias: DataTypes.INTEGER,
    agua: DataTypes.FLOAT,
    luz: DataTypes.FLOAT,
    telefone: DataTypes.FLOAT,
    vendas: DataTypes.INTEGER,
    vendas_franca: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mural_dados',
  });
  return mural_dados;
};