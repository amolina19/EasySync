// Cargamos el módulo de mongoose
const mongoose = require('mongoose');
// Cargamos el módulo de bcrypt
const bcrypt = require('bcrypt');
// Definimos el factor de costo, el cual controla cuánto tiempo se necesita para calcular un solo hash de BCrypt. Cuanto mayor sea el factor de costo, más rondas de hash se realizan. Cuanto más tiempo sea necesario, más difícil será romper el hash con fuerza bruta.
//var encrypt = require('mongoose-encryption');
//Para encriptar el objeto en la base de datos
const dotenv = require('dotenv');
dotenv.config();
//Variables de entorno donde estaran las claves
const saltRounds = 10;
//Definimos los esquemas
const Schema = mongoose.Schema;
// Creamos el objeto del esquema con sus correspondientes campos

const typeUser = {
    user: 0,
    admin: 1
}

const user_plan = {
    free : 2147483648,
    plus : 10737418240,
    enterprise: 53687091200
}

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
    activated:{
        type: Boolean
    },
    created_at:{
        type: Date
    },
    last_login:{
        type: Date
    },
    storage_limit:{
        type:Number
    },
    type_user:{
        type:Number
    },
    t2a:{
        type:Boolean
    },
    t2a_code:{
        type:String
    }
});

var encKey = process.env.SOME_32BYTE_BASE64_STRING;
var sigKey = process.env.SOME_64BYTE_BASE64_STRING;
// Antes de almacenar la contraseña en la base de datos la encriptamos con Bcrypt, esto es posible gracias al middleware de mongoose
UserSchema.pre('save',function(next){
    this.password = bcrypt.hashSync(this.password, saltRounds);
    this.storage_limit = user_plan.free;
    this.type_user = typeUser.user;
    this.t2a = false;
    next();
});
//Utilizar el plugin para encriptar los datos de este esquema.
//UserSchema.plugin(encrypt, { encryptionKey: encKey, signingKey: sigKey });

// Exportamos el modelo para usarlo en otros ficheros
module.exports = mongoose.model('User', UserSchema);