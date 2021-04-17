const filesModel = require('../models/files');
const jwt = require('jsonwebtoken');
const userModel = require('../models/users');
const fs = require('fs');
const du = require('du')
const STORAGE = process.env.STORAGE_PATH;


function userStorageExists(userid){
    if(fs.existsSync(STORAGE+userid)){
        return true;
    }
    return false;
}

function createUserStorage(userid){
    fs.mkdirSync(STORAGE+userid);
}

async function getUserSize(userid,sizeUploadedFile){
    let size = await du(STORAGE+userid);
    size += sizeUploadedFile;
    console.log(Number(size/1024/1024).toFixed(2)+" MB");
}


function checkUri(request){
    if(request.secure){
        console.log(request.secure);
        return true;
    }
    return false;
}



module.exports = {

    upload: function(req,res,next){
        //res.send({status:"developing"});
        //res.send(req.files.file);
        let file = {
            name : req.files.file.name,
            size : req.files.file.size,
            mimetype : req.files.file.mimetype,
            md5 : req.files.file.md5
        }

        jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) =>{
            if(err){
                res.status(400).send({status:"error",message:"Unathorized Token"});
            }else{
                if(!userStorageExists(decoded.id)){
                    createUserStorage(decoded.id);
                }
                filesModel.create({name:file.name,size:file.size,mimetype:file.mimetype,md5:file.md5,created_at:new Date(),modified_at:new Date(),owner_id:decoded.id,shared:false},function(err,result){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(result);
                        req.files.file.mv(STORAGE+decoded.id+"/"+result._id);
                        res.status(200).send(file);
                    }
                });
                
                //getUserSize(decoded.id,file.size);
            }
        });
    },

    download: function(req,res,next){
        checkUri(req);
        res.send({status:"developing"});
    },

    getUserFiles: function(req,res,next){
        if(checkUri(req)){
            if(!req.query.token){
                res.status(400).send({status:"error",message:"No token provided!"});
            }else{
                jwt.verify(req.query.token,process.env.SECRET_KEY,(err,decoded) => {
                    filesModel.find({owner_id:decoded.id},function(err,result){
                        if(err){
                            console.log(err);
                            res.status(400).send(err);
                        }else{
                            console.log(result);
                            res.status(200).send(result);
                        }
                    });
                });
            }
        }
    }
}