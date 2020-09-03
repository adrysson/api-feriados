'use strict'
const { v4: uuidv4 } = require('uuid')
const { Model } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  class Holiday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Holiday.belongsTo(models.Location, {
        foreignKey: 'location_id',
        as: 'location',
      })
    }
  }
  Holiday.init(
    {
      name: DataTypes.STRING,
      day: DataTypes.INTEGER,
      month: DataTypes.INTEGER,
      year: DataTypes.INTEGER,
      type: {
        type: DataTypes.ENUM('n', 's', 'c'),
        get(column) {
          const value = this.getDataValue(column)

          if (value === 'n') {
            return 'Nacional'
          }
          if (value === 's') {
            return 'Estadual'
          }
          if (value === 'c') {
            return 'Local'
          }
          return null
        },
      },
      location_id: DataTypes.UUID,
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      sequelize,
      modelName: 'Holiday',
      tableName: 'holidays',
    }
  )

  Holiday.beforeCreate((holiday) => (holiday.id = uuidv4()))

  return Holiday
}
