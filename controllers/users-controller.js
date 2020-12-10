require('dotenv').config();
const connection = require('../models/db');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const sendMail = require('../util/mail');


// GET ALL USERS
const getUsers = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
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
    let sql2 = `UPDATE users fullName = '${req.body.fullName}', phone = '${req.body.phone}', state = '${req.body.state}', latitude = '${req.body.latitude}', longitude = '${req.body.longitude}', picture = '${req.body.picture}', bio = '${req.body.bio}' 
                WHERE ID = '${req.params.id}'`;
    connection.query(sql2, (err2, resp2) => {
        if (err2) { return res.status(422).json({message : err.sqlMessage}); }
        if (response.affectedRows === 0) { return res.status(404).json({message : 'No User with the provided id'}) }
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


// SIGNUP
const signup =  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { return res.status(404).json({message : 'Invalid Inputs, Check your data!'}); }
    const { fullName, username, password, email, phone, sex, state, latitude, longitude} = req.body;
    let sql = `SELECT * FROM users WHERE username = '${username}' OR email = '${email}' OR phone = '${phone}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp.length > 0) {
            if (username === resp[0].username) {
                return res.status(422).json({message : "Duplicate Username!"});
            } else if (email === resp[0].email) {
                return res.status(422).json({message : "Duplicate Email!"});
            } else if (phone === resp[0].phone) {
                return res.status(422).json({message : "Duplicate Phone!"});
            }
        } else {
            bcrypt.hash(password, 10, (errHash, hash) => { 
                if (errHash) { return res.status(422).json({message : err}); }
                const  otpCode = Math.floor(100000 + Math.random() * 900000);
                let sql2 = `INSERT INTO users (fullName, username, password, email, phone, sex, state, latitude, longitude, OTP) 
                        VALUES ('${fullName}', '${username}', '${hash}', '${email}', '${phone}', '${sex}', '${state}', '${latitude}', '${longitude}', '${otpCode}')`;
                connection.query(sql2, (err2, resp2) => {
                    if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                    if (resp2) {    
                        const newUserID = encodeURIComponent(Buffer.from(`${resp2.insertId}`, 'binary').toString('base64'));
                        const secretCode = encodeURIComponent(Buffer.from(`${otpCode}`, 'binary').toString('base64'));
                        //SEND MAIL TEMPLATE
                        //sendMail = (name, email, subject, text, to, cb)
                        sendMail(
                            'i2talk',
                            'noreply@i2talk.com',
                            'User Registration Successful! Please, Activate Your Account!',
                            `Hi ${fullName.split(" ")[0]}, <br/>
                            <p>Welcome to <b>i2talk</b>, you are a click away from accessing your account. Click on the button below to activate your account.</p>
                            <center><a href="${process.env.BASE_URL}/api/users/auth/activation/${newUserID}/${secretCode}"><button style="padding: 12px; color: white; background: #000066; border: none; border-radius: 6px;">Activate My Account</button></a></center> 
                            <p>Or Copy the link below to your browser:<br/>
                            <a href="${process.env.BASE_URL}/api/users/auth/activation/${newUserID}/${secretCode}">${process.env.BASE_URL}/api/users/auth/activation/${newUserID}/${secretCode}}</a></p>
                            <br/>Thanks.`, 
                            email,
                            (err3, info) => {
                                if (err3) { return res.status(500).json({ message: 'Internal Error' }); }
                                res.status(201).json({message : 'Signup Sucessful! Please, check your mail and activate your account!'})
                        });
                    }
                });
            });
        }
    });
}

// ACTIVATE/VERIFY USER ACCOUNT
const activateAccount = (req, res, next) => {
    var { userID, otpCode } = req.params;

    // DECODE URI COMPONENT
    const decodedUserID = decodeURIComponent(userID);
    const decodedOtpCode = decodeURIComponent(otpCode);

    // DECODE BASE64 TO GET THE RAW DATA
    userID = Buffer.from(decodedUserID, 'base64').toString();
    otpCode = Buffer.from(decodedOtpCode, 'base64').toString();

    connection.query(`SELECT email, OTP, isEnabled FROM users WHERE ID = ${userID}`, (err, resp) => {
        if (err) { return res.status(422).json({message : err2.sqlMessage}); }
        if (resp.length > 0) {
            if (resp[0].isEnabled == 1) {
                return res.status(200).json({message : 'Account already activated! Proceed to login'})
            }
            if (resp[0].OTP == otpCode) {
                connection.query(`UPDATE users SET isEnabled = 1 WHERE ID = ${userID}`, (err2, resp2) => {
                    if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                    return res.status(201).json({message : 'Account activated! You may proceed to login'})
                });
            } else {
                return res.status(401).json({message : 'Error validating account! Check Activation Link Again'})
            }
        } else {
            return res.status(404).json({message : 'No account found! Check Activation Link Again'})
        }
    });
}

// RESET PASSWORD FOR USER
const resetPassword = (req, res, next) => {
    const { login } = req.body;
    if (!login) { return res.status(404).json({ message: 'Invalid Credential Supplied!' }); }
    let sql = `SELECT * FROM users WHERE username = '${login}' OR  phone = '${login}' OR  email = '${login}'`;
    connection.query(sql, (err, identifiedUser) => {
        if (err) { return res.status(422).json({message : err2.sqlMessage}); }
        if (identifiedUser.length > 0) {
            const otpCode = Math.floor(100000 + Math.random() * 900000);
            connection.query(`UPDATE users SET OTP = ${otpCode} WHERE ID = ${identifiedUser[0].ID}`, (err2, resp) => {
                const newUserID = encodeURIComponent(Buffer.from(`${identifiedUser[0].ID}`, 'binary').toString('base64'));
                const secretCode = encodeURIComponent(Buffer.from(`${otpCode}`, 'binary').toString('base64'));    
                //SEND MAIL TEMPLATE
                //sendMail = (name, email, subject, text, to, cb)
                sendMail(
                    'i2talk',
                    'noreply@i2talk.com',
                    'Request to Reset Password, i2talk Account!',
                    `Hi ${identifiedUser[0].fullName.split(" ")[0]}, <br/>
                    <p>A request was initiated to reset your password. Click on the button below to reset your account password.</p>
                    <center><a href="${process.env.BASE_URL}/api/users/auth/reset/${newUserID}/${secretCode}"><button style="padding: 12px; color: white; background: #000066; border: none; border-radius: 6px;">Reset Password</button></a></center> 
                    <p>Or Copy the link below to your browser:<br/>
                    <a href="${process.env.BASE_URL}/api/users/auth/reset/${newUserID}/${secretCode}">${process.env.BASE_URL}/api/users/auth/activation/${newUserID}/${secretCode}}</a></p>
                    <br/>
                    Please, ignore and delete this mail if you did not make the request! Thanks.`, 
                    identifiedUser[0].email,
                    (err3, info) => {
                        if (err3) { return res.status(500).json({ message: 'Internal Error' }); }
                        res.status(201).json({message : 'Password reset link sent. Check your mail and reset your password!'})
                });    
            });
        } else {
            return res.status(404).json({ message: 'No Account found for user!' }); 
        }
    });
}

// GET RESET PASSWORD
const getResetPassword = (req, res, next) => {
    var { userID, otpCode } = req.params;

    // DECODE URI COMPONENT
    const decodedUserID = decodeURIComponent(userID);
    const decodedOtpCode = decodeURIComponent(otpCode);

    // DECODE BASE64 TO GET THE RAW DATA
    userID = Buffer.from(decodedUserID, 'base64').toString();
    otpCode = Buffer.from(decodedOtpCode, 'base64').toString();

    connection.query(`SELECT email, OTP FROM users WHERE ID = ${userID}`, (err, resp) => {
        if (err) { return res.status(422).json({message : err2.sqlMessage}); }
        if (resp.length > 0) {
            if (resp[0].OTP == otpCode) {
                return res.status(200).json({ userID : userID, status : "Verified" })
            } else {
                return res.status(401).json({message : 'Error reseting passowrd! Check Reset Link Again'})
            }
        } else {
            return res.status(404).json({message : 'No account found! Check Reset Link Again'})
        }
    });
}

// SET NEW PASSWORD FOR USER AFTER RESET
const setPassword = (req, res, next) => {
    const { userID, password } = req.body;
    if (!userID || !password) { return res.status(404).json({ message: 'Invalid Credentials Supplied!' }); }
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) { return res.status(500).json({ message: 'Internal Error' }); }
        connection.query(`UPDATE users SET passord = ${hash} WHERE ID = ${userID}`, (err2, resp) => {
            if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
            if (resp.affectedRows === 0) {
                return res.status(404).json({message : "Error Setting New Password!"})
            } else {
                res.status(200).json({message : "New password has been set. You can now login!"});
            }
        });

    })
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


// LOGIN
const login = (req, res, next) => {
    const { login, password } = req.body;
    if (!login || !password) { return res.status(404).json({ message: 'Invalid Credentials Supplied!' }); }
    let sql = `SELECT * FROM users WHERE username = '${login}' OR  phone = '${login}' OR  email = '${login}'`;
        connection.query(sql, async (err, identifiedUser) => {
            if(err) { return res.status(422).json({message : err.sqlMessage}); }
            
            if (!identifiedUser[0]) { // If no user found
                return res.status(401).json({message : "Could not identify user, credentials seem to be wrong."});
            }
            var resComp = await bcrypt.compare(password, identifiedUser[0].password) // Compare Password using Async/Await
            if(resComp == true) {
                if (identifiedUser[0].isEnabled == 1) {
                    delete identifiedUser[0].password; // Remove Password
                var  userData = {
                    "userID" : identifiedUser[0].id,
                    "username" : identifiedUser[0].username,
                    "email" : identifiedUser[0].email,
                    "sex" : identifiedUser[0].sex,
                    "fullName" : identifiedUser[0].fullName,
                };
                const  accesstoken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: process.env.ACCESS_TOKEN_LIFE} );
                //const  accesstoken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET );
                respData = {
                    "data" : userData,
                    "accessToken" : accesstoken
                }
                res.status(200).json(respData);
                } else {
                    res.status(401).json({message : `Account has not been activated! Please, check your mail or request for another activation link here`});
                }
            } else {
                res.status(401).json({message : "Password is not correct! Try Again!!!!"}); //Error Message
            }
     });
}

// REQUEST ACTIVATION LINK
const requestActivationLink = (req, res, next) => {
    const { login } = req.body;
    if (!login) { return res.status(404).json({ message: 'Invalid Credential Supplied!' }); }
    let sql = `SELECT * FROM users WHERE username = '${login}' OR  phone = '${login}' OR  email = '${login}'`;
    connection.query(sql, (err, identifiedUser) => {
        if (err) { return res.status(422).json({message : err2.sqlMessage}); }
        if (identifiedUser.length > 0) {
            const otpCode = Math.floor(100000 + Math.random() * 900000);
            connection.query(`UPDATE users SET OTP = ${otpCode} WHERE ID = ${identifiedUser[0].ID}`, (err2, resp) => {
                const newUserID = encodeURIComponent(Buffer.from(`${identifiedUser[0].ID}`, 'binary').toString('base64'));
                const secretCode = encodeURIComponent(Buffer.from(`${otpCode}`, 'binary').toString('base64'));    
                //SEND MAIL TEMPLATE
                //sendMail = (name, email, subject, text, to, cb)
                sendMail(
                    'i2talk',
                    'noreply@i2talk.com',
                    'Activation of i2talk Account!',
                    `Hi ${identifiedUser[0].fullName.split(" ")[0]}, <br/>
                    <p>You are a click away from accessing your account. Click on the button below to activate your account.</p>
                    <center><a href="${process.env.BASE_URL}/api/users/auth/reset/${newUserID}/${secretCode}"><button style="padding: 12px; color: white; background: #000066; border: none; border-radius: 6px;">Activate My Account</button></a></center> 
                    <p>Or Copy the link below to your browser:<br/>
                    <a href="${process.env.BASE_URL}/api/users/auth/reset/${newUserID}/${secretCode}">${process.env.BASE_URL}/api/users/auth/activation/${newUserID}/${secretCode}}</a></p>
                    <br/>
                    Thanks.`, 
                    email,
                    (err3, info) => {
                        if (err3) { return res.status(500).json({ message: 'Internal Error' }); }
                        res.status(201).json({message : 'Password reset link sent. Check your mail and reset your password!'})
                });    
            });
        } else {
            return res.status(404).json({ message: 'No Account found for user!' }); 
        }
    });
}


module.exports.getUsers = getUsers;
module.exports.signup = signup;
module.exports.login = login;
module.exports.getUserByID = getUserByID;
module.exports.getUsernameByID = getUsernameByID;
module.exports.editUserDetails =  editUserDetails;
module.exports.activateAccount = activateAccount;
module.exports.resetPassword = resetPassword;
module.exports.setPassword = setPassword;
module.exports.changePassword = changePassword;
module.exports.getResetPassword = getResetPassword;
module.exports.requestActivationLink = requestActivationLink;

// MEANT FOR ISEARCH - WILL MOVE IT LATER
module.exports.getlatlongByID = getlatlongByID;
module.exports.saveUserlatlong = saveUserlatlong;