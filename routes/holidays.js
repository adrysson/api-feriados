const express = require('express')
const router = express.Router()
const holidayController = require('../controllers').holiday
const regex = require('../services/regex')

/* GET holidays listing. */
router.get(
  `/:ibge(${regex.ibge()})/:feriado((${regex.date()}|[a-z]+|${regex.slug}))`,
  holidayController.index
)

module.exports = router
