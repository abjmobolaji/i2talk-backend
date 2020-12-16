const moment = require('moment');
const connection = require('../../models/db');

// function formatMessage(username, text) {
//     return {
//         username,
//         text,
//         time : moment().format('h:mm a')
//     }
// }

const addMessageToDb = (chatID, isender, receiver, msg) => {
    const sql = `insert into chat_messages (chatID, sender, receiver, message) values ('${chatID}', '${isender}', '${receiver}', '${msg}')`
    connection.query(sql, (err, response) => {
        if (err) throw err
        
    });
    
};

const addLastMessageToDb = (chatID, msg) => {
    const sql = `UPDATE chats SET lastMessage = '${msg}' where chatID  = '${chatID}'`
    connection.query(sql, (err, response) => {
        if (err) throw err

    });
    
};

module.exports = {
    addMessageToDb,
    addLastMessageToDb
};