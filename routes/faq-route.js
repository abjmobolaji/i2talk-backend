// Required files
const express = require('express');
const { faqValidationRules, validate } = require('../models/validator');

// Required Controllers
const faqControllers = require('../controllers/faq-controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', faqControllers.getFaq);

router.post('/add', auth.authenticateUser, auth.authorizeUser("add_faq"), faqValidationRules(), validate, faqControllers.addFaq);

router.put('/edit/:id', auth.authenticateUser, auth.authorizeUser("edit_faq"), faqValidationRules(), validate, faqControllers.editFaq);

router.delete('/delete/:id', auth.authenticateUser, auth.authorizeUser("delete_faq"), faqControllers.deleteFaq);

module.exports = router;