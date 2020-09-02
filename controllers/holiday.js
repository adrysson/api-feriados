const Holiday = require('../models').Holiday
const Location = require('../models').Location
const mobileHolidays = require('../services/mobileHolidays')
const dateFormat = require('dateformat')
const { Op } = require('sequelize')

module.exports = {
  async index(req, res) {
    try {
      const location = await Location.findOne({
        where: {
          ibge: req.params.ibge,
        },
      })

      if (!location) {
        return res.status(404).send({
          message: 'O código do IBGE informado não existe na base de dados',
        })
      }

      // Estado do código IBGE
      const ibgeState = req.params.ibge.substring(0, 2)
      let state = null
      // Se o código não pertence a um estado, buscar esse estado
      if (ibgeState !== req.params.ibge) {
        state = await Location.findOne({
          where: {
            ibge: ibgeState,
          },
        })

        if (!state) {
          return res.status(404).send({
            message: 'O código do IBGE informado não existe na base de dados',
          })
        }
      }

      const feriadoExploded = req.params.feriado.split('-')

      const date = new Date(
        parseInt(feriadoExploded[0]),
        parseInt(feriadoExploded[1]) - 1,
        parseInt(feriadoExploded[2])
      )

      const day = date.getUTCDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()

      // Condições de busca de feriados
      const conditions = [
        // Feriados nacionais
        { type: 'n' },
        // Feriados móveis ou locais
        {
          location_id: location.id,
          year,
        },
      ]

      if (state) {
        // Feriados estaduais
        conditions.push({
          type: 's',
          location_id: state.id,
          year,
        })
      }

      // Buscando feriados móveis
      const mobileHoliday = mobileHolidays.get(date)

      // Remover feriados excluídos pelos usuários

      if (mobileHoliday) {
        return res.status(200).send(mobileHoliday)
      }

      // Buscando feriado
      const holiday = await Holiday.findOne({
        where: {
          day,
          month,
          [Op.or]: conditions,
        },
      })

      if (holiday) {
        return res.status(200).send(mobileHolidays.getResponse(holiday))
      }

      return res.status(404).send({
        message: `Não foi encontrado nenhum feriado nesta data para ${location.name}`,
      })
    } catch (error) {
      res.status(400).send(error.message)
    }
  },
  update(req, res) {
    return Holiday.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'students',
        },
      ],
    })
      .then((holiday) => {
        if (!holiday) {
          return res.status(404).send({
            message: 'Holiday Not Found',
          })
        }
        return holiday
          .update({
            class_name: req.body.class_name || holiday.class_name,
          })
          .then(() => res.status(200).send(holiday))
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },
  destroy(req, res) {
    return Holiday.findByPk(req.params.id)
      .then((holiday) => {
        if (!holiday) {
          return res.status(400).send({
            message: 'Holiday Not Found',
          })
        }
        return holiday
          .destroy()
          .then(() => res.status(204).send())
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },
}
