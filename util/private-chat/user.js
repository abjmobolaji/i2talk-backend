const connection = require('../../models/db');

// User Join
function createChat (chatID, isender, receiver) {
    const sql = `SELECT * from chats WHERE chatID = '${chatID}'`
    connection.query(sql, (err, response) => {
        if (err) throw err
        else if (response.length === 0) {
            const sql2 = `insert into chats (chatID, sender, receiver) values ('${chatID}', '${isender}', '${receiver}')`
            connection.query(sql2, (err, response) => {
                if (err) throw err
                console.log('Chat initiated');
            });
        }
        else {
          
        }
    });

    const user = { chatID, isender, receiver };
    return user;
}

module.exports = {
    createChat
};