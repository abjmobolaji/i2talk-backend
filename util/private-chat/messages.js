
const connection = require('../../models/db');
require('dotenv').config();
var CronJob = require('cron').CronJob;
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
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

const addAttachmentMessageToDb = (chatID, isender, receiver, link, fileName) => {
    const msg = "Attachment";
    const attachment = `${process.env.BASE_URL}/${link}`
    const filePath = `${process.env.BASE_URL}/attachment/${fileName}`
    const sql = `insert into chat_messages (chatID, sender, receiver, message, attachment, isMessage, fileName, filePath) values ('${chatID}', '${isender}', '${receiver}', '${msg}', '${attachment}', '0', '${fileName}', '${filePath}')`
    connection.query(sql, (err, response) => {
        if (err) throw err
        
    });
    
};

const updateScheduledMessage = (date, receiver) => {
    const sql = `UPDATE chat_messages SET scheduled = '0' where timetodeliver  = '${date}' AND receiver = '${receiver}'`
    connection.query(sql, (err, response) => {
        if (err) throw err
        console.log('message sent')
    });
    
};

const addScheduledMessageToDb = (chatID, isender, receiver, date, message) => {
    // var getDate = moment(dateTime, "DD-MM-YYYY HH:mm:ss");
    // var newDate = getDate.toISOString();
    // var date = moment(newDate).format('YYYY-MM-DD H:mm:ss');
    // console.log(humanToCron(date))
    const sql = `insert into chat_messages (chatID, sender, receiver, timetodeliver, message, scheduled) values ('${chatID}', '${isender}', '${receiver}', '${date}', '${message}', '1')`
    connection.query(sql, (err, response) => {
        if (err) throw err
        console.log("message Scheduled")
    });
    // var cronDate = new Date(newDate);

    // var mins = cronDate.getMinutes();
    // //mins variable for the 1st * and so on 
    // var secs = cronDate.getSeconds();

    // var hour = cronDate.getHours();

    // var day =cronDate.getDate();

    // var month = cronDate.getMonth();

    // var dayofweek=cronDate.getDay();

    // // console.log(mins, secs, dayofmonth, month, dayofmonth, dayofweek);
    // // ${secs} ${mins} ${hour} ${day} ${month}  *

    // // cron.schedule(`${mins} ${hour} ${day} 11 *`, function() {
    //     // const sql = `UPDATE chat_messages SET scheduled = '0' where timetodeliver  = '${date}' AND receiver = '${receiver}'`
    //     // connection.query(sql, (err, response) => {
    //     //     if (err) throw err
    //     //     console.log('message sent')
    //     // });
    // // });
    // var job = uuidv4(); 
    // var job = new CronJob(cronDate, function() {
    //     const sql = `UPDATE chat_messages SET scheduled = '0' where timetodeliver  = '${date}' AND receiver = '${receiver}'`
    //     connection.query(sql, (err, response) => {
    //         if (err) throw err
    //         console.log('message sent')
    //     });
    // });
    // job.start();
};


module.exports = {
    addMessageToDb,
    addLastMessageToDb,
    addScheduledMessageToDb,
    updateScheduledMessage,
    addAttachmentMessageToDb
};