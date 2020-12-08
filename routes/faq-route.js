// Required files
const express = require('express');
const { faqValidationRules, validate } = require('../models/validator');

// Required Controllers
const faqControllers = require('../controllers/faq-controller');

const router = express.Router();

router.get('/', faqControllers.getFaq);

router.post('/add', faqValidationRules(), validate, faqControllers.addFaq);

router.put('/edit/:id', faqValidationRules(), validate, faqControllers.editFaq);

router.delete('/delete/:id', faqControllers.deleteFaq);

module.exports = router;