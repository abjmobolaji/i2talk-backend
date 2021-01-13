require('dotenv').config();
const connection = require('../models/db');
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const sendMail = require('../util/mail');
const auditManager = require('./trail-controller');


///////////////////////////////////////////////////////////
    // TWILIO KEYS
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const authyKey = process.env.TWILIO_AUTHY_KEY
    const twilioNumber = process.env.TWILIO_NUMBER;
    const authy = require('authy')(authyKey);
    const twilio = require('twilio');
    var client = new twilio(accountSid, authToken);
//////////////////////////////////////////////////////////


// SIGNUP
const signup =  (req, res, next) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) { return res.status(404).json({message : 'Invalid Inputs, Check your data!'}); }
    const { fullName, username, password, email, countryCode, phone, sex, state, latitude, longitude } = req.body;
    let sql = `SELECT * FROM users WHERE username = '${username}' OR email = '${email}' OR phone = '${phone}'`;
    connection.query(sql, (err, resp) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (resp.length > 0) {
            trail = {
                actor : `Anonymous User`,
                action : `User (Username: ${username}, Email: ${email}, Phone: ${phone}) encountered a duplicate error during registeration!`,
                type : "Error"
            }
            auditManager.logTrail(trail);          
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
                const otpToken = require('crypto').randomBytes(64).toString('hex');
                let sql2 = `INSERT INTO users (fullName, username, password, email, countryCode, phone, sex, state, latitude, longitude, token) 
                        VALUES ('${fullName}', '${username}', '${hash}', '${email}', '${countryCode}', '${phone}', '${sex}', '${state}', '${latitude}', '${longitude}', '${otpToken}')`;
                connection.query(sql2, (err2, resp2) => {
                    if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                    if (resp2) {    
                        const newUserID = Buffer.from(`${resp2.insertId}`, 'binary').toString('base64');
                        const secretCode = Buffer.from(`${otpToken}`, 'binary').toString('base64');
                        const accessToken = jwt.sign({uid : newUserID, token: secretCode}, process.env.SIGNUP_TOKEN_SECRET, {expiresIn: '2h'})
                        trail = {
                            actor : `${username}`,
                            action : `User (${username}) successfully registered!`,
                            type : "success"
                        }
                        auditManager.logTrail(trail);
                        res.status(201).json({message : 'Signup Sucessful! Please, select your activation option and activate your account!', accessToken : accessToken});
                    }
                });
            });
        }
    });
}

// SELECT ACTIVATION TYPE
const activationType = (req, res, next) => {
    var { accessToken, type } = req.body;
    if(!accessToken || !type) { return res.status(401).json({message : 'Error! Supply neccessary details!'});  }
    if (type == "email") {
        jwt.verify(accessToken, process.env.SIGNUP_TOKEN_SECRET, (err, data) => {
            if (err) { return res.status(401).json({ message: 'Invalid Token' }); }
            const secretCode = encodeURIComponent(Buffer.from(`${accessToken}`, 'binary').toString('base64'));
            var userID = Buffer.from(data.uid, 'base64').toString();
            connection.query(`SELECT fullName, email FROM users WHERE id = ${userID}`, (err1, resp) =>{
                if (err1) { return res.status(422).json({message : err1.sqlMessage}); }
                //SEND MAIL TEMPLATE
                //sendMail = (name, email, subject, text, to, cb)
                sendMail(
                    'i2talk',
                    'noreply@i2talk.com',
                    'User Registration Successful! Please, Activate Your Account!',
                    `Hi ${resp[0].fullName.split(" ")[0]}, <br/>
                    <p>Welcome to <b>i2talk</b>, you are a click away from accessing your account. Click on the button below to activate your account.</p>
                    <center><a href="${process.env.BASE_URL}/api/auth/activation/${secretCode}"><button style="padding: 12px; color: white; background: #000066; border: none; border-radius: 6px;">Activate My Account</button></a></center> 
                    <p>Or Copy the link below to your browser:<br/>
                    <a href="${process.env.BASE_URL}/api/auth/activation/${secretCode}">${process.env.BASE_URL}/api/auth/activation/${secretCode}}</a></p>
                    <br/>Thanks.`, 
                    resp[0].email,
                    (err3, info) => {
                        if (err3) { return res.status(500).json({ message: 'Internal Error' }); }
                        trail = {
                            actor : `${resp[0].username}`,
                            action : `User (${resp[0].username}) initiated Email verification!`,
                            type : "success"
                        }
                        auditManager.logTrail(trail);
                        res.status(201).json({message : 'Activation mail sent, check your mail and activate your account!'})
                });
            })            
        });
    } else if (type == "sms" || type == "call") {
        jwt.verify(accessToken, process.env.SIGNUP_TOKEN_SECRET, (err, data) => {
            if (err) { return res.status(401).json({ message: 'Invalid Token' }); }
            var userID = Buffer.from(data.uid, 'base64').toString();
            connection.query(`SELECT email, countryCode, phone FROM users WHERE id = ${userID}`, (err1, resp) =>{
                if (err1) { return res.status(422).json({message : err1.sqlMessage}); }
                // Register Auty User..Some user info is passed in below to register a user on twilio
                // Auty and generate an id
                authy.register_user (resp[0].email, resp[0].phone, resp[0].countryCode,
                    (errAuthy, respAuthy) => {
                    if (errAuthy || !respAuthy.user) { return res.status(422).json({message : errAuthy}); }
                    const authyId = respAuthy.user.id;  //Authy id generated

                    // Authy id stored in db for the newly created user
                    connection.query(`UPDATE users SET authyId = '${authyId}' where email = '${resp[0].email}'`, (err3, resp3) => {
                        if (err3) { return res.status(422).json({message : err3.sqlMessage }); }   
                        
                        
                        // Request to send verification sms ..Authy id is passed in
                        if (type == "sms") {
                            trail = {
                                actor : `${resp[0].username}`,
                                action : `User (${resp[0].username}) initiated SMS verification!`,
                                type : "success"
                            }
                            auditManager.logTrail(trail);
                            authy.request_sms(authyId, true, (err4, response) => {
                                if (response.success == "false") return res.status(422).send('Sms not sent')
                            });
                        }  else if (type == "call") {
                            trail = {
                                actor : `${resp[0].username}`,
                                action : `User (${resp[0].username}) initiated Call verification!`,
                                type : "success"
                            }
                            auditManager.logTrail(trail);
                            authy.request_call(authyId, true, (err4, response) => {
                                if (response.success == "false") return res.status(422).send('Call cannot be made!')
                            });
                        }
                        //console.log(authyId)

                        // Store the authyid as token and sign using jwt..
                        // It is preferable to store the whole user data
                        let verify = { verify: authyId }
                        let token = jwt.sign(verify, process.env.AUTHY_TOKEN_SECRET, {expiresIn: '1h'})
                        res.header('x-verify-token', token).status(201).send('Verification code sent');
                    })
                })
            })
        });
    } else {
        trail = {
            actor : `Anonymous User`,
            action : `Anonymous User tried validating account with invalid credentials!`,
            type : "danger"
        }
        auditManager.logTrail(trail);
        return res.status(401).json({message : 'Error! Supply neccessary details!'}); 
    }
}


// ACTIVATE/VERIFY USER ACCOUNT VIA EMAIL
const activateAccountEmail = (req, res, next) => {
    var { accessToken } = req.params;
    if(!accessToken) return res.status(403).json({ message: 'Error!!! Check Link Again' });
    // DECODE URI COMPONENT
    const decodedToken = decodeURIComponent(accessToken);
    // DECODE BACK TO BINARY
    accessToken = Buffer.from(decodedToken, 'base64').toString();
    
    // VERIFY TOKEN
    jwt.verify(accessToken, process.env.SIGNUP_TOKEN_SECRET, (err, data) => {
        if (err) { 
            trail = {
                actor : `Anonymous User`,
                action : `Anonymous User tried validating account with invalid token via email!`,
                type : "danger"
            }
            auditManager.logTrail(trail);
            return res.status(401).json({ message: 'Error!!! Check Link Againj' }); 
        }
        // DECODE BASE64 TO GET THE RAW DATA
        userID = Buffer.from(data.uid, 'base64').toString();
        otpToken = Buffer.from(data.token, 'base64').toString();
        connection.query(`SELECT email, token, isEnabled FROM users WHERE ID = ${userID}`, (err, resp) => {
            if (err) { return res.status(422).json({message : err.sqlMessage}); }
            if (resp.length > 0) {
                if (resp[0].isEnabled == 1) {
                    trail = {
                        actor : `${resp[0].username}`,
                        action : `Activated User Account (${resp[0].username}) tried activating again!`,
                        type : "error"
                    }
                    auditManager.logTrail(trail);
                    return res.status(200).json({message : 'Account already activated! Proceed to login'})
                }
                if (resp[0].token == otpToken) {
                    connection.query(`UPDATE users SET isEnabled = 1 WHERE ID = ${userID}`, (err2, resp2) => {
                        if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                        trail = {
                            actor : `${resp2[0].username}`,
                            action : `User Account (${resp2[0].username}) activated via email!`,
                            type : "success"
                        }
                        auditManager.logTrail(trail);
                        return res.status(201).json({message : 'Account activated! You may proceed to login'})
                    });
                } else {
                    trail = {
                        actor : "Anonymous User",
                        action : `Anonymous User attempted to validating account, Invalid Link!`,
                        type : "danger"
                    }
                    auditManager.logTrail(trail);
                    return res.status(401).json({message : 'Error validating account! Check Activation Link Again'})
                }
            } else {
                trail = {
                    actor : "Anonymous User",
                    action : `Anonymous User attempted to activate account, No account Found!`,
                    type : "danger"
                }
                auditManager.logTrail(trail);
                return res.status(404).json({message : 'No account found! Check Activation Link Again'})
            }
        });
    });
}
// ACTIVATE/VERIFY USER ACCOUNT VIA PHONE
const activateAccountPhone = (req, res, next) => {
    const { onetimepass } = req.body
    if(!onetimepass) { return res.status(401).json({message : 'Error! Supply neccessary details!'});  }
    // Authy verfication method : AuthyId passed as req.user.verify from token stored earlier
    authy.verify(req.user.verify, onetimepass, function(err, response) {
        if (err) return res.status(500).send('Something went wrong');
        
        // Users verified field set to true from default false if verification is successful
        connection.query(`UPDATE users SET isEnabled = '1' where authyId = '${req.user.verify}'`, (err, response) => {
            if (err) throw err   
            // Get the user data  amd use it to send welcome message via sms
/*             connection.query(`select * from users where authyId = ${req.user.verify} LIMIT 1`, (error, response) => {
                //console.log(response[0])
                const toNumber = response[0].countryCode + response[0].phone;
                //console.log(toNumber)
                const message = `Hello ${response[0].fullName}, Welcome to i2talk, Your account has been activated. You can Now chat on the Go!!`
                client.messages.create({
                    body: message,
                    to: toNumber,  // Text this number
                    from: twilioNumber // From a valid Twilio number
                })
                .then((message) => {
                    if(message.sid != "") {
                        return res.status(200).send('Verification Successful! You may proceed to Login.');
                    }
                });
                
            }) */
            trail = {
                actor : `${response[0].username}`,
                action : `User Account (${response[0].username}) activated via phone!`,
                type : "success"
            }
            auditManager.logTrail(trail);
            return res.status(200).send('Verification Successful! You may proceed to Login.');
        })
    });
}

/* ************************************************************************************************************************************************************************ */

// RESET PASSWORD FOR USER
const resetPassword = (req, res, next) => {
    const { login } = req.body;
    if (!login) { return res.status(404).json({ message: 'Invalid Credential Supplied!' }); }
    let sql = `SELECT * FROM users WHERE username = '${login}' OR  phone = '${login}' OR  email = '${login}'`;
    const otpToken = require('crypto').randomBytes(64).toString('hex');
    connection.query(sql, (err, identifiedUser) => {
        if (err) {  return res.status(422).json({message : err.sqlMessage}); }
        if (identifiedUser.length > 0) {
            connection.query(`UPDATE users SET users.token = '${otpToken}' WHERE ID = ${identifiedUser[0].id}`, (err2, resp2) => {
                if (err2) { 
                    //console.log(err2);
                    return res.status(422).json({message : err2.sqlMessage}); 
                }
                if (resp2) { 
                    const newUserID = Buffer.from(`${identifiedUser[0].id}`, 'binary').toString('base64');
                    const secretCode = Buffer.from(`${otpToken}`, 'binary').toString('base64');    
                    const accessToken = jwt.sign({uid : newUserID, token: secretCode}, process.env.RESET_TOKEN_SECRET, {expiresIn: '1h'});
                    trail = {
                        actor : `${identifiedUser[0].username}`,
                        action : `User ${identifiedUser[0].username} initiated a password reset!`,
                        type : "success"
                    }
                    auditManager.logTrail(trail);
                    res.status(201).json({message : 'Select your reset password method!', accessToken : accessToken});
                }
            });
        } else {
            trail = {
                actor : "Anonymous User",
                action : `Anonymous User attempted to reset password, No account Found!`,
                type : "danger"
            }
            auditManager.logTrail(trail);
            // return status 200 to deceive bots instead of 404
            return res.status(200).json({ message: 'No Account found for user!' }); 
        }
    });
}

// SELECT RESET METHOD
const resetOptions = (req, res, next) => {
    var { accessToken, type } = req.body;
    if(!accessToken || !type) { return res.status(401).json({message : 'Error! Supply neccessary details!'});  }
    if (type == "email") {
        jwt.verify(accessToken, process.env.RESET_TOKEN_SECRET, (err, data) => {
            if (err) { return res.status(401).json({ message: 'Invalid Token' }); }
            const resetToken = encodeURIComponent(Buffer.from(`${accessToken}`, 'binary').toString('base64'));            
            var userID = Buffer.from(data.uid, 'base64').toString();
            connection.query(`SELECT fullName, email FROM users WHERE id = ${userID}`, (err1, identifiedUser) =>{
                if (err1) { return res.status(422).json({message : err1.sqlMessage}); }
                //SEND MAIL TEMPLATE
                //sendMail = (name, email, subject, text, to, cb)
                sendMail(
                    'i2talk',
                    'noreply@i2talk.com',
                    'Request to Reset Password, i2talk Account!',
                    `Hi ${identifiedUser[0].fullName.split(" ")[0]}, <br/>
                    <p>A request was initiated to reset your password. Click on the button below to reset your account password.</p>
                    <center><a href="${process.env.BASE_URL}/api/auth/reset/${resetToken}"><button style="padding: 12px; color: white; background: #000066; border: none; border-radius: 6px;">Reset Password</button></a></center> 
                    <p>Or Copy the link below to your browser:<br/>
                    <a href="${process.env.BASE_URL}/api/auth/reset/${resetToken}">${process.env.BASE_URL}/api/auth/activation/${resetToken}}</a></p>
                    <br/>
                    Please, ignore and delete this mail if you did not make the request! Thanks.`, 
                    identifiedUser[0].email,
                    (err3, info) => {
                        if (err3) { return res.status(500).json({ message: 'Internal Error' }); }
                        trail = {
                            actor : `${identifiedUser[0].username}`,
                            action : `User ${identifiedUser[0].username} initiated a password reset via email!`,
                            type : "success"
                        }
                        auditManager.logTrail(trail);
                        res.status(201).json({message : 'Password reset link sent. Check your mail and reset your password!'})
                });
            });            
        });
    } else if (type == "sms" || type == "call") {
        jwt.verify(accessToken, process.env.RESET_TOKEN_SECRET, (err, data) => {
            if (err) { return res.status(401).json({ message: 'Invalid Token' }); }
            var userID = Buffer.from(data.uid, 'base64').toString();
            connection.query(`SELECT email, countryCode, phone FROM users WHERE id = ${userID}`, (err1, resp) =>{
                if (err1) { return res.status(422).json({message : err1.sqlMessage}); }
                // Register Auty User..Some user info is passed in below to register a user on twilio
                // Auty and generate an id
                authy.register_user (resp[0].email, resp[0].phone, resp[0].countryCode,
                    (errAuthy, respAuthy) => {
                    if (errAuthy || !respAuthy.user) { return res.status(422).json({message : errAuthy}); }
                    const authyId = respAuthy.user.id;  //Authy id generated
                    trail = {
                        actor : `${resp[0].username}`,
                        action : `User ${resp[0].username} initiated a password reset via phone!`,
                        type : "success"
                    }
                    auditManager.logTrail(trail);
                    // Authy id stored in db for the newly created user
                    connection.query(`UPDATE users SET authyId = '${authyId}' where email = '${resp[0].email}'`, (err3, resp3) => {
                        if (err3) { return res.status(422).json({message : err3.sqlMessage }); }   
                        
                        // Request to send verification sms ..Authy id is passed in
                        if (type == "sms") {
                            authy.request_sms(authyId, true, (err4, response) => {
                                if (response.success == "false") { 
                                    trail = {
                                        actor : `${resp[0].username}`,
                                        action : `SMS could not be sent to User ${resp[0].username}!`,
                                        type : "error"
                                    }
                                    auditManager.logTrail(trail);
                                    return res.status(422).send('Sms not sent') 
                                }
                            });
                        }  else if (type == "call") {
                            authy.request_call(authyId, true, (err4, response) => {
                                if (response.success == "false") { 
                                    trail = {
                                        actor : `${resp[0].username}`,
                                        action : `Call could not be sent to User ${resp[0].username}!`,
                                        type : "error"
                                    }
                                    auditManager.logTrail(trail);
                                    return res.status(422).send('Call cannot be made!') 
                                }
                            });
                        }
                        //console.log(authyId)

                        // Store the authyid as token and sign using jwt..
                        // It is preferable to store the whole user data
                        let verify = { verify: authyId }
                        let token = jwt.sign(verify, process.env.AUTHY_TOKEN_SECRET, {expiresIn: '1h'})
                        res.header('x-verify-token', token).status(201).send('Reset code sent');
                    })
                })
            })
        });
    } else {
        trail = {
            actor : "Anonymous User",
            action : `Anonymous User was not able to initiate reset password, Invalid Details!`,
            type : "error"
        }
        auditManager.logTrail(trail);
        return res.status(401).json({message : 'Error! Supply neccessary details!'}); 
    }
}

// GET RESET PASSWORD
const getResetPassword = (req, res, next) => {
    var { resetToken } = req.params;
    if(!resetToken) return res.status(403).json({ message: 'Error!!! Check Link Again' });
    // DECODE URI COMPONENT
    const decodedToken = decodeURIComponent(resetToken);
    // DECODE BACK TO BINARY
    resetCode = Buffer.from(decodedToken, 'base64').toString();

    jwt.verify(resetCode, process.env.RESET_TOKEN_SECRET, (errToken, data) => {
        if (errToken) return res.status(403).json({ message: 'Error!!! Check Link Again' });
        // DECODE BASE64 TO GET THE RAW DATA
        userID = Buffer.from(data.uid, 'base64').toString();
        otpToken = Buffer.from(data.token, 'base64').toString();
        
        connection.query(`SELECT email, token FROM users WHERE ID = ${userID}`, (err, resp) => {
            if (err) { return res.status(422).json({message : err.sqlMessage}); }
            if (resp.length > 0) {
                if (resp[0].token == otpToken) {
                    return res.status(200).json({ token : resetToken, status : "Verified" })
                } else {
                    trail = {
                        actor : "User",
                        action : `User was not able to reset password, Invalid Link!`,
                        type : "error"
                    }
                    auditManager.logTrail(trail);
                    return res.status(401).json({message : 'Error resetting passowrd! Check Reset Link Again'})
                }
            } else {
                trail = {
                    actor : "Anonymous User",
                    action : `Anonymous User attempted to reset password, No account Found!`,
                    type : "danger"
                }
                auditManager.logTrail(trail);
                // status 200 used to deceive bots instead of 404
                return res.status(200).json({message : 'No account found! Check Reset Link Again'})
            }
        });
    });
}

// SET NEW PASSWORD FOR USER AFTER RESET
const setPassword = (req, res, next) => {
    var { resetToken, password } = req.body;
    if (!resetToken || !password) { return res.status(404).json({ message: 'Invalid Credentials Supplied!' }); }
    // DECODE URI COMPONENT
    const decodedToken = decodeURIComponent(resetToken);
    // DECODE BACK TO BINARY
    resetCode = Buffer.from(decodedToken, 'base64').toString();

    jwt.verify(resetCode, process.env.RESET_TOKEN_SECRET, (errToken, data) => {
        if (errToken) return res.status(403).json({ message: 'Error!!! Check Link Again' });
        userID = Buffer.from(data.uid, 'base64').toString();
        otpToken = Buffer.from(data.token, 'base64').toString();

        connection.query(`SELECT email, token FROM users WHERE ID = ${userID}`, (err, resp) => {
            if (err) { return res.status(422).json({message : err.sqlMessage}); }
            if (resp.length > 0) {
                if (resp[0].token != otpToken) {
                    trail = {
                        actor : "User",
                        action : `User was not able to reset password, Invalid Link!`,
                        type : "error"
                    }
                    auditManager.logTrail(trail);
                    return res.status(401).json({message : 'Error resetting passowrd! Check Reset Link Again'})
                }
            } else {
                trail = {
                    actor : "Anonymous User",
                    action : `Anonymous User attempted to reset password, No account Found!`,
                    type : "danger"
                }
                auditManager.logTrail(trail);
                // status 200 used to deceive bots instead of 404
                return res.status(200).json({message : 'No account found! Check Reset Link Again'})
            }
        });
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) { return res.status(500).json({ message: 'Internal Error' }); }
            connection.query(`UPDATE users SET password = '${hash}' WHERE ID = ${userID}`, (err2, resp) => {
                if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                if (resp.affectedRows === 0) {
                    trail = {
                        actor : "User",
                        action : `User was not able to reset password!`,
                        type : "error"
                    }
                    auditManager.logTrail(trail);
                    return res.status(404).json({message : "Error Setting New Password!"})
                } else {
                    trail = {
                        actor : "User",
                        action : `User with ID ${userID} was able to reset password!`,
                        type : "success"
                    }
                    auditManager.logTrail(trail);
                    res.status(200).json({message : "New password has been set. You can now login!"});
                }
            });

        })
    });
}

// SET USER PASSWORD VIA PHONE
const resetPhone = (req, res, next) => {
    const { onetimepass, password } = req.body
    if(!onetimepass || !password) { return res.status(401).json({message : 'Error! Supply neccessary details!'});  }
    // Authy verfication method : AuthyId passed as req.user.verify from token stored earlier
    authy.verify(req.user.verify, onetimepass, function(err, response) {
        if (err) return res.status(500).send('Something went wrong');
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) { return res.status(500).json({ message: 'Internal Error' }); }
            connection.query(`UPDATE users SET password = '${hash}' WHERE authyId = '${req.user.verify}'`, (err2, resp) => {
                if (err2) { return res.status(422).json({message : err2.sqlMessage}); }
                if (resp.affectedRows === 0) {
                    trail = {
                        actor : "User",
                        action : `User was not able to reset password!`,
                        type : "error"
                    }
                    auditManager.logTrail(trail);
                    return res.status(404).json({message : "Error Setting New Password!"})
                } else {
                    trail = {
                        actor : "User",
                        action : `User with Authy ID (${req.user.verify}) was able to reset password! with phone!`,
                        type : "success"
                    }
                    auditManager.logTrail(trail);
                    res.status(200).json({message : "New password has been set. You can now login!"});
                }
            });
        });    
    });
}

/* ************************************************************************************************************************************************************************ */

// LOGIN
const login = (req, res, next) => {
    const { login, password } = req.body;
    if (!login || !password) { return res.status(404).json({ message: 'Invalid Credentials Supplied!' }); }
    let sql = `SELECT * FROM users WHERE username = '${login}' OR  phone = '${login}' OR  email = '${login}'`;
        connection.query(sql, async (err, identifiedUser) => {
            if(err) { return res.status(422).json({message : err.sqlMessage}); }
            
            if (!identifiedUser[0]) { // If no user found
                trail = {
                    actor : "Anonymous",
                    action : `Anonymous User with ${login} attempted to login with invalid credentials!`,
                    type : "danger"
                }
                auditManager.logTrail(trail);
                return res.status(401).json({message : "Could not identify user, credentials seem to be wrong."});
            }
            var resComp = await bcrypt.compare(password, identifiedUser[0].password) // Compare Password using Async/Await
            if(resComp == true) {
                if (identifiedUser[0].isEnabled == 1) {
                    delete identifiedUser[0].password; // Remove Password
                    connection.query(`SELECT * FROM user_roles WHERE userID = ${identifiedUser[0].id}`, (errUser, dataUser) => {
                        if (errUser) { return res.status(422).json({message : err.sqlMessage}); }
                        if (dataUser.length > 0) {
                            var userType = "admin";
                        } else {
                            var userType = "user";
                        }
                        var  userData = {
                            "userID" : identifiedUser[0].id,
                            "username" : identifiedUser[0].username,
                            "email" : identifiedUser[0].email,
                            "sex" : identifiedUser[0].sex,
                            "fullName" : identifiedUser[0].fullName,
                            "userType" : userType
                        };
                        const  accesstoken = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET,  { expiresIn: process.env.ACCESS_TOKEN_LIFE} );
                        //const  accesstoken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET );
                        respData = {
                            "data" : userData,
                            "accessToken" : accesstoken
                        }
                        trail = {
                            actor : `${identifiedUser[0].username}`,
                            action : `User ${identifiedUser[0].username} logged in successfully.`,
                            type : "success"
                        }
                        auditManager.logTrail(trail);
                        res.status(200).json(respData);
                    });
                } else {
                    trail = {
                        actor : `${identifiedUser[0].username}`,
                        action : `Inactivated User Account ${identifiedUser[0].username} attempted logging in.`,
                        type : "critical"
                    }
                    auditManager.logTrail(trail);
                    res.status(401).json({message : `Account has not been activated! Please, check your mail or request for another activation here`});
                }
            } else {
                trail = {
                    actor : "Anonymous",
                    action : `Anonymous User with ${login} attempted to login with incorrect Password!`,
                    type : "danger"
                }
                auditManager.logTrail(trail);
                res.status(401).json({message : "Password is not correct! Try Again!!!!"}); //Error Message
            }
     });
}

// REQUEST ACTIVATION LINK
const requestActivationLink = (req, res, next) => {
    const { login } = req.body;
    if (!login) { return res.status(404).json({ message: 'Invalid Credential Supplied!' }); }
    let sql = `SELECT * FROM users WHERE username = '${login}' OR  phone = '${login}' OR  email = '${login}'`;
    const otpToken = require('crypto').randomBytes(64).toString('hex');
    connection.query(sql, (err, identifiedUser) => {
        if (err) { return res.status(422).json({message : err.sqlMessage}); }
        if (identifiedUser.length > 0) { 
            if (identifiedUser[0].isEnabled == "0") { 
                const newUserID = Buffer.from(`${identifiedUser[0].id}`, 'binary').toString('base64');
                const secretCode = Buffer.from(`${otpToken}`, 'binary').toString('base64');
                const accessToken = jwt.sign({uid : newUserID, token: secretCode}, process.env.SIGNUP_TOKEN_SECRET, {expiresIn: '1h'});
                connection.query(`UPDATE users SET users.token = '${otpToken}' WHERE ID = ${identifiedUser[0].id}`, (err2, resp) => {
                    trail = {
                        actor : `${identifiedUser[0].username}`,
                        action : `User (${identifiedUser[0].username}) requested for new activation options!`,
                        type : "success"
                    }
                    auditManager.logTrail(trail);
                    return res.status(201).json({message : 'Select your activation option and activate your account!', accessToken : accessToken});
                });
            } else {
                trail = {
                    actor : `${identifiedUser[0].username}`,
                    action : `Activated User (${identifiedUser[0].username}) tried requesting for new activation!`,
                    type : "error"
                }
                auditManager.logTrail(trail);
                return res.status(200).json({message : 'Account already activated, You may proceed to login!'});
            }
        } else {
            trail = {
                actor : `Anonymous User`,
                action : `Anonymous User requested for new activation options!`,
                type : "danger"
            }
            auditManager.logTrail(trail);
            return res.status(404).json({ message: 'No Account found for user!' }); 
        }
    });
}


module.exports.signup = signup;
module.exports.login = login;
module.exports.activateAccountEmail = activateAccountEmail;
module.exports.activateAccountPhone = activateAccountPhone;
module.exports.activationType = activationType;
module.exports.resetPassword = resetPassword;
module.exports.setPassword = setPassword;
module.exports.resetOptions = resetOptions;
module.exports.getResetPassword = getResetPassword;
module.exports.resetPhone = resetPhone;
module.exports.requestActivationLink = requestActivationLink;
