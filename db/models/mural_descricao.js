'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mural_descricao extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  mural_descricao.init({
    descricao: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'mural_descricao',
  });
  return mural_descricao;
};