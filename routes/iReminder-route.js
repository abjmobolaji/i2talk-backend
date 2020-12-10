// Required files
const express = require('express');
const { reminderValidationRules, validate } = require('../models/validator');

// Required Controller
const iReminderControllers = require('../controllers/iReminder-controller');
const auth = require('../middleware/auth');


const router = express.Router();

router.post('/add', auth.authenticateUser, reminderValidationRules(), validate, iReminderControllers.createReminder);

router.put('/edit/:id', auth.authenticateUser, reminderValidationRules(), validate, iReminderControllers.editReminder);

router.get('/', auth.authenticateUser, iReminderControllers.getAllReminders);

router.get('/reminder/:id', auth.authenticateUser, iReminderControllers.getReminder);

router.delete('/delete/:id', auth.authenticateUser, iReminderControllers.deleteReminder);


module.exports = router;