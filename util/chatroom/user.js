const connection = require('../../models/db');

// User Join
function userJoinChatRoom (id, userID, chatRoomId, username, roomName) {
    const sql = `insert into chat_rooms_members (socketID, userID, chatRoomId, username, roomName) values ('${id}', '${userID}', '${chatRoomId}', '${username}', '${roomName}')`
    connection.query(sql, (err, response) => {
        if (err) return err.sqlMessage
        
    });
    const user = { id, userID, chatRoomId, username, roomName };
    return user;
}

// Get current Users
function getCurrentUser(id, callback) {
    sql = `SELECT * from chat_rooms_members WHERE socketID = '${id}'`
    connection.query(sql, (err, response) => {
        if (err) return err.sqlMessage
        return callback(response[0]);
    })
}

// User leaves chat
function userLeave(id) {
    // sql = `SELECT username FROM users INNER JOIN chat_rooms_members ON chat_rooms_members.userID = users.id WHERE chat_rooms_members.socketID = '${id}'`
        sql2 = `delete from chat_rooms_members where socketID = '${id}'`
        connection.query(sql2, (error, resp) => {
            if (error) return error.sqlMessage
            console.log('Deleted')
        }); 
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room == room)
}

module.exports = {
    userJoinChatRoom,
    getCurrentUser,
    userLeave,
    getRoomUsers
};