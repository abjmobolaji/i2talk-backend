const mysql = require('mysql')
require('dotenv').config();

// Database Connection

const connection = mysql.createConnection({
    "host" : process.env.DB_HOST,
    "user" : process.env.DB_USER,
    "password" : process.env.DB_PASSWORD,
    "database" : process.env.DB_DATABASE
})

connection.connect((err,res) => {
    if (err) throw err
    console.log("db connected")
})

module.exports = connection;