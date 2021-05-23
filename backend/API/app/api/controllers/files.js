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

        if(checkUri(req)){
            let file = {
                name : req.files.file.name,
                size : req.files.file.size,
                mimetype : req.files.file.mimetype,
                md5 : req.files.file.md5 
            }
    
            let extension = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length);
            file.extension = extension;
    
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
                                res.status(400).json({status:"Error", message: "Cuenta no activada"});
                            }else{
                                getUserSize(user._id,file.size).then(function(size){
                                    let totalSize = (size + file.size);
                                    if(totalSize > user.storage_limit){
                                        res.status(400).json({status:"Error", message: "Limite de almacenamiento alcanzado"});
                                    }else{
                                        filesModel.create({name:file.name,size:file.size,mimetype:file.mimetype,md5:file.md5,created_at:new Date(),modified_at:new Date(),owner_id:decoded.id,shared:false,extension:file.extension},function(err,result){
                                            if(err){
                                                console.log(err);
                                                res.status(400).json({status:"Error", message: "Error al guardiar los cambios",err:err});
                                            }else{
                                                let urlUnique = true;
                                                do{
                                                    let url = generateURL();
                                                    filesModel.findOne({url:url}, function(errURL,resultURL){
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
                }
            });
        }
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
                        res.download(STORAGE+file.owner_id+"/"+file._id,file.name+"."+file.extension);
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
                                res.status(400).send({status:"Error",message:"No se ha podido recuperar los archivos en este momento"});
                            }else{
                                //console.log(files);
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
                                res.status(200).send({status:"Ok", result:userSize.toString()});
                            }).catch(function(err){
                                res.status(400).send({status:"Error", err});
                            });
                        }
                    }
                });
            }
        }
    },renameFile: function(req,res){
        console.log(req.body);
        if(checkUri(req)){
            if(!req.body.token){
                res.status(400).send({status:"error",message:"No token provided!"});
            }else{
                jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) => {
                    if(err){
                        res.status(400).send(err);
                    }else{
                        if(fs.existsSync(STORAGE+decoded.id) && req.body.fileid !== null){
                            filesModel.updateOne({_id:req.body.fileid},{$set:{name:req.body.newname,modified_at:new Date()}},function(err,result){
                                if(!err){
                                    res.status(200).send({status:"OK", message:"Se ha cambiado el nombre correctamente"});
                                }
                            });
                        }else{
                            res.status(400).send({status:"Error", message:"Hubo un error o no existe el archivo."});
                        }
                    }
                });
            }
        }
    },removeFile: function(req,res){
        if(checkUri(req)){
            if(!req.body.token){
                res.status(400).send({status:"error",message:"No token provided!"});
            }else{
                jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) => {

                    if(err){
                        res.status(400).send(err);
                    }else{
                        if(fs.existsSync(STORAGE+decoded.id) && req.body.fileid !== null){

                            filesModel.findOne({_id:req.body.fileid},function(err1,result1){
                                filesModel.deleteOne({_id:req.body.fileid},function(err2,result2){
                                    console.log(STORAGE+result1.owner_id+"/"+req.body.fileid);
                                    if(!err){
                                        fs.rmSync(STORAGE+result1.owner_id+"/"+req.body.fileid);
                                        res.status(200).send({status:"OK", message:"Se ha eliminado el elemento correctamente."});
                                    }else{
                                        res.status(200).send({status:"Error", message:"Problema ocurrido cuando se eliminaba el elemento."});
                                    }
                                });
                            });
                            
                        }else{
                            res.status(400).send({status:"Error", message:"Hubo un error o no existe el archivo."});
                        }
                    }
                });
            }
        }
    },createFolder(req,res){
        if(checkUri(req)){
            jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) =>{
                if(err){
                    res.status(400).send({status:"error",message:"Token no authorizado"});
                }else{
                    if(!userStorageExists(decoded.id)){
                        createUserStorage(decoded.id);
                    }
                    userModel.findOne({_id:decoded.id},function(err,user){
                        if(user !== null){
                            if(!user.activated){
                                res.status(400).json({status:"Error", message: "Cuenta no activada"});
                            }else{
                                filesModel.create({name:req.body.foldername,created_at:new Date(),modified_at:new Date(),owner_id:decoded.id,shared:false,parent:req.body.parent,isFolder:true},function(err,result){
                                    if(err){
                                        console.log(err);
                                        res.status(400).json({status:"Error", message: "Error al crear la carpeta",err:err});
                                    }else{
                                        console.log(result);
                                        res.status(200).json({status:"Ok", message:"La carpeta "+req.body.foldername+" se ha creado correctamente."});
                                    }
                                });
                                
                            }
                        }
                    });
                }
            });
        }
        
    },move: function(req,res){
        if(checkUri(req)){
            jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) =>{
                if(err){
                    res.status(400).send({status:"error",message:"Token no authorizado"});
                }else{
                    if(!userStorageExists(decoded.id)){
                        createUserStorage(decoded.id);
                    }
                    userModel.findOne({_id:decoded.id},function(err,user){
                        if(user !== null){
                            if(!user.activated){
                                res.status(400).json({status:"Error", message: "Cuenta no activada"});
                            }else{
                                filesModel.updateOne({_id:req.body.elementid},{$set:{parent:req.body.parent}},function(err,result){
                                    if(err){
                                        console.log(err);
                                        res.status(400).json({status:"Error", message: "Error al mover el elemento de lugar.",err:err});
                                    }else{
                                        console.log(result);
                                        res.status(200).json({status:"Ok", message:"El elemento se movió correctamente."});
                                    }
                                });
                                
                            }
                        }
                    });
                }
            });
        }
    }
}