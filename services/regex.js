module.exports = {
  ibgeCity: '\\d{2}',
  ibgeState: '\\d{7}',
  dateYear: '\\d{4}',
  dateMonth: '0[1-9]|1[012]',
  dateDay: '0[1-9]|[12][0-9]|3[01]',
  slug: '[a-z]+|[a-z]+(?:-[a-z]+)*',

  /**
   *
   * @param {type} string
   * @description Retorna a expressão regular de um número do IBGE, podendo ser de um estado (type = state), cidade (type = city) ou ambos (type = all)
   */
  ibge(type = 'all') {
    if (type === 'state') {
      return this.ibgeState
    }
    if (type === 'city') {
      return this.ibgeCity
    }
    if (type === 'all') {
      return `(${this.ibgeState}|${this.ibgeCity})`
    }
    return null
  },
  /**
   *
   * @param {withYear} string
   * @description Retorna a expressão regular de uma data no formato yyyy-mm-dd, podendo ser com o ano (withYear = true) ou sem (withYear = false)
   */
  date(withYear = true) {
    if (withYear) {
      return `(${this.dateYear})\\-(${this.dateMonth})\\-(${this.dateDay})`
    }
    return `(${this.dateMonth})\\-(${this.dateDay})`
  },
}
