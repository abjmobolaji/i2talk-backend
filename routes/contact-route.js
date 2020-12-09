// Required files
const express = require('express');
const { contactValidationRules, validate } = require('../models/validator');

// Required Controllers
const contactController = require('../controllers/contact-controller')

const router = express.Router();

router.post('/', contactValidationRules(), validate, contactController.contact)


module.exports = router;