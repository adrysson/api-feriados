const Location = require('../models').Location
const ExcludedHoliday = require('../models').ExcludedHoliday
const { Op } = require('sequelize')
const regex = require('./regex')
const Holiday = require('../models').Holiday

module.exports = {
  holidays: {
    carnaval: {
      slug: 'carnaval',
      name: 'Carnaval',
      type: 'Móvel',
      required: false,
    },
    sextaFeiraSanta: {
      slug: 'sexta-feira-santa',
      name: 'Sexta-Feira Santa',
      type: 'Móvel',
      required: true,
    },
    corpusChristi: {
      slug: 'corpus-christi',
      name: 'Corpus Christi',
      type: 'Móvel',
      required: false,
    },
    pascoa: {
      slug: 'pascoa',
      name: 'Páscoa',
      type: 'Móvel',
      required: true,
    },
  },

  /**
   *
   * @param {date} Date
   * @description Retorna o feriado móvel de determinada data, caso exista
   */
  async get(param, location, state = null) {
    const feriadoParam = this.getFeriadoParam(param)

    const paramIsDate = this.isDate(param)
    const mobileHoliday = this.getMobileHoliday(
      feriadoParam,
      location,
      paramIsDate
    )

    if (mobileHoliday) {
      return mobileHoliday
    }

    if (paramIsDate) {
      return await this.getDefaultHoliday(feriadoParam, location, state)
    }
    return null
  },
  async destroy(holiday, location) {
    if (holiday.type === 'Móvel') {
      if (holiday.required) {
        throw {
          status: 403,
          message: `Você não tem permissão para excluir este feriado (${holiday.name})`,
        }
      }
      return await ExcludedHoliday.create({
        location_id: location.id,
        slug: holiday.slug,
      })
    }
    return await holiday.destroy()
  },
  getFeriadoParam(param) {
    if (this.isDate(param, false)) {
      const year = new Date().getFullYear()
      return this.parseDate(`${year}-${param}`)
    }
    if (this.isDate(param)) {
      return this.parseDate(param)
    }
    return param
  },
  isDate(feriadoParam, withYear = true) {
    const regexDate = new RegExp(regex.date(withYear))
    return regexDate.test(feriadoParam)
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
  getMobileHoliday(feriadoParam, location, paramIsDate = true) {
    const year = this.getYear(feriadoParam, paramIsDate)
    this.setDates(year)

    const mobileHoliday = this.findMobileHoliday(feriadoParam, paramIsDate)

    if (mobileHoliday) {
      const holidayExcluded = ExcludedHoliday.findOne({
        where: {
          location_id: location.id,
          slug: mobileHoliday.slug,
        },
      })
      if (!holidayExcluded) {
        return mobileHoliday
      }
    }
    return null
  },
  findMobileHoliday(feriadoParam, paramIsDate) {
    const holidays = Object.values(this.holidays)
    if (paramIsDate) {
      const date = this.getDateString(feriadoParam)

      return holidays.find((holiday) => {
        return holiday.date === date
      })
    }

    return holidays.find((holiday) => {
      return holiday.slug === feriadoParam
    })
  },
  getYear(dateObject, paramIsDate) {
    if (paramIsDate) {
      return dateObject.getFullYear()
    }
    return new Date().getFullYear()
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
