require('dotenv').config();
const connection = require('../models/db');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const sendMail = require('../util/mail');
const auditManager = require('./trail-controller');

// GET ALL USERS
const getUsers = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    let sql = `SELECT * FROM users ORDER BY ID DESC`;
    connection.query(sql, (err, resp) => {
        if (err) {
           return res.status(422).json({message : err.sqlMessage});
        }
        let users = resp.map(user => delete user.password && user);
        trail = {
            actor : `Admin`,
            action : `Admin with User ID (${req.data.userID}) initiated a request for the list of Users!`,
            type : "success"
        }
        auditManager.logTrail(trail);
        if (resp.length > 0) {
            return res.json(users); 
        } else {
            return res.status(404).json({message : "No User Found!!!!"})
        }
        
    });
}

// GET USERS BY ID
const getUserByID = (req, res, next) => {
    if (!req.params.id) { return res.status(404).json({ message : "Error! No User ID supplied!"}) }
    let sql = `SELECT * FROM users WHERE ID = ${req.params.id}`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        trail = {
            actor : `User`,
            action : `User with User ID (${req.data.userID}) requested for user details!`,
            type : "success"
        }
        auditManager.logTrail(trail);

        if (resp.length > 0) {
            delete resp[0].password;
            res.send(resp[0]);
        } else {
            res.status(404).send("No User Record Found!");
        }
    });
}

// GET USERS BY Username
const getUserByUsername = (req, res, next) => {
    if (!req.params.username) { return res.status(404).json({ message : "Error! No USERNAME supplied!"}) }
    let sql = `SELECT * FROM users WHERE username = '${req.params.username}'`;
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
    const userID = req.data.userID;
    if (!userID) { return res.status(404).json({ message : "Error! No User ID supplied!"}); }
    let sql1 = `SELECT *  FROM users WHERE ID = '${userID}'`;
    connection.query(sql1, (err1, resp1) => {
        if (err1) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp1.length > 0) {
            if (!req.body.fullName) {
                req.body.fullName = resp1[0].fullName;
            }
            if (!req.body.state) {
                req.body.state = resp1[0].state;
            }
            if (req.body.latitude == undefined) {
                req.body.latitude = resp1[0].latitude;
            }
            if (req.body.longitude == undefined) {
                req.body.longitude = resp1[0].longitude;
            }
            if (!req.body.bio) {
                req.body.bio = resp1[0].bio;
            }
            if (!req.file) {
                var filePath = resp1[0].picture;
            }
            if (req.file) {
                // var pic = req.file.path.replace(/\\/g,"/");4
                var pic = req.file.filename;
                var filePath = `${process.env.BASE_URL}/files/users/${pic}`
                console.log(filePath)
            }
            
            let sql2 = `UPDATE users SET fullName = '${req.body.fullName}', state = '${req.body.state}', latitude = '${req.body.latitude}', longitude = '${req.body.longitude}', picture = '${filePath}', bio = '${req.body.bio}' 
                        WHERE ID = '${userID}'`;
            connection.query(sql2, (err2, resp2) => {
                if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                if (resp2.affectedRows === 0) { return res.status(404).json({message : 'No User with the provided id'}) }
                const sql = `select * from users where ID = '${userID}'`
            connection.query(sql, (err, responses) => {
                if (err) return res.status(422).json({message : err.sqlMessage}) 
                res.status(200).json({message : "User updated successfully", data : responses}) });
                trail = {
                    actor : `User`,
                    action : `User with User ID (${req.data.userID}) profile details was edited!`,
                    type : "success"
                }
                auditManager.logTrail(trail);
                res.status(200).json({message : "User updated successfully"})
            });
        } else {
            trail = {
                actor : `User`,
                action : `Anonymous User with User ID (${req.data.userID}) detail(s) was not found!`,
                type : "error"
            }
            auditManager.logTrail(trail);
            return res.status(404).json({ message : "Error! User details not found and cant be edited!"})
        }
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
    if (!req.params.id) { return res.status(404).json({message : 'No User ID provided!'}); }
    let sql = `SELECT username FROM users WHERE ID = '${req.params.id}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        res.send(resp);
    });
}

// BAN USERS
const banUser = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    if (!req.body.userID) { return res.status(404).json({message : 'No User ID provided!'}); }
    let sql = `SELECT ban FROM users WHERE ID = '${req.body.userID}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp[0].ban == 0) {
            connection.query(`UPDATE users SET ban = 1 WHERE ID = '${req.body.userID}'`, (errBan, respBan) => {
                if (errBan) { return res.status(422).json({message : err.sqlMessage}); }
                return res.json("User Banned Successfully!");
            })
        } else if (resp[0].ban == 1) {
            return res.json("User Already Banned!");
        } else {
            return res.status(422).json({message : "Error in banning User!"})
        }
    });
}

// UNBAN USERS
const unbanUser = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    if (!req.body.userID) { return res.status(404).json({message : 'No User ID provided!'}); }
    let sql = `SELECT ban FROM users WHERE ID = '${req.body.userID}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp[0].ban == 1) {
            connection.query(`UPDATE users SET ban = 0 WHERE ID = '${req.body.userID}'`, (errBan, respBan) => {
                if (errBan) { return res.status(422).json({message : err.sqlMessage}); }
                return res.json("User unbanned Successfully!");
            })
        } else if (resp[0].ban == 0) {
            return res.json("User was not Banned or already unbanned!");
        } else {
            return res.status(422).json({message : "Error in unbanning User!"})
        }
    });
}

// LOCK PRIVACY
const lockPrivacy = (req, res, next) => {
    let userID = req.data.userID;
    if (!userID) { return res.status(404).json({message : 'Error getting User ID!'}); }
    let sql = `SELECT privacy FROM users WHERE ID = '${userID}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp[0].privacy == 0) {
            connection.query(`UPDATE users SET privacy = 1 WHERE ID = '${userID}'`, (errBan, respBan) => {
                if (errBan) { return res.status(422).json({message : err.sqlMessage}); }
                return res.json("Privacy Set Successfully!");
            })
        } else if (resp[0].privacy == 1) {
            return res.json("Privacy Already Set!");
        } else {
            return res.status(422).json({message : "Error in setting Privacy!"})
        }
    });

}

// UNLOCK PRIVACY
const unlockPrivacy = (req, res, next) => {
    let userID = req.data.userID;
    if (!userID) { return res.status(404).json({message : 'Error getting User ID!'}); }
    let sql = `SELECT privacy FROM users WHERE ID = '${userID}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp[0].privacy == 1) {
            connection.query(`UPDATE users SET privacy = 0 WHERE ID = '${userID}'`, (errBan, respBan) => {
                if (errBan) { return res.status(422).json({message : err.sqlMessage}); }
                return res.json("Privacy unset Successfully!");
            })
        } else if (resp[0].privacy == 0) {
            return res.json("Privacy not Set!");
        } else {
            return res.status(422).json({message : "Error in unsetting Privacy!"})
        }
    });

}

// PROMOTE USER
const promoteUser = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    if (!req.body.userID || !req.body.roleID) { return res.status(404).json({message : 'No User ID/Role ID provided!'}); }
    if (req.body.roleID < 1 || req.body.roleID > 3) { return res.status(404).json({message : 'Invalid Role ID provided!'}); }
    let sql = `SELECT * FROM users WHERE ID = '${req.body.userID}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp.length > 0) {
            connection.query(`INSERT INTO user_roles (userID, roleID) VALUES ('${req.body.userID}', '${req.body.roleID}')`, (errBan, respBan) => {
                if (errBan) { return res.status(422).json({message : err.sqlMessage}); }
                if (req.body.roleID == 1) {
                    return res.json("User promoted to Moderator!");
                } else if (req.body.roleID == 2) {
                    return res.json("User promoted to Admin!");
                } else if (req.body.roleID == 3) {
                    return res.json("User promoted to Super-Admin!");
                }
            });
        } else {
            return res.status(422).json({message : "No User Found!"})
        }
    });
}

// DEMOTE USER
const demoteUser = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    if (!req.body.userID) { return res.status(404).json({message : 'No User ID provided!'}); }
    let sql = `SELECT * FROM user_roles WHERE userID = '${req.body.userID}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp.length > 0) {
            connection.query(`DELETE FROM user_roles WHERE userID = '${req.body.userID}'`, (errBan, respBan) => {
                if (errBan) { return res.status(422).json({message : err.sqlMessage}); }
                    return res.json("Admin demoted to User!");
            });
        } else {
            return res.status(422).json({message : "No Admin Account Found for the User!"})
        }
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
module.exports.getUserByUsername = getUserByUsername
module.exports.banUser = banUser;
module.exports.unbanUser = unbanUser;
module.exports.lockPrivacy = lockPrivacy;
module.exports.unlockPrivacy = unlockPrivacy;
module.exports.promoteUser = promoteUser;
module.exports.demoteUser = demoteUser;

// MEANT FOR ISEARCH - WILL MOVE IT LATER
module.exports.getlatlongByID = getlatlongByID;
module.exports.saveUserlatlong = saveUserlatlong;