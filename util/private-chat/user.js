const connection = require('../../models/db');

// User Join
function createChat (isender, receiver) {
    const chatID = getPrivateChatID(isender, receiver); 
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

function getPrivateChatID(isender, receiver) {
    const chatOwner = [isender, receiver];
    chatOwner.sort((a, b) => a.localeCompare(b));
    return  `${chatOwner[0]}_${chatOwner[1]}`
}

module.exports = {
    createChat
};