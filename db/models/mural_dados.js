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
    ano: DataTypes.INTEGER,
    mes: DataTypes.INTEGER,
    tipo: DataTypes.INTEGER,
    valor: DataTypes.FLOAT,
    id_mural_descricao: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mural_dados',
  });
  return mural_dados;
};