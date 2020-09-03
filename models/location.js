const { v4: uuidv4 } = require('uuid')
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
      type: {
        type: DataTypes.ENUM('s', 'c'),
        get(column) {
          const value = this.getDataValue(column)

          if (value === 's') {
            return 'Estadual'
          }
          if (value === 'c') {
            return 'Local'
          }
          return null
        },
      },
    },
    {
      timestamps: false,
      sequelize,
      modelName: 'Location',
      tableName: 'locations',
    }
  )

  Location.beforeCreate((location) => (location.id = uuidv4()))

  return Location
}
