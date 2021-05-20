
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('morgan');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const files = require('./routes/files');
var app = express();
var cors = require('cors');
app.use(cors());
const mongoose = require('./config/database');
const https = require('https');
const email = require('./config/mail');
const fs = require('fs');
const PORT = process.env.PORT;
//const router = express.Router();
var helmet = require('helmet');
var fileupload = require("express-fileupload");
//var jwt = require('jsonwebtoken');
process.env.TZ = 'Europe/Madrid'

const keys = {
    key: fs.readFileSync(process.env.KEYS_KEY),
    cert: fs.readFileSync(process.env.KEYS_CERT)
};

app.use(helmet());
app.use(fileupload({
    limits: { fileSize: 2000 * 1024 * 1024 },
  }));
app.set('secretKey',process.env.SECRET_KEY);
mongoose.connection.on('error', console.error.bind(console, 'Error de conexion en MongoDB'));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method,Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Credentials', true);
    next();
});




app.use('/api/users',users);
app.use('/api/files',files);

var server = https.createServer(keys, app);

server.listen(PORT,function(){
    console.log("API Listening on api.easysync.es:"+PORT);
    //email.testConnection();
    //email.sendmail();
});

