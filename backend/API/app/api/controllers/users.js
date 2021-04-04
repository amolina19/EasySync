const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const email = require('../../../config/mail');

function checkUri(request){
    if(request.headers.host.includes('api')){
        return true;
    }
    return false;
}

module.exports = {
    create: function(req, res, next){

        if(checkUri(req)){
            userModel.find({$and:[{username:req.body.username},{email:req.body.email}]}, function(err,result){
                if(result.length === 0){
                    userModel.create({username: req.body.username, email: req.body.email, password: req.body.password,activated:false,created_at: new Date()}, function(err){
                        if(err){
                            next(err);
                        }else{
                            res.status(201).json({status:"ok",message:"User created"})
                        }
                    });
                }else{
                    res.status(202).json({status:"error", message: "User exists"});
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use api.easysync.es/URI"});
        }
    },
    authenticate: function(req, res, next){
        if(checkUri(req)){
            
            userModel.findOne({$or:[{email:req.body.email},{username:req.body.username}]}, function(err,userInfo){
                if(userInfo===null){
                    res.status(202).json({status:"error", message: "User or Email not founded"});
                }else{
                    if(bcrypt.compareSync(req.body.password, userInfo.password)){
                        const token = jwt.sign({id:userInfo._id},req.app.get('secretKey'), { expiresIn: "1h"});
                        userModel.updateOne({email:userInfo.email},{$set:{"last_login":new Date()}},function(err){});
                        res.status(200).json({status:"ok",message:"El usuario ha sido autenticado", data:{user:userInfo,token:token}});
                    }else{
                        res.status(202).json({status:"error", message: "Invalid email/user or password"});
                    }
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use api.easysync.es/URI"});
        }
        
    },
    delete: function(req,res,next){
        
        if(checkUri(req)){
            userModel.findOne({_id:req.params.id},function(err,result){
                if(result != null){
                    userModel.deleteOne({_id:req.params.id},function(err){
                        if(err){
                           res.status(202).json({status:"error",message:"Problem removing user"});
                        }else{
                            res.status(200).json({status:"ok",message:"User removed"});
                        }
                    });
                }else{
                    res.status(202).json({status:"error",message:"User not found"});
                }
            });
            
        }else{
            res.status(301).json({status:"error",message:"Use api.easysync.es/URI"});
        }
    },
    recover: function(req,res,next){
        if(checkUri){
            userModel.findOne({$or:[{email:req.body.email},{username:req.body.username}]}, function(err,user){
                if(user !=null){
                    email.sendmailrecoverpassword(user);
                    //Code
                    res.status(201).json({status:"ok",message:"Email to recover password sended"});
                }else{
                    res.status(202).json({status:"error",message:"User or email doesnt exists"});
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use api.easysync.es/URI"});
        }
    },
    activate: function(req,res,next){
        if(checkUri){
            userModel.findOne({$or:[{email:req.body.email},{username:req.body.username}]}, function(err,user){
                if(user !=null){
                    
                    //Code
                    userModel.updateOne({email:user.email},{$set:{"activated":true}},function(err){});
                    res.status(201).json({status:"ok",message:"User account activated"});
                }else{
                    res.status(202).json({status:"error",message:"Cannot activate user account, User doesnt exists"});
                }
            });
        }else{
            res.status(301).json({status:"error",message:"Use api.easysync.es/URI"});
        }
    }
}