import uuid from 'uuid/v4'
;('use strict')
import { Model } from 'sequelize'
export default (sequelize, DataTypes) => {
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
      date: DataTypes.DATE,
      type: DataTypes.ENUM,
      locationId: DataTypes.UUID,
      slug: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Holiday',
    }
  )

  Holiday.beforeCreate((holiday) => (holiday.id = uuid()))

  return Holiday
}
