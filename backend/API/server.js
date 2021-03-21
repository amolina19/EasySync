const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('morgan');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const app = express();
const mongoose = require('./config/database');
const router = express.Router();
//const https = require('https');
//const fs = require('fs');
var jwt = require('jsonwebtoken');
const PORT = 80;

/*
const keys = {
    key: fs.readFileSync('/root/EasySync/EasySync/keys/server/key_private.pem'),
    cert: fs.readFileSync('/root/EasySync/EasySync/keys/server/certificade.pem')
};
*/

app.set('secretKey','test');
mongoose.connection.on('error', console.error.bind(console, 'Error de conexion en MongoDB'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/users',users);

app.listen(PORT,function(){
    console.log("API Listening on api.easysync.es:"+PORT);
})

app.get('/',function(req,res){
    if(req.headers.host.includes('api')){
        res.redirect(307,'/documentation');
        //res.json({"Developing":"Bulding API REST NodeJS"});
    }else{
        res.redirect(307,'/home');
        //res.json({"Developing":"Main Page"});
    }
});

