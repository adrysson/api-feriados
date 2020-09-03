const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')
const neatCsv = require('neat-csv')
;('use strict')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Estados
    const responseStates = fs.readFileSync(
      path.join(__dirname, 'files/states.json')
    )
    const dataStates = JSON.parse(responseStates)
    const states = dataStates.states.map((state) => {
      return {
        id: uuidv4(),
        ibge: state.ibge,
        name: state.UF,
        type: 's',
      }
    })

    // Cidades
    const responseCities = fs.readFileSync(
      path.join(__dirname, 'files/municipios-2019.csv')
    )
    const dataCities = await neatCsv(responseCities)

    const cities = dataCities.map((city) => {
      return {
        id: uuidv4(),
        ibge: city.codigo_ibge,
        name: city.nome,
        type: 'c',
      }
    })

    const locations = states.concat(cities)

    await queryInterface.bulkInsert('locations', locations)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('locations', null, {})
  },
}
