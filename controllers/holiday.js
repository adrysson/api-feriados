const Holiday = require('../models').Holiday
const Location = require('../models').Location
const regex = require('../services/regex')
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

      const feriadoParam = req.params.feriado

      // Se foi enviado uma data
      if (feriadoParam.match(regex.date())) {
        const stringDate = feriadoParam.split('-').reverse().join('-')
        const date = new Date(stringDate)
        const day = dateFormat(date, 'dd')
        const month = dateFormat(date, 'mm')
        const year = dateFormat(date, 'yyyy')

        // Buscando feriados
        const holidays = await Holiday.findOne({
          where: {
            day,
            month,
            [Op.or]: [
              { type: 'n' },
              {
                location_id: location.id,
                year,
              },
            ],
          },
        })

        if (holidays) {
          return res.status(200).send(holidays)
        }

        return res.status(404).send({
          message: `Não foi encontrado nenhum feriado nesta data para ${location.name}`,
        })
      }
      // const nationalHolidays = await holiday.findOne({
      //   where: {

      //   }
      // })

      // Feriados móveis

      // Feriados estaduais/municipais

      return holiday
        .findOne({
          // where: {
          //   ibge: req.params.ibge
          // },
          order: [['created_at', 'DESC']],
        })
        .then((holidays) => {
          res.status(200).send(holidays)
        })
    } catch (error) {
      res.status(400).send(error)
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
