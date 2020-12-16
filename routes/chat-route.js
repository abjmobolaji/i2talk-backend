// Required files
const express = require('express');
// const { reminderValidationRules, validate } = require('../models/validator');

// Required Controller
const chatControllers = require('../controllers/chat-controllers');
const auth = require('../middleware/auth');


const router = express.Router();



router.get('/:id', auth.authenticateUser, chatControllers.getAllCurrentChats);

router.get('/messages/:id', auth.authenticateUser, chatControllers.getChatMessages);

module.exports = router;