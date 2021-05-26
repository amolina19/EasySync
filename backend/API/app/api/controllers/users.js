const userModel = require('../models/users');
const sessionModel = require('../models/session');
const logsModel = require('../models/logs');
const request = require('request');
const STORAGE = process.env.STORAGE_PATH;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const email = require('../../../config/mail');
const easyCrypt = require('../utils/crypto');
const { generateKeyPair } = require('crypto');
const CryptoJS = require('crypto-js');


function encrypt(msg, pass) {
    var salt = CryptoJS.lib.WordArray.random(128/8);
    
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: process.env.ENCRYPTION_KEYSIZE/32,
        iterations: process.env.ENCRYPTION_ITERATIONS
      });
  
    var iv = CryptoJS.lib.WordArray.random(128/8);
    
    var encrypted = CryptoJS.AES.encrypt(msg, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
      
    });
    
    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    var transitmessage = salt.toString()+ iv.toString() + encrypted.toString();
    return transitmessage;
}

function decrypt(msgencrypted, pass) {
    var salt = CryptoJS.enc.Hex.parse(msgencrypted.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(msgencrypted.substr(32, 32))
    var encrypted = msgencrypted.substring(64);
    
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: process.env.ENCRYPTION_KEYSIZE/32,
        iterations: process.env.ENCRYPTION_ITERATIONS
      });
  
    var decrypted = CryptoJS.AES.decrypt(encrypted, key, { 
      iv: iv, 
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
      
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

//const sessionModel = require('../models/session');
//const logsModel = require('../models/logs');
const fs = require('fs');

const typeToken = {
    activate: 0,
    recover_password: 1,
    authentication: 2,
    t2a_authentication: 3
}

const typeUser = {
    user: 0,
    admin: 1
}

function cleanReturn(userObject){
    var sessionObj = userObject.toJSON();
    delete sessionObj.password;
    delete sessionObj.public_key;
    delete sessionObj.private_key;
    delete sessionObj.__v;
    return sessionObj;
}

function userStorageExists(userid){
    if(fs.existsSync(STORAGE+userid)){
        return true;
    }
    return false;
}

function createUserStorage(userid){
    fs.mkdirSync(STORAGE+userid);
}

function generateRandomeCode(length){
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)).toUpperCase());
    }
   return result.join('');
};


function checkUri(request){
    
    if(request.secure){
        return true;
    }
    return false;
}

/**
 * @api {get} /ipInfo/:id Request IP information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {Number} id User's unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */

function getIPInfo(ip){
    
        let array = ip.split(':');
        let remoteIP = array[array.length - 1];
        let requestTo = 'https://ipapi.co/'+remoteIP+'/json/?key='+process.env.IPAPI_KEY;
        //Pending to REQUESTED.
        request(requestTo, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body)
           }
            else {
                console.log("Error "+response.statusCode)
            }
        })
    }

module.exports = {

    register: function(req, res, next){

        if(checkUri(req)){

            userModel.find({$or:[{username:req.body.username},{email:req.body.email}]}, function(err,result){
                if(result.length === 0){
                    
                    generateKeyPair('rsa', {
                        modulusLength: 4096,
                        publicKeyEncoding: {
                            type: 'spki',
                            format: 'pem'
                        },
                        privateKeyEncoding: {
                            type: 'pkcs8',
                            format: 'pem',
                            cipher: 'aes-256-cbc',
                            passphrase: process.env.PRIVATE_KEY_PASSWORD
                        }
                        }, (err, publicKey, privateKey) => {
                            console.log('PUBLIC KEY',publicKey);
                            console.log('PRIVATE KEY',privateKey);
                            let privateEncryped = encrypt(privateKey,easyCrypt.easysync.getPBKDF2Hex(req.body.password));
                            

                            //console.log('ENCRYPTED PRIVATE KEY',privateEncryped);
                            //console.log('DECRYPTED PRIVATE KEY',decrypt(privateEncryped,easyCrypt.easysync.getPBKDF2Hex(req.body.password)));

                            //userModel.updateOne({_id:user._id},{$set:{"public_key":publicKey}},function(err){});
                            //userModel.updateOne({_id:user._id},{$set:{"private_key":privateEncryped}},function(err){});

                            userModel.create({username: req.body.username, email: req.body.email, password: req.body.password,activated:false,created_at: new Date(),private_key:privateEncryped,public_key:publicKey}, function(err,user){
                                if(err){
                                    next(err);
                                }else{
                                    if(!user.activated){
        
                                        //Activation Link Token
                                        const token = jwt.sign({id:user._id,typeToken:typeToken.activate,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "24h"});
                                        email.sendmailactivateacc(user,token);
                                        res.status(201).json({status:"ok",message:"Usuario creado, por favor activa tu cuenta con el link enviado a "+user.email});
                                        console.log(user.username+" created on "+ new Date());
                                    }
                                }
                            });
                        });
                }else{
                    res.status(400).json({status:"Error", message: "Ya existe ese usuario o email"});
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },
    login: function(req, res, next){
        if(checkUri(req)){
            
            userModel.findOne({$or:[{username:req.body.useremail},{email:req.body.useremail}]}, function(err,user){
                if(user===null){
                    res.status(400).json({status:"error", message: "Usuario o email no encontrado"});
                }else{
                    if(bcrypt.compareSync(req.body.password, user.password)){
                        if(!user.activated){
                            res.status(400).json({status:"Error", message: "Cuenta no activada, verifica tu email para realizar la activación"});
                        }else{

                            let pbkdf2Key = easyCrypt.easysync.getPBKDF2Hex(req.body.password);

                            if(!userStorageExists(user._id)){
                                createUserStorage(user._id);
                            }

                            if(user.t2a){
                                let code = generateRandomeCode(8);
                                email.sendT2ACode(user,code);
                                const token = jwt.sign({id:user._id,typeToken:typeToken.t2a_authentication,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "24h"});
                                userModel.updateOne({_id:user._id},{$set:{"t2a_code":code}},function(err){});
                                res.status(200).json({status:"ok",token:token,message:"Se ha enviado un código de autenticación, revista tu correo electronico"});
                            }else{
                                
                                const token = jwt.sign({id:user._id,typeToken:typeToken.authentication,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "7d"});
                                userModel.updateOne({email:user.email},{$set:{"last_login":new Date()}},function(err){});
    
                                let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                                console.log(ip);
                                //sessionModel.create({},function(err){});
                                //console.log(derivedKey);
                                console.log(user.username+" Login on "+ new Date());
                                getIPInfo(ip);
                                let privateKeyDecrypted = decrypt(user.private_key,easyCrypt.easysync.getPBKDF2Hex(req.body.password));
                                const tokenKeys = jwt.sign({id:user._id,private_key:privateKeyDecrypted,public_key:user.public_key,pbkdf2:pbkdf2Key},req.app.get('secretKey'));
                                let userSend = cleanReturn(user);
                                
                                res.status(200).json({status:"ok",message:"Usuario autenticado", user:userSend,token:token,keys:tokenKeys,pbkdf2:pbkdf2Key});
                                
                                //fs.writeFileSync('/root/EasySync/EasySync/backend/API/logs/login.log',writeToFile,"UTF-8",{'flag': 'a+'});
                            }
                        }
                    }else{
                        res.status(401).json({status:"Error",message:'Contraseña o Usuario incorrecto'});
                    }
                }
            });
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },
    delete: function(req,res){
        
        if(checkUri(req)){

            let tokenStr = req.body.token;
            if(!tokenStr){
                return res.status(403).send({status:"Error",message:process.env.NO_TOKEN_PROVIDED})
            }

            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                }

                if(decoded.typeToken === typeToken.authentication && decoded.typeUser === typeUser.admin){
                    userModel.deleteOne({_id:decoded.id},function(err){
                        if(!err){
                            res.status(200).json({status:"ok",message:"Usuario eliminado"});
                        }else{
                            res.status(400).json({status:"Error",message:"Problema eliminando usuario, puede que no exista"}); 
                        }
                    });
                }else{
                    res.status(400).json({status:"Error",message:"Problema eliminando usuario, puede que no exista o no tienes permismos para realizar est acción"}); 
                }
                
            });
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },
    recover: function(req,res,next){
        if(checkUri(req)){
            

            userModel.findOne({$or:[{email:req.body.useremail},{username:req.body.useremail}]}, function(err,user){
                if(user !== null){
                    const token = jwt.sign({id:user._id,typeToken:typeToken.recover_password},req.app.get('secretKey'), { expiresIn: "24h"});
                    email.sendmailrecoverpassword(user,token);
                    res.status(201).json({status:"ok",message:"Email para recuperar tu contraseña se ha enviado  a tu dirección de email."});
                }else{
                    res.status(400).json({status:"Error",message:"User o email no existe!."});
                }
            });
            
            
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },
    activate: function(req,res,next){
        if(checkUri){

            let tokenStr = req.query.token;
            if(!tokenStr){
                return res.status(403).send({status:"Error",message:process.env.NO_TOKEN_PROVIDED})
            }

            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                }

                if(decoded.typeToken === typeToken.activate){
                    userModel.updateOne({_id:decoded.id},{$set:{"activated":true}},function(err){
                        if(!err){
                            res.status(201).json({status:"ok",message:"Cuenta no activada, verifica tu email para realizar la activación"});
                        }
                    });
                }
            });
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },token: function(req,res,next){
        if(checkUri(req)){
            let tokenStr = req.body.token;

            if(!tokenStr){
                res.status(403).send({status:"Error",message:process.env.NO_TOKEN_PROVIDED});
            }
    
            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"error",message:process.env.UNATHORIZED});
                }
                userModel.findOne({_id:decoded.id},function(err,user){

                    if(user !== null){
                        if(!user.activated){
                            res.status(400).json({status:"Error", message: "Cuenta no activada, verifica tu email para realizar la activación"});
                        }else{
                            const token = jwt.sign({id:user._id,typeToken:typeToken.authentication,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "7d"});
                            userModel.updateOne({email:user.email},{$set:{"last_login":new Date()}},function(err){});
                            let derivedKey = easyCrypt.easysync.getPBKDF2Hex(user.password);
                            res.status(200).json({status:"ok",message:"El usuario ha sido autenticado", user:user,token:token,pbkdf2:derivedKey});
                        }
                    }
                });
            });
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },recover_password: function(req,res){
        if(checkUri(req)){

            if(req.body.token !== undefined){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        if(decoded.typeToken === typeToken.recover_password){
                            let password = bcrypt.hashSync(req.body.password, 10);
                            userModel.updateOne({_id:decoded.id},{$set:{"password":password}},function(err){
                                if(!err){
                                    res.status(201).json({status:"ok",message:"Contraseña actualizada"});
                                }else{
                                    res.status(401).json({status:"Error",message:"Ocurrio un problema cuando se actualizaba tú contraseña"});
                                }
                            });
                        }
                    }
                });
            }
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },T2A_Login: function(req,res){
        if(checkUri(req)){
            console.log(req.body);
            if(req.body.code !== null || req.body.token !== null){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        if(decoded.typeToken === typeToken.t2a_authentication){
                            userModel.findOne({_id:decoded.id}, function(err,user){

                                if(user.t2a_code === undefined){
                                    res.status(401).json({status:"Error",message:"Necesitas código de autenticación para iniciar sesión."});
                                }

                                if(user.t2a_code === null){
                                    res.status(401).json({status:"Error",message:"Necesitas código de autenticación para iniciar sesión."});
                                }

                                if(user.t2a_code === req.body.code){
                                    const token = jwt.sign({id:user._id,typeToken:typeToken.authentication,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "7d"});
                                    userModel.updateOne({email:user.email},{$set:{"t2a_code":null}},function(err,userLoged){
                                        if(!err){
                                            userModel.findOne({_id:user.id}, function(err,userLoged){
                                                //let derivedKey = easyCrypt.easysync.getPBKDF2Hex(req.body.password);
                                                //res.status(200).json({status:"ok",message:"User authenticated", user:userLoged,token:token,pbkdf2:derivedKey});
                                                res.status(200).json({status:"ok",message:"Usuario autenticado", user:userLoged,token:token});
                                            });
                                        }
                                    });
                                }else{
                                    res.status(400).json({status:"Error",message:"Código de autenticación inválido."});
                                }
                            });
                        }
                    }
                });
            }else{
                res.status(401).json({status:"Error",message:"Necesitas código de autenticación para iniciar sesión."});
            }
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },update_T2A: function(req,res){
        if(checkUri(req)){
            if(req.body.token !== null && req.body.t2avalue !== null && req.body.t2avalue !== null){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        if(decoded.typeToken === typeToken.authentication){
                            let value = null;
                            let message = "";
                            if(req.body.t2avalue === 'true'){
                                value = true;
                                message = "Authenticacion en 2 factores activado.";
                            }else if(req.body.t2avalue === 'false'){
                                value = false;
                                message = "Authenticacion en 2 factores desactivado.";
                            }

                            userModel.updateOne({_id:decoded.id},{$set:{"t2a":value}},function(err,userLoged){
                                if(!err){
                                    res.status(200).json({status:"ok",message:message});
                                }
                            });
                        }else{
                            es.status(401).json({status:"Error",message:"Error de autenticación."});
                        }
                    }
                });
            }else{
                res.status(401).json({status:"Error",message:"El valor T2A no se pudo actualizar correctamente."});
            }
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },update_email: function(req,res){
        if(checkUri(req)){

            if(req.body.token !== null && req.body.email !== null){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        if(decoded.typeToken === typeToken.authentication){
                            
                            userModel.updateOne({_id:decoded.id},{$set:{"email":req.body.email}},function(err){
                                if(!err){
                                    res.status(200).json({status:"ok",message:"Email actualizado"});
                                }else{
                                    res.status(400).json({status:"ok",message:"Problema al actualizar el email"});
                                }
                            });
                        }
                    }
                });
            }else{
                res.status(401).json({status:"Error",message:"Token expired or value is null or not expected."});
            }
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },eliminate_account: function(req,res){
        if(checkUri(req)){

            if(req.body.token !== null){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        if(decoded.typeToken === typeToken.authentication){
                            
                            userModel.deleteOne({_id:decoded.id},function(err){
                                if(!err){
                                    res.status(200).json({status:"ok",message:"Cuenta de usuario eliminada correctamente."});
                                }
                            });
                        }
                    }
                });
            }else{
                res.status(401).json({status:"Error",message:"Token expired or value is null or not expected."});
            }
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    },change_password: function(req,res){
        if(checkUri(req)){

            if(req.body.token !== null){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        console.log(decoded);
                        if(decoded.typeToken === typeToken.authentication){
                            
                            let password = bcrypt.hashSync(req.body.password, 10);
                            userModel.updateOne({_id:decoded.id},{$set:{"password":password}},function(err){
                                if(!err){
                                    res.status(201).json({status:"ok",message:"Contraseña de usuario actualizada!."});
                                }else{
                                    res.status(401).json({status:"Error",message:"Problema ocurrido cuando se actualizaba la contraseña."});
                                }
                            });
                        }
                    }
                });
            }else{
                res.status(401).json({status:"Error",message:"Token expired or value is null or not expected."});
            }
        }else{
            res.status(301).json({status:"Error",message:process.env.USE_ROUTE});
        }
    }
}