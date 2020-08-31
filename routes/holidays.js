const express = require('express');
const router = express.Router();
const holidayController = require('../controllers').holiday

/* GET users listing. */
router.get('/', holidayController.index);

module.exports = router;
