'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('holidays', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      name: {
        type: Sequelize.STRING,
      },
      day: {
        type: Sequelize.INTEGER(2),
      },
      month: {
        type: Sequelize.INTEGER(2),
      },
      year: {
        type: Sequelize.INTEGER(4),
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('m', 'n', 's', 'c'),
      },
      location_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            tableName: 'locations',
          },
        },
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('holidays')
  },
}
