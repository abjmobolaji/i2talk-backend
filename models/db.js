require('dotenv').config();
const mysql = require('mysql')

// DATABASE CONNECTION
// const connection = mysql.createConnection({
//     "host" : process.env.DB_HOST,
//     "user" : process.env.DB_USER,
//     "password" : process.env.DB_PASSWORD,
//     "database" : process.env.DB_DATABASE
// })

// connection.connect((err,res) => {
//     if (err) throw err;
//     console.log("DB Connected Successfully!!!")
// })

// module.exports = connection;

var pool = mysql.createPool({
    "host" : process.env.DB_HOST,
    "user" : process.env.DB_USER,
    "password" : process.env.DB_PASSWORD,
    "database" : process.env.DB_DATABASE
});
 
// var query = function(sql,callback){
//     pool.getConnection(function(err,conn){
//         if(err){
//             callback(err,null);
//         }else{
//             conn.query(sql,function(err,results){
//                 callback(err,results);
//             });
//             conn.release();
//         }
//     });
// };
 
module.exports = pool;