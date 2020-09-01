const express = require('express')
const router = express.Router()
const holidayController = require('../controllers').holiday

// Expressões regulares
const regexIbge = '\\d{7}|\\d{2}'
const regexData = '\\d{4}\\-(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])'
const regexDataWithoutYear = '(0[1-9]|1[012])\\-(0[1-9]|[12][0-9]|3[01])'
const regexSlug = '[a-z]+(?:-[a-z]+)*'

/* GET users listing. */
router.get(
  `/:ibge(${regexIbge})/:feriado([a-z]+|${regexSlug}|${regexData})`,
  holidayController.index
)

module.exports = router
