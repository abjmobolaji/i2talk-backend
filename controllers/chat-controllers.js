const connection = require('../models/db');

// get all user chats
const getAllCurrentChats = (req, res, next) => {
    const sql = `SELECT * FROM chats WHERE sender = '${req.params.id}' OR receiver = '${req.params.id}' ORDER BY updatedAt DESC`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        // else if (response.length === 0) return res.status(404).json({message : 'Could not find a chat room with the provided id'})
        res.status(200).json({data : response})
    }); 
};

// get chat messages
const getChatMessages = (req, res, next) => {
    const sql = `SELECT * FROM chat_messages WHERE chatID = '${req.params.id}' AND scheduled = '0' ORDER BY timeSent ASC`
    connection.query(sql, (err, response) => {
        if (err) return res.status(422).json({message : err.sqlMessage}) 
        // else if (response.length === 0) return res.status(404).json({message : 'Could not find any chats with the provided chat id'})
        res.status(200).json({data : response});
    }); 
};

module.exports = {
    getChatMessages,
    getAllCurrentChats
}
