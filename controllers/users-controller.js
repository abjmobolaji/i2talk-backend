const connection = require('../models/db');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// GET ALL USERS
const getUsers = (req, res, next) => {
    let sql = `SELECT * FROM users`;
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
    let sql1 = `SELECT *  FROM users WHERE ID = ${req.params.id}`;
    connection.query(sql1, (err1, resp1) => {
        if (err1) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp1.length > 0) {
            if (!req.body.fullName) {
                req.body.fullName = resp1[0].fullName;
            }
            if (!req.body.phone) {
                req.body.phone = resp1[0].phone;
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
    let sql2 = `UPDATE users fullName = ${req.body.fullName}, phone = ${req.body.phone}, state = ${req.body.state}, latitude = ${req.body.latitude}, longitude = ${req.body.longitude}, picture = ${req.body.picture}, bio = ${req.body.bio} 
                WHERE ID = ${req.params.id}`;
    connection.query(sql2, (err2, resp2) => {
        if (err2) { return res.status(422).json({message : err.sqlMessage}); }
        if (response.affectedRows === 0) { return res.status(404).json({message : 'No User with the provided id'}) }
        res.status(200).json({message : "User updated successfully"})
    });
}

// GET USER LATITUDE AND LONGITUDE
const getlatlongByID = (req, res, next) => {
    if (!req.params.id || !req.body.userID) { return res.status(404).json({ message : "Error! No User ID supplied!"}) }
    let sql = `SELECT latitude, longitude FROM users WHERE ID = ${req.params.id}`;
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
    let sql = `UPDATE users SET latitude = '${req.body.latitude}', longitude = '${req.body.longitude}' WHERE ID = ${req.params.id}`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        next();
    });
}

// GET USERNAME FROM ID
const getUsernameByID = (req, res, next) => {
    if (!req.params.id) { return res.status(404).json({message : 'Could not find a User with the provided id'}); }
    let sql = `SELECT username FROM users WHERE ID = ${req.params.id}`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        res.send(resp);
    });
}


// SIGNUP
const signup =  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(404).json({message : 'Invalid Inputs, Check your data!'}); }
    const { fullName, username, password, email, phone, sex, state, latitude, longitude} = req.body;
    let sql = `SELECT * FROM users WHERE username = ${username} OR email = ${email} OR phone = ${phone}`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp.length > 0) {
            if (username === resp[0].username) {
                return res.status(422).json({message : "Duplicate Username!"});
            } else if (email === resp[0].email) {
                return res.status(422).json({message : "Duplicate Username!"});
            } else if (phone === resp[0].phone) {
                return res.status(422).json({message : "Duplicate Username!"});
            }
        }
    });
    let sql2 = `INSERT INTO users (fullName, username, password, email, phone, sex, state, latitude, longitude) 
            VALUES ()`;




/*     bcrypt.hash(req.body.password, 10, (errHash, hash) => { //Encrypt Password
        if(errHash) throw errHash;
        let sql = `INSERT INTO users VALUES ('', '${req.body.fullName}', '${req.body.username}', '${hash}', '${req.body.email}', '${req.body.level}')`;
        connection.query(sql, (err, db_res) => {
        if(err) {
            res.send(err.sqlMessage); //Error Message
        };
        res.send("User registration successful!"); //Success Message
        });
    }); */
}


// LOGIN
const login = (req, res, next) => {

}

module.exports.getUsers = getUsers;
module.exports.signup = signup;
module.exports.login = login;
module.exports.getUserByID = getUserByID;
module.exports.getUsernameByID = getUsernameByID;
module.exports.editUserDetails =  editUserDetails;

// MEANT FOR ISEARCH - WILL MOVE IT LATER
module.exports.getlatlongByID = getlatlongByID;
module.exports.saveUserlatlong = saveUserlatlong;