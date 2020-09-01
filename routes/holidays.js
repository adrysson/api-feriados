const express = require('express');
const router = express.Router();
const holidayController = require('../controllers').holiday

/* GET users listing. */
router.get('/:ibge([0-9]{7}|[0-9]{2})', holidayController.index)

module.exports = router;
