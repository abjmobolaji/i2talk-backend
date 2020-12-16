const moment = require('moment');
const connection = require('../../models/db');

function formatMessage(username, text) {
    return {
        username,
        text,
        time : moment().format('h:mm a')
    }
}

const addMessageToDb = (userID, username, chatRoomID, message) => {
    const sql = `insert into chat_rooms_messages (userID, username, chatRoomID, message) values ('${userID}', '${username}', '${chatRoomID}', '${message}')`
    connection.query(sql, (err, response) => {
        if (err) throw err
        console.log('message saved to db')
    });
};

// function getData (id) {
//         sql = `SELECT * from chat_rooms_members WHERE socketID = '${id}'`
//         let response = connection.query(sql,  async (err, response) => {
//             if (err) return err.sqlMessage
//             result = await response[0];
//             console.log(result);
//             return result;
//         })
//         return response
// }

module.exports = {
    formatMessage,
    addMessageToDb
};
