'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('excluded_holidays', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      location_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
      },
      holiday_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'locations',
          },
        },
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('m', 'n'),
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('excluded_holidays')
  }
};