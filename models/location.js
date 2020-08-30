'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Location.init({
    ibge: DataTypes.INTEGER,
    name: DataTypes.STRING,
    type: DataTypes.ENUM('s', 'c')
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};