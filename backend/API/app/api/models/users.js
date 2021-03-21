// Cargamos el módulo de mongoose
const mongoose = require('mongoose');
// Cargamos el módulo de bcrypt
const bcrypt = require('bcrypt');
// Definimos el factor de costo, el cual controla cuánto tiempo se necesita para calcular un solo hash de BCrypt. Cuanto mayor sea el factor de costo, más rondas de hash se realizan. Cuanto más tiempo sea necesario, más difícil será romper el hash con fuerza bruta.
var encrypt = require('mongoose-encryption');
//Para encriptar el objeto en la base de datos
const dotenv = require('dotenv');
dotenv.config();
//Variables de entorno donde estaran las claves
const saltRounds = 10;
//Definimos los esquemas
const Schema = mongoose.Schema;
// Creamos el objeto del esquema con sus correspondientes campos
const UserSchema = new Schema({
    username :{
        type: String,
        trim: true,
        required: true
    },
    email :{
        type: String,
        trim: true,
        required: true
    },
    password :{
        type: String,
        trim: true,
        required: true
    },
    created_at:{
        type: Date
    },
    last_login:{
        type: Date
    }
});

var encKey = process.env.SOME_32BYTE_BASE64_STRING;
var sigKey = process.env.SOME_64BYTE_BASE64_STRING;
// Antes de almacenar la contraseña en la base de datos la encriptamos con Bcrypt, esto es posible gracias al middleware de mongoose
UserSchema.pre('save',function(next){
    this.password = bcrypt.hashSync(this.password, saltRounds);
    next();
});
//Utilizar el plugin para encriptar los datos de este esquema.
UserSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey });

// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('User', UserSchema);