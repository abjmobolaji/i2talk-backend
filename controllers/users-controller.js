require('dotenv').config();
const connection = require('../models/db');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const sendMail = require('../util/mail');


// GET ALL USERS
const getUsers = (req, res, next) => {
    let sql = `SELECT * FROM users ORDER BY ID DESC`;
    connection.query(sql, (err, resp) => {
        if (err) {
           return res.status(422).json({message : err.sqlMessage});
        }
        if (resp.length > 0) {
            let users = resp.map(user => delete user.password && user);
            return res.json(users); 
        } else {
            return res.status(404).json({message : "No User Found!!!!"})
        }
        
    });
}

// GET USERS BY ID
const getUserByID = (req, res, next) => {
    if (!req.params.id) { return res.status(404).json({ message : "Error! No User ID supplied!"}) }
    let sql = `SELECT * FROM USERS WHERE ID = ${req.params.id}`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp.length > 0) {
            delete resp[0].password;
            res.send(resp[0]);
        } else {
            res.status(404).send("No User Record Found!");
        }
    });
}

// EDIT USER DETAILS
const editUserDetails = (req, res, next) => {
    if (!req.params.id) { return res.status(404).json({ message : "Error! No User ID supplied!"}); }
    let sql1 = `SELECT *  FROM users WHERE ID = '${req.params.id}'`;
    connection.query(sql1, (err1, resp1) => {
        if (err1) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp1.length > 0) {
            console.log(resp1[0].picture);
            if (!req.body.fullName) {
                req.body.fullName = resp1[0].fullName;
            }
            if (!req.body.state) {
                req.body.state = resp1[0].state;
            }
            if (!req.body.latitude) {
                req.body.latitude = resp1[0].latitude;
            }
            if (!req.body.longitude) {
                req.body.longitude = resp1[0].longitude;
            }
            if (!req.body.bio) {
                req.body.bio = resp1[0].bio;
            }
            if (!req.body.picture) {
                req.body.picture = resp1[0].picture;
                
            }
        } else {
            return res.status(404).json({ message : "Error! User details not found and cant be edited!"})
        }
    });
    let sql2 = `UPDATE users SET fullName = '${req.body.fullName}', state = '${req.body.state}', latitude = '${req.body.latitude}', longitude = '${req.body.longitude}', picture = '${req.body.picture}', bio = '${req.body.bio}' 
                WHERE ID = '${req.params.id}'`;
    connection.query(sql2, (err2, resp2) => {
        if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
        if (resp2.affectedRows === 0) { return res.status(404).json({message : 'No User with the provided id'}) }
        res.status(200).json({message : "User updated successfully"})
    });
}

// GET USER LATITUDE AND LONGITUDE
const getlatlongByID = (req, res, next) => {
    if (!req.params.id || !req.body.userID) { return res.status(404).json({ message : "Error! No User ID supplied!"}) }
    let sql = `SELECT latitude, longitude FROM users WHERE ID = '${req.params.id}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        res.send(resp);
    });
}

// SAVE USER  LATITUDE AND LONGITUDE
const saveUserlatlong = (req, res, next) => {
    if (!req.params.id && !req.body.userID && !req.body.latitude && !req.body.longitude) { 
        return res.status(404).json({message : 'Error! Invalid Details supplied!'});
    }
    let sql = `UPDATE users SET latitude = '${req.body.latitude}', longitude = '${req.body.longitude}' WHERE ID = '${req.params.id}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        next();
    });
}

// GET USERNAME FROM ID
const getUsernameByID = (req, res, next) => {
    if (!req.params.id) { return res.status(404).json({message : 'Could not find a User with the provided id'}); }
    let sql = `SELECT username FROM users WHERE ID = '${req.params.id}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        res.send(resp);
    });
}

// PASSWORD CHANGE FOR USER
const changePassword = (req, res, next) => {
    const { userID, oldPassword, password } = req.body;
    if (!userID || !oldPassword || !password) { return res.status(404).json({ message: 'Invalid Credentials Supplied!' }); }
    connection.query(`SELECT password FROM users WHERE ID = ${userID}`, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        var comparePassword = bcrypt.compare(oldPassword, resp[0].password, (err1) => {
            if (err1) { return res.status(500).json({ message: 'Internal Error' }); }
        });
        if (comparePassword == true) {
            bcrypt.hash(password, 10, (err2, hash) => {
                if (err2) { return res.status(500).json({ message: 'Internal Error' }); }
                connection.query(`UPDATE users SET passord = ${hash} WHERE ID = ${userID}`, (err3, resp3) => {
                    if (err3) { return res.status(422).json({message : err3.sqlMessage}); }
                    if (resp3.affectedRows === 0) {
                        return res.status(404).json({message : "Error Setting New Password!"})
                    } else {
                        res.status(200).json({message : "Password Updated!"});
                    }
                });
            })
        } else {
            return res.status(401).json({message : "Old password is Incorrect!"})
        }
    });
}




module.exports.getUsers = getUsers;
module.exports.getUserByID = getUserByID;
module.exports.getUsernameByID = getUsernameByID;
module.exports.editUserDetails =  editUserDetails;
module.exports.changePassword = changePassword;

// MEANT FOR ISEARCH - WILL MOVE IT LATER
module.exports.getlatlongByID = getlatlongByID;
module.exports.saveUserlatlong = saveUserlatlong;