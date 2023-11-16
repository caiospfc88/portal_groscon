'use strict';
const {
  Model
} = require('sequelize');
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
  Paginas_portal.init({
    descricao: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'paginas_portal',
  });
  return Paginas_portal;
};