const connection = require('../models/db');

// get all reminders
const getAllChatRooms = (req, res, next) => {
    const sql = 'select * from chat_rooms'
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'No Chat Rooms, create One!'})
        res.status(200).json({data : response})
    }); 
};

// get a reminder by id
const getChatRoom = (req, res, next) => {
    const sql = `select * from chat_rooms where id = ${req.params.id}`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        else if (response.length === 0) return res.status(404).json({message : 'Could not find a chat room with the provided id'})
        res.status(200).json({data : response})
    }); 
};


exports.getAllChatRooms = getAllChatRooms;
exports.getChatRoom = getChatRoom;