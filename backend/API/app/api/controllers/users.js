const userModel = require('../models/users');
const sessionModel = require('../models/session');
const logsModel = require('../models/logs');
const request = require('request');


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const email = require('../../../config/mail');
const easyCrypt = require('../utils/crypto');

const fs = require('fs');

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
                    userModel.create({username: req.body.username, email: req.body.email, password: req.body.password,activated:false,created_at: new Date()}, function(err){
                        if(err){
                            next(err);
                        }else{
                            res.status(201).json({status:"ok",message:"User created"})
                            let writeToFile = result.username+" created on "+ new Date();
                            console.log(writeToFile);
                            //fs.writeFileSync('/root/EasySync/EasySync/backend/API/logs/register.log',writeToFile,"UTF-8",{'flag': 'a+'});
                        }
                    });
                }else{
                    res.status(400).json({status:"Error", message: "User or Email exists"});
                }
            });
        }else{
            res.status(301).json({status:"Error",message:"Use https://easysync.es/api/ route"});
        }
    },
    login: function(req, res, next){
        if(checkUri(req)){
            
            userModel.findOne({$or:[{username:req.body.useremail},{email:req.body.useremail}]}, function(err,user){
                if(user===null){
                    res.status(400).json({status:"Error", message: "User or Email not founded"});
                }else{
                    if(bcrypt.compareSync(req.body.password, user.password)){
                        if(!user.activated){
                            res.status(400).json({status:"Error", message: "Account not activated"});
                        }else{
                            let derivedKey = easyCrypt.easysync.getPBKDF2Hex(user.password);
                            if(user.last_login === undefined){
                                //GENERATING AES KEY FOR FIRST TIME WITH PBKDF2 derivedKey, CREATING PUBLIC AND PRIVATE KEY TO SEND TO USER
                                
                               
                                

                            }else{
                                //DECRYPTING PRIVATE KEY TO SEND TO USER USING PBKDF2 derivedKey
                            }

                            console.log(derivedKey);

                            const token = jwt.sign({id:user._id},req.app.get('secretKey'), { expiresIn: "24h"});
                            userModel.updateOne({email:user.email},{$set:{"last_login":new Date()}},function(err){});

                            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
                            getIPInfo(ip);

                            //sessionModel.create({},function(err){});
                            res.status(200).json({status:"ok",message:"El usuario ha sido autenticado", user:user,token:token});
                            let writeToFile = user.username+" Login on "+ new Date();
                            console.log(writeToFile);
                            fs.writeFileSync('/root/EasySync/EasySync/backend/API/logs/login.log',writeToFile,"UTF-8",{'flag': 'a+'});
                        }
                    }else{
                        res.status(400).json({status:"Error", message: "Invalid email/user or password"});
                    }
                }
            });
        }else{
            res.status(301).json({status:"Error",message:"Use https://easysync.es/api/ route"});
        }
        
    },
    delete: function(req,res,next){
        
        if(checkUri(req)){

            let tokenStr = req.body.token;
            if(!tokenStr){
                return res.status(403).send({status:"Error",message:"No token provided!"})
            }

            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"Error",message:"Unathorized!"});
                }
                userModel.deleteOne({_id:decoded.id},function(err){
                    if(!err){
                        res.status(200).json({status:"ok",message:"User removed"});
                    }else{
                        res.status(400).json({status:"Error",message:"Problem removing user, maybe not exists"}); 
                    }
                });
            });

            /*
            userModel.findOne({_id:req.params.id},function(err,result){
                if(result != null){
                    userModel.deleteOne({_id:req.params.id},function(err){
                        if(err){
                           res.status(400).json({status:"error",message:"Problem removing user"});
                        }else{
                            res.status(200).json({status:"ok",message:"User removed"});
                            let writeToFile = result.username+" removed on "+ new Date();
                            console.log(writeToFile);
                            fs.writeFileSync('/root/EasySync/EasySync/backend/API/logs/delete.log',writeToFile,"UTF-8",{'flag': 'a+'});
                        }
                    });
                }else{
                    res.status(400).json({status:"error",message:"User not found"});
                }
            });
            */
            
        }else{
            res.status(301).json({status:"Error",message:"Use https://easysync.es/api/ route"});
        }
    },
    recover: function(req,res,next){
        if(checkUri(req)){
            userModel.findOne({$or:[{email:req.body.email},{username:req.body.username}]}, function(err,user){
                if(user !=null){
                    email.sendmailrecoverpassword(user);
                    //Code
                    res.status(201).json({status:"ok",message:"Email to recover password sended"});
                }else{
                    res.status(400).json({status:"Error",message:"User or email doesnt exists"});
                }
            });
        }else{
            res.status(301).json({status:"Error",message:"Use https://easysync.es/api/ route"});
        }
    },
    activate: function(req,res,next){
        if(checkUri){

            let tokenStr = req.body.token;
            if(!tokenStr){
                return res.status(403).send({status:"Error",message:"No token provided!"})
            }

            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"Error",message:"Unathorized!"});
                }
                userModel.updateOne({_id:decoded.id},{$set:{"activated":true}},function(err){
                    if(!err){
                        res.status(201).json({status:"ok",message:"User account activated"});
                    }
                });
            });
        }else{
            res.status(301).json({status:"Error",message:"Use https://easysync.es/api/ route"});
        }
    },token: function(req,res,next){
        if(checkUri(req)){
            let tokenStr = req.body.token;

            if(!tokenStr){
                res.status(403).send({status:"Error",message:"No token provided!"})
            }
    
            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"Error",message:"Unathorized!"});
                }
                userModel.findOne({_id:decoded.id},function(err,user){
                    if(!user.activated){
                        res.status(400).json({status:"Error", message: "Account not activated"});
                    }else{
                        const token = jwt.sign({id:user._id},req.app.get('secretKey'), { expiresIn: "24h"});
                        userModel.updateOne({email:user.email},{$set:{"last_login":new Date()}},function(err){});
                        res.status(200).json({status:"ok",message:"El usuario ha sido autenticado", user:user,token:token});
                    }
                });
            });
        }else{
            res.status(301).json({status:"Error",message:"Use https://easysync.es/api/ route"});
        }
    }
}