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

      const date = new Date(req.params.feriado)
      const day = dateFormat(date, 'dd')
      const month = dateFormat(date, 'mm')
      const year = dateFormat(date, 'yyyy')

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
        return res.status(200).send(holiday)
      }

      return res.status(404).send({
        message: `Não foi encontrado nenhum feriado nesta data para ${location.name}`,
      })
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

  getById(req, res) {
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
        return res.status(200).send(holiday)
      })
      .catch((error) => {
        console.log(error)
        res.status(400).send(error)
      })
  },

  add(req, res) {
    return Holiday.create({
      class_name: req.body.class_name,
    })
      .then((holiday) => res.status(201).send(holiday))
      .catch((error) => res.status(400).send(error))
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

  delete(req, res) {
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
