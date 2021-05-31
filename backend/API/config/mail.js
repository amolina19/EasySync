const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
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
            subject: "Server API opened on "+process.env.EMAIL_DOMAIN+":"+process.env.PORT, // Subject line
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
    sendmailactivateacc: function(user,token){

        
        let link = "https://"+process.env.EMAIL_DOMAIN.toLowerCase()+"/activate?token="+token;
        let email = "<b>Aquí tienes tu link de activación "+user.username+"</b>, <a href="+link+">"+link+"</a>";

        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: user.email, // list of receivers
            subject: "Activar tu cuenta", // Subject line, // plain text body
            html: email, // html body
        });
    },
    sendmailrecoverpassword: function(user,token){

        let link = "https://"+process.env.EMAIL_DOMAIN.toLowerCase()+"/recover-password?token="+token;
        let email = "Aquí tienes el link para recuperar tu contraseña </b>"+user.username+"</b>, <a href="+link+">"+link+"</a>";
        
        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: user.email, // list of receivers
            subject: "Recuperación de contraseña", // Subject line
            html: email, // html body
        });
        
    },
    sendT2ACode: function(user,code){
        //let link = "https://"+process.env.EMAIL_DOMAIN.toLowerCase()+":2096/api/users/activate?token="+token;
        let email = "Aquí tienes tu código de autenticación "+user.username+", <b>"+code+"</b>";

        let info = transporter.sendMail({
            from: process.env.EMAIL_DOMAIN+' '+process.env.EMAIL_HEADER, // sender address
            to: user.email, // list of receivers
            subject: "Código de Autenticación ", // Subject line, // plain text body
            html: email, // html body
        });
    }
}