// Required files
const express = require('express');
const { reminderValidationRules, validate } = require('../models/validator');

// Required Controller
const iReminderControllers = require('../controllers/iReminder-controller');


const router = express.Router();

router.post('/add', reminderValidationRules(), validate, iReminderControllers.createReminder);

router.put('/edit/:id', reminderValidationRules(), validate, iReminderControllers.editReminder);

router.get('/', iReminderControllers.getAllReminders);

router.get('/reminder/:id', iReminderControllers.getReminder);

router.delete('/delete/:id', iReminderControllers.deleteReminder);


module.exports = router;