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

function generateURL() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < possible.length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

function createUserStorage(userid){
    fs.mkdirSync(STORAGE+userid);
}

async function getUserSize(userid){
    let size = await du(STORAGE+userid);
    return Number(size);
}

function checkUri(request){
    if(request.secure){
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
                userModel.findOne({_id:decoded.id},function(err,user){
                    if(user !== null){
                        if(!user.activated){
                            res.status(400).json({status:"Error", message: "Account not activated"});
                        }else{
                            getUserSize(user._id,file.size).then(function(size){
                                let totalSize = (size + file.size);
                                if(totalSize > user.storage_limit){
                                    res.status(400).json({status:"Error", message: "Limite de almacenamiento alcanzado"});
                                }else{
                                    filesModel.create({name:file.name,size:file.size,mimetype:file.mimetype,md5:file.md5,created_at:new Date(),modified_at:new Date(),owner_id:decoded.id,shared:false},function(err,result){
                                        if(err){
                                            console.log(err);
                                            res.status(400).json({status:"Error", message: "Error al guardiar los cambios",err:err});
                                        }else{
                                            let urlUnique = true;
                                            do{
                                                let url = generateURL();
                                                console.log(url);
                                                filesModel.findOne({url:url}, function(errURL,resultURL){
                                                    console.log(resultURL);
                                                    if(resultURL === null){
                                                        urlUnique = false;
                                                        filesModel.updateOne({_id:result._id},{$set:{url:url}},function(err){
                                                            if(!err){
                                                                req.files.file.mv(STORAGE+decoded.id+"/"+result._id);
                                                                res.status(200).json({status:"Ok", message: file.name+" se ha subido correctamente"});
                                                            }
                                                        });
                                                    }
                                                });

                                            }while(urlUnique === false);
                                        }
                                    });
                                }
                            }).catch(function(err){
                                res.status(400).send({status:"Error", message:"Error ocurrido al obtener el tamaño limite del usuario"});
                            });
                            
                        }
                    }
                });
                //getUserSize(decoded.id,file.size);
            }
        });
    },
    downloadByUrl: function(req,res){
        if(checkUri(req)){
            
            if(!req.query.url){
                res.status(400).send({status:"Error",message:"¡Url de descarga no valida o no existe!."});
            }
            filesModel.findOne({url:req.query.url},function(err,file){
                if(err){
                    console.log(err);
                    res.status(400).send(err);
                }else{
                    if(file === null){
                        res.status(400).send({status:"Error",message:"¡Archivo no encontrado!."});
                    }else{
                        res.download(STORAGE+file.owner_id+"/"+file._id,file.name);
                    }
                    //res.status(200).send(file);
                }
            });
        }
    },
    getUserFiles: function(req,res){
        if(checkUri(req)){
            if(!req.query.token){
                res.status(400).send({status:"error",message:"No token provided!"});
            }else{
                jwt.verify(req.query.token,process.env.SECRET_KEY,(err,decoded) => {

                    if(err){
                        res.status(400).send(err);
                    }else{
                        filesModel.find({owner_id:decoded.id},function(err,files){
                            if(err){
                                console.log(err);
                                res.status(400).send(err);
                            }else{
                                console.log(files);
                                res.status(200).send(files);
                            }
                        });
                    }
                });
            }
        }
    },
    getUserSizeStorage: function(req,res){
        if(checkUri(req)){
            if(!req.query.token){
                res.status(400).send({status:"error",message:"No token provided!"});
            }else{
                jwt.verify(req.query.token,process.env.SECRET_KEY,(err,decoded) => {

                    if(err){
                        res.status(400).send(err);
                    }else{
                        if(fs.existsSync(STORAGE+decoded.id)){
                            getUserSize(decoded.id).then(function(userSize){
                                res.status(200).send({status:"Ok", message:userSize.toString()});
                            }).catch(function(err){
                                res.status(400).send({status:"Error", err});
                            });
                        }
                    }
                });
            }
        }
    }
}