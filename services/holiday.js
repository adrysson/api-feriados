module.exports = {
  holidays: {
    carnaval: {
      slug: 'carnaval',
      name: 'Carnaval',
    },
    sextaFeiraSanta: {
      slug: 'sexta-feira-santa',
      name: 'Sexta-Feira Santa',
    },
    corpusChristi: {
      slug: 'corpus-christi',
      name: 'Corpus Christi',
    },
    pascoa: {
      slug: 'pascoa',
      name: 'Páscoa',
    },
  },

  /**
   *
   * @param {date} Date
   * @description Retorna o feriado móvel de determinada data, caso exista
   */
  get(dateObject) {
    const year = dateObject.getFullYear()
    this.setDates(year)

    const date = this.getDateString(dateObject)

    const holiday = Object.values(this.holidays).find((holiday) => {
      return holiday.date === date
    })

    if (holiday) {
      return this.getResponse(holiday)
    }

    return null
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
