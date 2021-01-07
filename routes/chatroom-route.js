// Required files
const express = require('express');
// const { chatRoomsValidationRules, validate } = require('../models/validator');

// Required Controller
const chatRoomsControllers = require('../controllers/chatroom-controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', chatRoomsControllers.getAllChatRooms);

router.get('/:id', auth.authenticateUser, chatRoomsControllers.getChatRoom);

router.get('/messages/:id', auth.authenticateUser, chatRoomsControllers.getChatRoomMessages);

router.post('/add', auth.authenticateUser, auth.authorizeUser("create_chatroom"), chatRoomsControllers.createChatRoom);

router.put('/edit/:id', auth.authenticateUser, auth.authorizeUser("edit_chatroom"), chatRoomsControllers.editChatRoom);

router.delete('/delete/:id', auth.authenticateUser,  auth.authorizeUser("delete_chatroom"), chatRoomsControllers.deleteChatRoom);


module.exports = router;