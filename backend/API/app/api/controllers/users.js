const userModel = require('../models/users');
const sessionModel = require('../models/session');
const logsModel = require('../models/logs');
const request = require('request');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const email = require('../../../config/mail');
const easyCrypt = require('../utils/crypto');

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

function getIPInfo(ip){
    
        let array = ip.split(':');
        let remoteIP = array[array.length - 1];
        let requestTo = 'https://ipapi.co/'+remoteIP+'/json';
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
                    userModel.create({username: req.body.username, email: req.body.email, password: req.body.password,activated:false,created_at: new Date()}, function(err,user){
                        if(err){
                            next(err);
                        }else{
                            if(!user.activated){

                                //Activation Link Token
                                const token = jwt.sign({id:user._id,typeToken:typeToken.activate},req.app.get('secretKey'), { expiresIn: "24h"});
                                email.sendmailactivateacc(user,token);
                                res.status(201).json({status:"ok",message:"User created, please activate you account following link sended to "+user.email});
                                console.log(user.username+" created on "+ new Date());
                            }
                        }
                    });
                }else{
                    res.status(400).json({status:"Error", message: "User or Email exists"});
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
                    res.status(400).json({status:"error", message: "User or Email not founded"});
                }else{
                    if(bcrypt.compareSync(req.body.password, user.password)){
                        if(!user.activated){
                            res.status(400).json({status:"Error", message: "Account not activated"});
                        }else{
                            if(user.t2a){
                                let code = generateRandomeCode(8);
                                email.sendT2ACode(user,code);
                                const token = jwt.sign({id:user._id,typeToken:typeToken.t2a_authentication,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "24h"});
                                userModel.updateOne({_id:user._id},{$set:{"t2a_code":code}},function(err){});
                                res.status(200).json({status:"ok",token:token,message:"Need authentication code, sended to user email"});
                            }else{
                                const token = jwt.sign({id:user._id,typeToken:typeToken.authentication},req.app.get('secretKey'), { expiresIn: "7d"});
                                userModel.updateOne({email:user.email},{$set:{"last_login":new Date()}},function(err){});
    
                                let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                                getIPInfo(ip);
    
                                //sessionModel.create({},function(err){});
                                let derivedKey = easyCrypt.easysync.getPBKDF2Hex(user.password);
                                res.status(200).json({status:"ok",message:"User authenticated", user:user,token:token,pbkdf2:derivedKey});
                                console.log(user.username+" Login on "+ new Date());
                                //fs.writeFileSync('/root/EasySync/EasySync/backend/API/logs/login.log',writeToFile,"UTF-8",{'flag': 'a+'});
                            }
                        }
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
                            res.status(200).json({status:"ok",message:"User removed"});
                        }else{
                            res.status(400).json({status:"Error",message:"Problem removing user, maybe not exists"}); 
                        }
                    });
                }else{
                    res.status(400).json({status:"Error",message:"Problem removing user, maybe not exists or not have user persmision"}); 
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
                    res.status(201).json({status:"ok",message:"Email to recover password sended in the user email"});
                }else{
                    res.status(400).json({status:"Error",message:"User or email doesnt exists"});
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
                            res.status(201).json({status:"ok",message:"User account activated"});
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
                            res.status(400).json({status:"Error", message: "Account not activated"});
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
                                    res.status(201).json({status:"ok",message:"User password updated!."});
                                }else{
                                    res.status(401).json({status:"Error",message:"Problem ocurred when updating user password."});
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

            if(req.body.code !== undefined && req.body.token !== undefined){
                jwt.verify(req.body.token,req.app.get('secretKey'),(err, decoded) =>{
                    if(err){
                        return res.status(401).send({status:"Error",message:process.env.UNATHORIZED});
                    }else{
                        if(decoded.typeToken === typeToken.t2a_authentication){
                            userModel.findOne({_id:decoded.id}, function(err,user){

                                if(user.t2a_code === undefined){
                                    res.status(401).json({status:"Error",message:"Need authentication code to login in!."});
                                }

                                if(user.t2a_code === null){
                                    res.status(401).json({status:"Error",message:"Need authentication code to login in!."});
                                }

                                if(user.t2a_code === req.body.code){
                                    const token = jwt.sign({id:user._id,typeToken:typeToken.authentication,typeUser:user.type_user},req.app.get('secretKey'), { expiresIn: "7d"});
                                    userModel.updateOne({email:user.email},{$set:{"t2a_code":null}},function(err,userLoged){
                                        if(!err){
                                            userModel.findOne({_id:user.id}, function(err,userLoged){
                                                let derivedKey = easyCrypt.easysync.getPBKDF2Hex(req.body.password);
                                                res.status(200).json({status:"ok",message:"User authenticated", user:userLoged,token:token,pbkdf2:derivedKey});
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }else{
                res.status(401).json({status:"Error",message:"Need authentication code to login in!."});
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
                                    res.status(200).json({status:"ok",message:"Email actualizado.!"});
                                }else{
                                    res.status(400).json({status:"ok",message:"Problema al actualizar el email.!"});
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
                                    res.status(200).json({status:"ok",message:"User account eliminated."});
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

        console.log(req.body);
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