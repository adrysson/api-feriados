module.exports = {
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

  /**
   *
   * @param {date} Date
   * @description Retorna o feriado móvel de determinada data, caso exista
   */
  get(date) {
    const year = date.getFullYear()
    const pascoa = this.getPascoa(year)
    const carnaval = this.getCarnaval(pascoa)
    const corpusChristi = this.getCorpusChristi(pascoa)
    const sextaFeiraSanta = this.getSextaFeiraSanta(pascoa)
    return null
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
    return new Date(`${year}-${month}-${day}`)
  },
  /**
   *
   * @param {date} Date
   * @description Retorna a data da terça-feira de carnaval de acordo com a data da páscoa
   */
  getCarnaval(pascoa) {
    const carnaval = new Date(pascoa)
    carnaval.setDate(carnaval.getDate() - 47)
    return carnaval
  },
  /**
   *
   * @param {date} Date
   * @description Retorna a data do feriado de corpus christi de acordo com a data da páscoa
   */
  getCorpusChristi(pascoa) {
    const corpusChristi = new Date(pascoa)
    corpusChristi.setDate(corpusChristi.getDate() + 60)
    return corpusChristi
  },
  /**
   *
   * @param {date} Date
   * @description Retorna a data da sexta-feira santa de acordo com a data da páscoa
   */
  getSextaFeiraSanta(pascoa) {
    const sextaFeiraSanta = new Date(pascoa)
    sextaFeiraSanta.setDate(sextaFeiraSanta.getDate() - 2)
    return sextaFeiraSanta
  },
}
