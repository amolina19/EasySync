const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const email = require('../../../config/mail');

const fs = require('fs');

function checkUri(request){
    
    if(request.secure){
        //console.log(request.secure);
        return true;
    }
    return false;
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
                    res.status(400).json({status:"error", message: "User or Email exists"});
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use https://easysync.es/api/ route"});
        }
    },
    login: function(req, res, next){
        if(checkUri(req)){
            
            userModel.findOne({$or:[{username:req.body.useremail},{email:req.body.useremail}]}, function(err,userInfo){
                if(userInfo===null){
                    res.status(400).json({status:"error", message: "User or Email not founded"});
                }else{
                    if(bcrypt.compareSync(req.body.password, userInfo.password)){
                        const token = jwt.sign({id:userInfo._id},req.app.get('secretKey'), { expiresIn: "1h"});
                        userModel.updateOne({email:userInfo.email},{$set:{"last_login":new Date()}},function(err){});
                        res.status(200).json({status:"ok",message:"El usuario ha sido autenticado", user:userInfo,token:token});
                        let writeToFile = userInfo.username+" Login on "+ new Date();
                        console.log(writeToFile);
                        fs.writeFileSync('/root/EasySync/EasySync/backend/API/logs/login.log',writeToFile,"UTF-8",{'flag': 'a+'});
                    }else{
                        res.status(400).json({status:"error", message: "Invalid email/user or password"});
                    }
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use https://easysync.es/api/ route"});
        }
        
    },
    delete: function(req,res,next){
        
        if(checkUri(req)){

            let tokenStr = req.body.token;
            if(!tokenStr){
                return res.status(403).send({status:"error",message:"No token provided!"})
            }

            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"error",message:"Unathorized!"});
                }
                userModel.deleteOne({_id:decoded.id},function(err){
                    if(!err){
                        res.status(200).json({status:"ok",message:"User removed"});
                    }else{
                        res.status(400).json({status:"error",message:"Problem removing user, maybe not exists"}); 
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
            res.status(301).json({status:"error",message:"Use https://easysync.es/api/ route"});
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
                    res.status(400).json({status:"error",message:"User or email doesnt exists"});
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use https://easysync.es/api/ route"});
        }
    },
    activate: function(req,res,next){
        if(checkUri){

            let tokenStr = req.body.token;
            if(!tokenStr){
                return res.status(403).send({status:"error",message:"No token provided!"})
            }

            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"error",message:"Unathorized!"});
                }
                userModel.updateOne({_id:decoded.id},{$set:{"activated":true}},function(err){
                    if(!err){
                        res.status(201).json({status:"ok",message:"User account activated"});
                    }
                });
            });
        }else{
            res.status(301).json({status:"error",message:"Use https://easysync.es/api/ route"});
        }
    },token: function(req,res,next){
        if(checkUri(req)){
            let tokenStr = req.body.token;

            if(!tokenStr){
                return res.status(403).send({status:"error",message:"No token provided!"})
            }
    
            jwt.verify(tokenStr,req.app.get('secretKey'),(err, decoded) =>{
                if(err){
                    return res.status(401).send({status:"error",message:"Unathorized!"});
                }
                userModel.findOne({_id:decoded.id},function(err,user){
                    const token = jwt.sign({id:user._id},req.app.get('secretKey'), { expiresIn: "1h"});
                    userModel.updateOne({email:user.email},{$set:{"last_login":new Date()}},function(err){});
                    res.status(200).json({status:"ok",message:"El usuario ha sido autenticado", user:user,token:token});
                });
            });
        }else{
            res.status(301).json({status:"error",message:"Use https://easysync.es/api/ route"});
        }
    }
}