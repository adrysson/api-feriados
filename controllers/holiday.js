const Holiday = require('../models').Holiday
const service = require('../services/holiday')

module.exports = {
  async index(req, res) {
    try {
      const location = await service.getLocation(req.params.ibge)

      const state = await service.getState(req.params.ibge)

      const date = service.parseDate(req.params.feriado)

      const holiday = await service.get(date, location, state)

      if (holiday) {
        return res.status(200).send(service.getResponse(holiday))
      }

      throw {
        status: 404,
        message: `Não foi encontrado nenhum feriado nesta data para ${location.name}`,
      }
    } catch (error) {
      let status = 400
      if (error.status) {
        status = error.status
      }
      return res.status(status).send({
        message: error.message,
      })
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
