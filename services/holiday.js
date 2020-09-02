const Location = require('../models').Location
const { Op } = require('sequelize')
const Holiday = require('../models').Holiday

module.exports = {
  holidays: {
    carnaval: {
      slug: 'carnaval',
      name: 'Carnaval',
      type: 'Móvel',
    },
    sextaFeiraSanta: {
      slug: 'sexta-feira-santa',
      name: 'Sexta-Feira Santa',
      type: 'Móvel',
    },
    corpusChristi: {
      slug: 'corpus-christi',
      name: 'Corpus Christi',
      type: 'Móvel',
    },
    pascoa: {
      slug: 'pascoa',
      name: 'Páscoa',
      type: 'Móvel',
    },
  },

  /**
   *
   * @param {date} Date
   * @description Retorna o feriado móvel de determinada data, caso exista
   */
  async get(date, location, state = null) {
    const mobileHoliday = this.getMobileHoliday(date)

    if (mobileHoliday) {
      // Remover feriados excluídos pelos usuários
      return mobileHoliday
    }

    return await this.getDefaultHoliday(date, location, state)
  },
  async getDefaultHoliday(date, location, state) {
    const conditions = this.getConditionsHolidays(date, location, state)

    const day = date.getUTCDate()
    const month = date.getMonth() + 1

    // Buscando feriado
    return await Holiday.findOne({
      where: {
        day,
        month,
        [Op.or]: conditions,
      },
    })
  },
  getResponseErrors(error, response) {
    let status = 400
    if (error.status) {
      status = error.status
    }
    return response.status(status).send({
      message: error.message,
    })
  },
  async create(body, location, date) {
    try {
      const day = date.getUTCDate()
      const month = date.getMonth() + 1
      const year = date.getFullYear()
      const type = location.ibge.length > 2 ? 'c' : 's'
      return await Holiday.create({
        name: body.name,
        day,
        month,
        year,
        type,
        location_id: location.id,
      })
    } catch (error) {
      throw {
        status: 422,
        message: `Não foi possível cadastrar o feriado para ${location.name}. Tente novamente.`,
      }
    }
  },
  async update(body, holiday) {
    try {
      return await holiday.update({
        name: body.name,
      })
    } catch (error) {
      throw {
        status: 422,
        message: `Não foi possível atualizar o feriado. Tente novamente.`,
      }
    }
  },
  getConditionsHolidays(date, location, state = null) {
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

    return conditions
  },
  getMobileHoliday(dateObject) {
    const year = dateObject.getFullYear()
    this.setDates(year)

    const date = this.getDateString(dateObject)

    return Object.values(this.holidays).find((holiday) => {
      return holiday.date === date
    })
  },
  async getLocation(ibge) {
    const location = await Location.findOne({
      where: {
        ibge,
      },
    })

    if (!location) {
      throw {
        status: 404,
        message: 'O código do IBGE informado não existe na base de dados',
      }
    }

    return location
  },
  async getState(ibgeLocation) {
    // Estado do código IBGE
    const ibge = ibgeLocation.substring(0, 2)
    // Se o código não pertence a um estado, buscar esse estado
    if (ibge !== ibgeLocation) {
      const state = await Location.findOne({
        where: {
          ibge,
        },
      })

      if (!state) {
        throw {
          status: 404,
          message: 'O código do IBGE informado não existe na base de dados',
        }
      }

      return state
    }
    return null
  },
  parseDate(date) {
    const dateExploded = date.split('-')

    return new Date(
      parseInt(dateExploded[0]),
      parseInt(dateExploded[1]) - 1,
      parseInt(dateExploded[2])
    )
  },
  setDates(year) {
    this.holidays.pascoa.date = this.getPascoa(year)
    this.holidays.carnaval.date = this.getCarnaval(this.holidays.pascoa.date)
    this.holidays.corpusChristi.date = this.getCorpusChristi(
      this.holidays.pascoa.date
    )
    this.holidays.sextaFeiraSanta.date = this.getSextaFeiraSanta(
      this.holidays.pascoa.date
    )
  },
  /**
   *
   * @param {year} integer
   * @description Retorna a data da páscoa de determinado ano
   */
  getPascoa(year) {
    const a = year % 19
    const b = Math.floor(year / 100)
    const c = year % 100
    const d = Math.floor(b / 4)
    const e = b % 4
    const f = Math.floor((b + 8) / 25)
    const g = Math.floor((b - f + 1) / 3)
    const h = (19 * a + b - d - g + 15) % 30
    const i = Math.floor(c / 4)
    const k = c % 4
    const l = (32 + 2 * e + 2 * i - h - k) % 7
    const m = Math.floor((a + 11 * h + 22 * l) / 451)
    const month = Math.floor((h + l - 7 * m + 114) / 31)
    const day = 1 + ((h + l - 7 * m + 114) % 31)
    return `${year}-${month}-${day}`
  },
  /**
   *
   * @param {date} Date
   * @description Retorna a data da terça-feira de carnaval de acordo com a data da páscoa
   */
  getCarnaval(pascoa) {
    return this.subtractDate(pascoa, 47)
  },
  /**
   *
   * @param {date} Date
   * @description Retorna a data do feriado de corpus christi de acordo com a data da páscoa
   */
  getCorpusChristi(pascoa) {
    return this.addDate(pascoa, 60)
  },
  /**
   *
   * @param {date} Date
   * @description Retorna a data da sexta-feira santa de acordo com a data da páscoa
   */
  getSextaFeiraSanta(pascoa) {
    return this.subtractDate(pascoa, 2)
  },
  addDate(date, days) {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() + days)
    return this.getDateString(newDate)
  },
  subtractDate(date, days) {
    const newDate = new Date(date)
    newDate.setDate(newDate.getDate() - days)
    return this.getDateString(newDate)
  },
  getDateString(dateObject) {
    const day = ('0' + dateObject.getUTCDate()).slice(-2)
    const month = ('0' + (dateObject.getMonth() + 1)).slice(-2)
    const year = dateObject.getFullYear()
    return `${year}-${month}-${day}`
  },
  getResponse(holiday) {
    return {
      name: holiday.name,
    }
  },
}
