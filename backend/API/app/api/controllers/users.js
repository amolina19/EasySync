const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
    create: function(req, res, next){

        userModel.find({$and:[{username:req.body.username},{email:req.body.email}]}, function(err,result){
            if(result.length === 0){
                userModel.create({username: req.body.username, email: req.body.email, password: req.body.password,created_at: new Date()}, function(err){
                    if(err){
                        next(err);
                    }else{
                        res.json({status:"ok",message:"User created"})
                    }
                });
            }else{
                res.json({status:"error", message: "User exists"});
            }
        });
        
    },
    authenticate: function(req, res, next){
        userModel.findOne({$or:[{email:req.body.email},{username:req.body.username}]}, function(err,userInfo){
            if(userInfo===null){
                res.json({status:"error", message: "User or Email not founded"});
            }else{
                if(bcrypt.compareSync(req.body.password, userInfo.password)){
                    const token = jwt.sign({id:userInfo._id},req.app.get('secretKey'), { expiresIn: "1h"});
                    userModel.updateOne({email:userInfo.email},{$set:{"last_login":new Date()}},function(err){});
                    res.json({status:"ok",message:"El usuario ha sido autenticado", data:{user:userInfo,token:token}});
                }else{
                    res.json({status:"error", message: "Invalid email/user or password"});
                }
            }
        });
    },
    delete: function(req,res,next){
        userModel.deleteOne({_id:req.params.id},function(err){
            if(err){
               res.json({status:"error",message:"Problem removing user"});
            }else{
                res.json({status:"ok",message:"User removed"});
            }
        });
    }
}