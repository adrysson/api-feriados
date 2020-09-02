const express = require('express')
const router = express.Router()
const holidayController = require('../controllers').holiday
const regex = require('../services/regex')

/* GET holidays listing. */
router.get(
  `/:ibge(${regex.ibge()})/:feriado((${regex.date()}))`,
  holidayController.index
)
router.put(
  `/:ibge(${regex.ibge()})/:feriado((${regex.date(false)}|${regex.slug}))`,
  holidayController.update
)
router.delete(
  `/:ibge(${regex.ibge()})/:feriado((${regex.date(false)}|${regex.slug}))`,
  holidayController.destroy
)

module.exports = router
