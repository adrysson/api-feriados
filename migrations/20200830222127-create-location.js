'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('locations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      ibge: {
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM('s', 'c'),
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('locations');
  }
};