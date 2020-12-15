// Required files
const express = require('express');
// const { reminderValidationRules, validate } = require('../models/validator');

// Required Controller
const chatRoomsControllers = require('../controllers/chatroom-controller');
const auth = require('../middleware/auth');


const router = express.Router();


router.get('/', auth.authenticateUser, chatRoomsControllers.getAllChatRooms);

router.get('/:id', auth.authenticateUser, chatRoomsControllers.getChatRoom);


module.exports = router;