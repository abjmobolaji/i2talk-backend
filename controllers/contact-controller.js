const connection = require('../models/db');
const sendMail = require('../util/mail');

const contact = (req, res, next) => {
    const { customerName, customerEmail, customerSubject, customerMessage} = req.body;
    const attendedToBy = "rasheed.adedamola@gmail.com"
    sendMail(customerName, customerEmail, customerSubject, customerMessage, attendedToBy, function(err, info) {
        if (err) {
            res.status(500).json({ message: 'Internal Error' });
        } else {
            const sql = `insert into contact_us (customerName, customerEmail, customerSubject, customerMessage, attendedToBy) values ('${customerName}', '${customerEmail}', '${customerSubject}', '${customerMessage}', '${attendedToBy}')`;
            connection.query(sql, (err, response) => {
                if (err) return res.status(422).json({message : err.sqlMessage}) 
        }); 
                res.status(201).json({ message: 'Email sent!!!' });
        }});
};

exports.contact = contact;