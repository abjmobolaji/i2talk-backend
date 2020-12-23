require('dotenv').config();
const mysql = require('mysql')

// DATABASE CONNECTION
const connection = mysql.createConnection({
    "host" : process.env.DB_HOST,
    "user" : process.env.DB_USER,
    "password" : process.env.DB_PASSWORD,
    "database" : process.env.DB_DATABASE
})

connection.connect((err,res) => {
    if (err) console.log(err);
    console.log("DB Connected Successfully!!!")
})

module.exports = connection;