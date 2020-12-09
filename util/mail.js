const nodemailer = require('nodemailer');
const mailGun = require('nodemailer-mailgun-transport');
require('dotenv').config();

const auth = {
    auth: {
        api_key: process.env.MAIL_API_KEY,
        domain: process.env.MAIL_DOMAIN,
    }
};

const transporter = nodemailer.createTransport(mailGun(auth));

const sendEmail = (name, email, subject, text, to, cb) => {
    const mailOptions = {
        from: {name: name, address: email},
        to: to,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
        //   console.log(`Error: ${err}`);
            cb(err, null);
        }
        else {
        //   console.log(`Response: ${info}`);
            cb(null, info);
        }
      }
    );
}

module.exports = sendEmail;