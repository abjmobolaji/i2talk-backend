const connection = require('../models/db');

// get all Chatrooms
const getAllChatRooms = (req, res, next) => {
    const sql = 'select * from chat_rooms'
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'No Chat Rooms, create One!'})
        res.status(200).json({data : response})
    }); 
};

// Create Chat room
const createChatRoom = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    const { chatRoomName, chatRoomDesc, trending } = req.body;
    const sql = `insert into chat_rooms (chatRoomName, chatRoomDesc, trending) values ('${chatRoomName}', '${chatRoomDesc}', '${trending}')`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        res.status(201).json({message : 'Chat Room Successfully Created'})
    }); 
};

// edit ChatRoom Details
const editChatRoom = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    const { chatRoomName, chatRoomDesc, trending } = req.body;
    connection.query(`select * from chat_rooms where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a chat room with the provided id'})
        connection.query(`UPDATE chat_rooms SET chatRoomName = '${chatRoomName}', chatRoomDesc = '${chatRoomDesc}', trending = '${trending}' where id = ${req.params.id}`, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage})
            res.status(200).json({message : 'Chat Room edited successfully'})
        })
    }); 
};

// get a chatroom by id
const getChatRoom = (req, res, next) => {
    const sql = `select * from chat_rooms where id = ${req.params.id}`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a chat room with the provided id'})
        res.status(200).json({data : response})
    }); 
};

// Get Chat Room Messages by ID
const getChatRoomMessages = (req, res, next) => {
    const sql = `SELECT * FROM chat_rooms_messages WHERE chatRoomID = ${req.params.id} ORDER BY timePosted ASC`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a chat room with the provided id'})
        res.status(200).json({data : response})
    }); 
};

// Delete Chat Room
const deleteChatRoom = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    connection.query(`select * from chat_rooms where id = ${req.params.id}`, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a chat room with the provided id'})
        const sql = `delete from chat_rooms where id = ${req.params.id}`
        connection.query(sql, (err, response) => {
            if (err) return res.status(422).json({message : err.sqlMessage}) 
            res.status(200).json({message : "ChatRoom deleted successfully"})
        }); 
    });
};




exports.getAllChatRooms = getAllChatRooms;
exports.getChatRoom = getChatRoom;
exports.getChatRoomMessages = getChatRoomMessages;
exports.deleteChatRoom = deleteChatRoom;
exports.createChatRoom = createChatRoom;
exports.editChatRoom = editChatRoom;