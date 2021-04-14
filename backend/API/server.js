const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const users = require('./routes/users');
const files = require('./routes/files');
const app = express();

const mongoose = require('./config/database');
var helmet = require('helmet');
const https = require('https');
const email = require('./config/mail');

//const router = express.Router();
const fs = require('fs');
var jwt = require('jsonwebtoken');
const PORT = process.env.PORT

const keys = {
    key: fs.readFileSync('/etc/letsencrypt/live/easysync.es/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/easysync.es/fullchain.pem')
};

app.use(cors());
app.use(helmet());
app.set('secretKey',process.env.SECRET_KEY);
mongoose.connection.on('error', console.error.bind(console, 'Error de conexion en MongoDB'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));




app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


app.use('/api/users',users);
app.use('/api/files',files);

app.get('/',function(req,res){
    if(req.headers.host.includes('api')){
        res.redirect(307,'/documentation');
        //res.json({"Developing":"Bulding API REST NodeJS"});
    }else{
        res.redirect(307,'/home');
        //res.json({"Developing":"Main Page"});
    }
});

var server = https.createServer(keys, app);

server.listen(PORT,function(){
    console.log("API Listening on api.easysync.es:"+PORT);
    email.testConnection();
    email.sendmail();
});

