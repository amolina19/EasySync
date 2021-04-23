
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const subdomain = require('express-subdomain');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
var fileupload = require("express-fileupload");
const users = require('./routes/users');
const files = require('./routes/files');
const app = express();


const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
      info: {
        version: "1.0.0",
        title: "EasySync API",
        description: "User and Files API Information",
        contact: {
            email: "support@easysync.es"
        },
        servers: ["http://easysync.es:2096"]
      }
    },
    apis: ["routes/*.js"]
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api/documentation", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const mongoose = require('./config/database');
var helmet = require('helmet');
const https = require('https');
const email = require('./config/mail');

//const router = express.Router();
const fs = require('fs');
var jwt = require('jsonwebtoken');
const PORT = process.env.PORT
process.env.TZ = 'Europe/Madrid'

const keys = {
    key: fs.readFileSync(process.env.KEYS_KEY),
    cert: fs.readFileSync(process.env.KEYS_CERT)
};

app.use(cors());
app.use(helmet());
app.use(fileupload({
    limits: { fileSize: 2000 * 1024 * 1024 },
  }));
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

