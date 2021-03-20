const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const users = require('./routes/users');
const app = express();
const mongoose = require('./config/database');
var jwt = require('jsonwebtoken');

app.set('secretKey','test');
mongoose.connection.on('error', console.error.bind(console, 'Error de conexion en MongoDB'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
    res.json({"Developing":"Bulding API REST NodeJS"});
});

app.use('/users',users);

app.listen(3000, function(){
    console.log('Listening on http://localhost:3000');
});