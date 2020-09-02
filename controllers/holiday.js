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
      return service.getResponseErrors(error, res)
    }
  },
  async update(req, res) {
    try {
      const location = await service.getLocation(req.params.ibge)

      const state = await service.getState(req.params.ibge)

      const year = new Date().getFullYear()
      const date = service.parseDate(`${year}-${req.params.feriado}`)

      const holiday = await service.get(date, location, state)
      console.log(holiday)
      if (holiday) {
        console.log(holiday)
        if (['Nacional', 'Móvel'].includes(holiday.type)) {
          throw {
            status: 403,
            message: `Não é possível adicionar um feriado na data de um feriado nacional (${holiday.name})`,
          }
        }
        const locationUpdated = await service.update(req.body, holiday)
        return res.status(200).send(service.getResponse(locationUpdated))
      }

      const locationCreated = await service.create(req.body, location, date)
      return res.status(201).send(service.getResponse(locationCreated))
    } catch (error) {
      return service.getResponseErrors(error, res)
    }
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
