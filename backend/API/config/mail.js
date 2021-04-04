const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_OUTCOMING_SERVER,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_CONFIG_USER,
      pass: process.env.EMAIL_CONFIG_PASSWORD
    },
    tls:{
        ciphers:'SSLv3'
    }
});


module.exports = {
    testConnection: function(){

        transporter.verify(function(error,success){
            if(error){
                console.log(error);
            }else{
                console.log("SMPT IS READY");
            }
        });
    },
    sendmail: function(){

        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: "alejandro.molina.daw@gmail.com", // list of receivers
            subject: "testing", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
    },
    sendmailto: function(user){

        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: user.email, // list of receivers
            subject: "testing", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
    },
    sendmailactivateacc: function(user){

        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: user.email, // list of receivers
            subject: "Activate your email account "+user.username, // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
    },
    sendmailrecoverpassword: function(user){
        
        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: user.email, // list of receivers
            subject: "Recover your password "+user.username, // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        });
        
    }
}