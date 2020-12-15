require('dotenv').config();
const connection  = require('../models/db');
const jwt = require('jsonwebtoken');

// AUTHENTICATE USERS
var authenticateUser = (req, res, next) => {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(" ")[1];
    if(!token) { return res.status(401).json({message : "Unauthorized!!! Try Login again!"})}
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, tokenData) => {
        if (err) { return res.status(401).json({ message: 'Invalid Token, Try Login Again' }); }
        req.data = tokenData;
        next();
    });
}

// AUTHORIZE ADMIN
var authorizeUser = (permissions) => {
    return async (req, res, next) => {
        try {
            var userData = req.data;
            let sql = `SELECT permissionName, permissionDescription FROM permissions 
            INNER JOIN roles_permissions ON roles_permissions.permissionsID = permissions.permissionID 
            INNER JOIN roles ON roles.roleID = roles_permissions.roleID 
            INNER JOIN user_roles ON user_roles.roleID = roles_permissions.roleID 
            WHERE user_roles.userID = ${userData.userID}`;
            connection.query(sql, (err, resp) => {
                //if (err) {  res.status(422).json({message : err.sqlMessage}); }
                if (resp.length > 0) {
                    var found = resp.find(user => user.permissionName == permissions);
                    if (found) {
                        userData["canUser"] = "true";
                    } else {
                        userData["canUser"] = "false";
                    }
                }
                else {
                    userData["canUser"] = "false";
                }
                req.data = userData; 
                next();
            });
        } catch (err) {
            userData["canUser"] = "false";
            next(err);
        }
    }
} 

var canUser = (req, res, next) => {
    if (req.data.canUser === "false") { return res.status(403).json({message : "Access Forbidden!!"}); }
    delete req.data.canUser;
    req.data = req.data;
    next();
};





module.exports.authenticateUser = authenticateUser;
module.exports.authorizeUser = authorizeUser;
module.exports.canUser = canUser;
