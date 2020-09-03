const service = require('../services/holiday')

module.exports = {
  async index(req, res) {
    try {
      const location = await service.getLocation(req.params.ibge)

      const state = await service.getState(req.params.ibge)

      const date = req.params.feriado

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

      const date = req.params.feriado

      const holiday = await service.get(date, location, state)

      if (holiday) {
        if (
          holiday.type === 'Nacional' ||
          (holiday.type === 'Móvel' && holiday.required)
        ) {
          throw {
            status: 403,
            message: `Não é possível adicionar um feriado na data de um feriado nacional (${holiday.name})`,
          }
        }

        if (holiday.type === 'Móvel') {
          return res.status(200).send(service.getResponse(holiday))
        }

        const holidayUpdated = await service.update(req.body, holiday)
        return res.status(200).send(service.getResponse(holidayUpdated))
      }

      const holidayCreated = await service.create(req.body, location, date)
      return res.status(201).send(service.getResponse(holidayCreated))
    } catch (error) {
      return service.getResponseErrors(error, res)
    }
  },
  async destroy(req, res) {
    try {
      const location = await service.getLocation(req.params.ibge)

      const state = await service.getState(req.params.ibge)

      const date = req.params.feriado

      const holiday = await service.get(date, location, state)

      if (!holiday) {
        throw {
          status: 404,
          message: 'Feriado não encontrado',
        }
      }

      if (holiday.type === 'Nacional') {
        throw {
          status: 403,
          message: `Não é possível excluir um feriado nacional (${holiday.name})`,
        }
      }

      if (holiday.type === 'Estadual' && location.type === 'Local') {
        throw {
          status: 403,
          message: `Não é possível excluir um feriado estadual (${holiday.name}) em um município`,
        }
      }

      await service.destroy(holiday, location)
      return res.status(204).send()
    } catch (error) {
      return service.getResponseErrors(error, res)
    }
  },
}
