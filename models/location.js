import uuid from 'uuid/v4'
;('use strict')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location.hasMany(models.Holiday, {
        foreignKey: 'location_id',
        as: 'holidays',
      })
    }
  }
  Location.init(
    {
      ibge: DataTypes.INTEGER,
      name: DataTypes.STRING,
      type: DataTypes.ENUM('s', 'c'),
    },
    {
      sequelize,
      modelName: 'Location',
    }
  )

  Location.beforeCreate((location) => (location.id = uuid()))

  return Location
}
