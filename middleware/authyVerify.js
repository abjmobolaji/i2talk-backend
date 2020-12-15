const jwt = require('jsonwebtoken');
require('dotenv').config();

function verify (req, res, next) {
    const token = req.header('x-verify-token');
    if (!token) return res.status(401).send('Access denied, No token Provided');

    try {
        const decoded = jwt.verify(token, process.env.AUTHY_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}



module.exports = verify;
// exports.permissionCheck = permissionCheck;