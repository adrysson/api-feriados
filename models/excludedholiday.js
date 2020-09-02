'use strict'
const { v4: uuidv4 } = require('uuid')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class ExcludedHoliday extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ExcludedHoliday.belongsTo(models.Location, {
        foreignKey: 'location_id',
        as: 'location',
      })
    }
  }
  ExcludedHoliday.init(
    {
      location_id: DataTypes.UUID,
      slug: DataTypes.STRING,
    },
    {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      sequelize,
      modelName: 'ExcludedHoliday',
      tableName: 'excluded_holidays',
    }
  )

  ExcludedHoliday.beforeCreate(
    (excludedHoliday) => (excludedHoliday.id = uuidv4())
  )
  return ExcludedHoliday
}
