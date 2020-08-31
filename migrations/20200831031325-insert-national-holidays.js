const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
;('use strict')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const response = fs.readFileSync(
      path.join(__dirname, 'files/national-holidays.json')
    )
    const data = JSON.parse(response)
    const holidays = data.holidays.map((holiday) => {
      return {
        id: uuidv4(),
        name: holiday.name,
        day: holiday.day,
        month: holiday.month,
        type: 'n',
        created_at: new Date(),
        updated_at: new Date(),
      }
    })

    await queryInterface.bulkInsert('holidays', holidays)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('holidays', null, {})
  },
}
