const filesModel = require('../models/files');
const userModel = require('../models/users');
const keysModel = require('../models/keys');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const du = require('du')
const STORAGE = process.env.STORAGE_PATH;
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const { exec } = require("child_process");
var sleep = require('system-sleep');

const mapChild = new Map();
var exitCounts = 0;

function userStorageExists(userid){
    if(fs.existsSync(STORAGE+userid)){
        return true;
    }
    return false;
}

const typeUser = {
    user: 0,
    admin: 1
}

function hasChilds(file_id,user_id){
    mapChild.set(file_id,file_id);

    filesModel.find({owner_id:user_id},function(err,result){
        for(i=0;i<result.length;i++){
            if(result[i].parent == file_id){
                
                if(!mapChild.has(result[i]._id)){
                  mapChild.set(result[i]._id,result[i].parent);

                }
                hasChilds(result[i]._id,user_id);
            }
        }
    });
    return mapChild;
}

function generateURL() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < possible.length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}

function encryptPublicKey (plaintext, publicKey) {
    const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(plaintext));
    return encrypted.toString("base64");
}

function decryptPrivateKey (ciphertext, privateKey) {
    const decrypted = crypto.privateDecrypt({
        key: privateKey,
        passphrase: process.env.PRIVATE_KEY_PASSWORD,
      }, Buffer.from(ciphertext, "base64"));
    return decrypted.toString("utf8");
}

function zipFile(id_owner,name,res){

    let commandLine = "cd /download/"+id_owner+"/;zip -r /download/"+id_owner+"/"+name+".zip *";
    //let commandLine = "7z a -tzip "+name+".zip -w /download/"+id_owner+"/*";
    

    console.log('COMMAND LINE ',commandLine);
    
    dir = exec(commandLine, function(err, stdout, stderr) {
        if (err) {
          //console.log("error",err);
        }else{
            
        }
        //console.log(stdout);
        //console.log(stderr);
      });
      
      dir.on('exit', function (code) {
        console.log('ZIP EXIT CODE',code);
        
        console.log("DOWNLOADING...");
        res.download("/download/"+id_owner+"/"+name+".zip",function(err){
            if(!err){
                removeDirectory("/download/"+id_owner);
            }
        });
    });
}

function cleanReturn(fileObject){
    var sessionObj = fileObject.toJSON();
    delete sessionObj.isTrash;
    delete sessionObj.owner_id;
    delete sessionObj.parent;
    delete sessionObj.__v;
    delete sessionObj.path;
    delete sessionObj.created_at;
    delete sessionObj.modified_at;
    return sessionObj;
}


function removeDirectory(path){

    let commandLine = "rm -r "+path;

    dir = exec(commandLine, function(err, stdout, stderr) {
        if (err) {
          console.log("error",err);
        }
        console.log(stdout);
        console.log(stderr);
      });
      
      dir.on('exit', function (code) {
        console.log('EXIT CODE',code);
        //res.download("/download/"+id_owner+"/"+name+".zip");

    });

}

function encryptFile(path,file,filepassword,res,result,user,encryptedFilePassword){

    let commandLine = "openssl enc -aes-256-cbc -pass pass:"+filepassword+" -p -in "+path+"/"+file+" -out "+path+"/"+file+".enc";

    //console.log('COMMAND LINE ',commandLine);

    dir = exec(commandLine, function(err, stdout, stderr) {
        if (err) {
          console.log("error",err);
        }
        console.log(stdout);
        console.log(stderr);
      });
      
      dir.on('exit', function (code) {
        console.log('EXIT CODE',code);
        if(Number.parseInt(code) === 0){
            keysModel.create({id_file:result._id,owner_id:user._id,password:encryptedFilePassword,shared_id:user._id},function(err,result){
                if(!err){
                    removeFile(path,file);
                    res.status(200).json({status:"Ok", message: file.name+" se ha subido correctamente"});
                    return 0;
                }
            });
            
        }else{
            removeFile(path,file);
            res.status(400).json({status:"Error", message:"Hubo un problema al subir el archivo"});
        }
    });

    //removeFile(path,file);
    
}

function decryptFile(path,result,decoded,filepassword,res,file,isMoreThanOneFile){
    
    let commandLine = null;
    if(isMoreThanOneFile){
        let fileNameTrim = result.name.replace(/\s+/g, '');
        console.log(fileNameTrim);
        commandLine = "openssl enc -aes-256-cbc -pass pass:"+filepassword+" -d -A -in "+STORAGE+result.owner_id+"/"+result._id+".enc -out "+path+fileNameTrim;
        console.log("DECRYPT COMMAND LINE ",commandLine);
    }else{
        commandLine = "openssl enc -aes-256-cbc -pass pass:"+filepassword+" -d -A -in "+path+"/"+result.id_file+".enc -out "+path+"/download/"+decoded.id+"/"+result.id_file;
    }
    

    if(!fs.existsSync(path+"/download/") && !isMoreThanOneFile){
        fs.mkdirSync(path+"/download/");
        if(!fs.existsSync(path+"/download/"+decoded.id)){
            fs.mkdirSync(path+"/download/"+decoded.id);
        }
    }

    //console.log(commandLine);
    dir = exec(commandLine, function(err, stdout, stderr) {
        if (err) {
          console.log(err);
        }
        console.log(stdout);
      });
      
      dir.on('exit', function (code) {
        console.log('EXIT CODE',code);
        if(!isMoreThanOneFile){
            res.download(STORAGE+result.owner_id+"/download/"+decoded.id+"/"+result.id_file,file.name, function(err){
                if(!err){
                    removeDirectory(STORAGE+result.owner_id+"/download/");
                }
            });
        }
    });
}

function removeFile(path,file){
    dir = exec("rm -r "+path+"/"+file, function(err, stdout, stderr) {
        if (err) {
          // should have err.code here?  
        }
        console.log(stdout);
      });
      
      dir.on('exit', function (code) {
        //console.log('EXIT CODE',code);
    });
}

function removeAllFiles(){
    dir = exec("rm -r /storage/*", function(err, stdout, stderr) {
        if (err) {
          // should have err.code here?  
        }
        console.log(stdout);
      });
      
      dir.on('exit', function (code) {
        console.log('EXIT CODE',code);
    });
}

function generateRandomString(){
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

            file.name = file.name.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, '');

            console.log(req.body);
    
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
                                //getUserSize(user._id,file.size).then(function(size){
                                  //  let totalSize = (size + file.size);
                                    //if(totalSize > user.storage_limit){
                                      //  res.status(400).json({status:"Error", message: "Limite de almacenamiento alcanzado"});
                                    //}else{
                                        let parent = null;
                                        if(req.body.parent === undefined){
                                            parent = 'root';
                                        }

                                        if(req.body.parent === null){
                                            parent = 'root';
                                        }

                                        if(req.body.parent !== null){
                                            parent = req.body.parent;
                                        }

                                        filesModel.create({name:file.name,size:file.size,mimetype:file.mimetype,md5:file.md5,created_at:new Date(),modified_at:new Date(),owner_id:decoded.id,shared:false,extension:file.extension,parent:parent,isTrash:false,isFolder:false,path:req.body.path},function(err,result){
                                            if(err){
                                                console.log(err);
                                                res.status(400).json({status:"Error", message: "Error al guardiar los cambios",err:err});
                                            }else{

                                                jwt.verify(req.body.keys,process.env.SECRET_KEY,(err,decoded) =>{
                                                    if(err){

                                                    }else{

                                                        //console.log(decoded);

                                                        let privKey = decoded.private_key;
                                                        let pubKey = decoded.public_key;
                                                        let pbkdf2Key = decoded.pbkdf2Key;

                                                        req.files.file.mv(STORAGE+decoded.id+"/"+result._id);

                                                        let filePassword = generateRandomString();
                                                        let encryptedFilePassword = encryptPublicKey(filePassword,pubKey);
                                                        encryptFile(STORAGE+decoded.id,result._id,filePassword,res,result,user,encryptedFilePassword);
                                                       
                                                        /*
                                                        filesModel.updateOne({_id:result._id},{$set:{"encrypetdPassword":encryptedFilePassword}},function(err,result){
                                                            if(err){console.log(err)
                                                            }else{
                                                                console.log(result);
                                                            }
                                                        });
                                                        */

                                                        //encryptedFilePassword = encrypt(filePassword,pubKey);
                                                        //console.log("ENCRYPET FILE PUBLIC KEY PASSWORD",encryptedFilePassword.toString());

                                                        //decrypt the cyphertext using the private key
                                                        //var decrypted = decryptPrivateKey(encryptedFilePassword,privKey);

                                                        //print out the decrypted text
                                                        //console.log("decripted Text:");
                                                        //console.log('FILE PASSWORD UNDERCRYPTED',decrypted.toString());
                                                        //console.log('FILE NAME ENCRYPTED',result._id+".enc");
                                                        //console.log('ORIGINAL FILENAME',file.name);
                                                    }
                                                    
                                                });
                                                
                                                /*
                                                let urlUnique = true;
                                                do{

                                                    let encrypted = encrypt('hola',req.body.pbkdf2);
                                                    let decrypted = decrypt(encrypted,req.body.pbkdf2);
                                                    

                                                    let url = generateURL();
                                                    filesModel.findOne({url:url}, function(errURL,resultURL){
                                                        if(resultURL === null){
                                                            urlUnique = false;
                                                            filesModel.updateOne({_id:result._id},{$set:{url:url}},function(err){
                                                                if(!err){
                                                                    //console.log("PBKDF2 KEY",req.body.pbkdf2);
                                                                    let encrypted = encrypt('hola',req.body.pbkdf2);
                                                                    console.log("ENCRYPTED",encrypted);
                                                                    let decrypted = decrypt(encrypted,req.body.pbkdf2);
                                                                    console.log("DECRYPTED",decrypted);

                                                                    req.files.file.mv(STORAGE+decoded.id+"/"+result._id);
                                                                    res.status(200).json({status:"Ok", message: file.name+" se ha subido correctamente"});
                                                                }
                                                            });
                                                        }
                                                    });
    
                                                }while(urlUnique === false);*/
                                            }
                                        });
                                    //}
                                //}).catch(function(err){
                                 //   res.status(400).send({status:"Error", message:"Error ocurrido al obtener el tamaño limite del usuario"});
                                //});
                            }
                        }
                    });
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
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
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },download: function(req,res){
        if(checkUri(req)){
            filesModel.findOne({_id:req.query.idfile},function(err,file){
                
                if(err){
                    console.log(err);
                    res.status(400).send(err);
                }else{
                    if(file === null){
                        //console.log("FILE NULL",file);
                        res.status(400).send({status:"Error",message:"¡Archivo no encontrado!."});
                    }else{
                        //console.log("FILE",file);
                        if(!req.query.token){

                            //IF PUBLIC
                            
                        }else{
                            
                            jwt.verify(req.query.keys,process.env.SECRET_KEY,(err2,decoded) =>{
                                if(err2){
                                    res.status(400).send({status:"error",message:"Token no authorizado"});
                                }else{
                                    //console.log("DECODED",decoded);
                                    //console.log("FILE",file);
                                    //keysModel.findOne({$and:[{shared_id:decoded.id,id_file:req.query.idfile}]},function(err,result){

                                    if(file.isFolder){
                                        mapChild.clear();
                                        hasChilds(file._id,file.owner_id);
                                        sleep(1000);
                                        console.log("RESULT MAP CHILD",mapChild);
                                        //console.log(filePath);
                                        //console.log(decoded.id);
                                        
                                        mapChild.forEach((value,key)=>{

                                            filesModel.findOne({_id:key},function(err,result){

                                                if(!result.isFolder){
                                                    if(!fs.existsSync("/download/"+result.owner_id+"/"+result.path)){
                                                        fs.mkdirSync("/download/"+result.owner_id+"/"+result.path,{recursive: true});
                                                    }

                                                    keysModel.findOne({$and:[{shared_id:decoded.id,id_file:result._id}]},function(err4,keysResult){
                                                        let passwordFile = decryptPrivateKey(keysResult.password,decoded.private_key);
                                                        console.log("PASSWORD FILE",passwordFile);
                                                        //console.log(resultAux);
                                                        decryptFile("/download/"+result.owner_id+"/"+result.path,result,decoded,passwordFile,res,file,true);
                                                        //console.log("RESULT AUX PATH ",result.path);
                                                    });
                                                }
                                                //console.log("RESULT TRUE",result);
                                            });
                                        });
                                        sleep(30000);
                                        zipFile(decoded.id,file.name,res);
                                        
                                        
                                    }else{
                                        keysModel.findOne({$and:[{shared_id:decoded.id,id_file:req.query.idfile}]},function(err3,result){
                                        
                                            //console.log(decoded);
                                            //console.log(decoded.id);
                                            if(err3){
                                                //console.log("ERROR",err2);
                                            }
    
                                            
                                            //console.log("ENTRA 2");
                                            let passwordFile = decryptPrivateKey(result.password,decoded.private_key);
                                            //console.log(passwordFile);
                                            decryptFile(STORAGE+result.owner_id,result,decoded,passwordFile,res,file,false);
                                            //console.log(decoded);
                                            
                                                
                                            
                                        });
                                    }
                                }
                            });
                        } 
                    }
                    //res.status(200).send(file);
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },downloadURL: function(req,res){
        //NEEED TO CREATE V4 FOR PUBLIC DOWNLOADS
        if(checkUri(req)){
            filesModel.findOne({_id:req.body.url},function(err,file){
                
                if(err){
                    console.log(err);
                    res.status(400).send(err);
                }else{
                    if(file === null){
                        //console.log("FILE NULL",file);
                        res.status(400).send({status:"Error",message:"¡Archivo no encontrado!."});
                    }else{

                        userModel.findOne({username:'public'},function(err2,userPublic){
                            if(err2){
                                res.status(400).send({status:"Error",message:"Oops,Claves no encontradas!."});
                            }else{
                                //let private_key_public = userPublic.private_key;

                                if(file.isFolder){
                                    mapChild.clear();
                                    hasChilds(file._id,file.q);
                                    sleep(1000);
                                    console.log("RESULT MAP CHILD",mapChild);
                                    //console.log(filePath);
                                    //console.log(decoded.id);
                                    
                                    mapChild.forEach((value,key)=>{
        
                                        filesModel.findOne({_id:key},function(err,result){
        
                                            if(!result.isFolder){
                                                if(!fs.existsSync("/download/"+result.owner_id+"/"+result.path)){
                                                    fs.mkdirSync("/download/"+result.owner_id+"/"+result.path,{recursive: true});
                                                }
        
                                                keysModel.findOne({$and:[{shared_id:userPublic.id,id_file:result._id}]},function(err4,keysResult){
                                                    let passwordFile = decryptPrivateKey(keysResult.password,userPublic.private_key);
                                                    console.log("PASSWORD FILE",passwordFile);
                                                    //console.log(resultAux);
                                                    decryptFile("/download/"+result.owner_id+"/"+result.path,result,decoded,passwordFile,res,file,true);
                                                    //console.log("RESULT AUX PATH ",result.path);
                                                });
                                            }
                                            //console.log("RESULT TRUE",result);
                                        });
                                    });
                                    sleep(30000);
                                    zipFile(decoded.id,file.name,res);
                                    
                                    
                                }else{
                                    keysModel.findOne({$and:[{shared_id:userPublic.id,id_file:req.body.url}]},function(err3,result){
                                    
                                        //console.log(decoded);
                                        //console.log(decoded.id);
                                        if(err3){
                                            //console.log("ERROR",err2);
                                        }
        
                                        
                                        //console.log("ENTRA 2");
                                        let passwordFile = decryptPrivateKey(result.password,userPublic.private_key);
                                        //console.log(passwordFile);
                                        decryptFile(STORAGE+result.owner_id,result,decoded,passwordFile,res,file,false);
                                        //console.log(decoded);
                                        
                                            
                                        
                                    });
                                }
                            }
                        })

                        
                    }
                    //res.status(200).send(file);
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }

    },getUserFiles: function(req,res){

        console.log(req.query);
        if(checkUri(req)){
            if(!req.query.token){
                res.status(400).send({status:"error",message:"No token provided!"});
            }else{
                jwt.verify(req.query.token,process.env.SECRET_KEY,(err,decoded) => {

                    if(err){
                        res.status(400).send(err);
                    }else{

                        if(req.query.type === '0'){
                            // $and DESPUES sino no podria renredizar el componente
                            filesModel.find({$or:[{owner_id:decoded.id,isTrash:false}]},function(err,files){
                                if(err){
                                    console.log(err);
                                    res.status(400).send({status:"Error",message:"No se ha podido recuperar los archivos en este momento"});
                                }else{
                                    //console.log(files);
                                    res.status(200).send(files);
                                }
                            });
                        }else if(req.query.type === '1'){
                            filesModel.find({shared:true},function(err,files){
                                if(err){
                                    console.log(err);
                                    res.status(400).send({status:"Error",message:"No se ha podido recuperar los archivos en este momento"});
                                }else{
                                    //console.log(files);
                                    res.status(200).send(files);
                                }
                            });
                        }else if(req.query.type === '2'){
                            filesModel.find({$and:[{owner_id:decoded.id,isTrash:true}]},function(err,files){
                                if(err){
                                    //console.log(err);
                                    res.status(400).send({status:"Error",message:"No se ha podido recuperar los archivos en este momento"});
                                }else{
                                    //console.log(files);
                                    res.status(200).send(files);
                                }
                            });
                        }else{
                            res.status(400).send({status:"Error",message:"No se ha podido recuperar los archivos en este momento"});
                        }
                    }
                });
            }
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
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
                                console.log(userSize.toString());
                                res.status(200).send({status:"Ok", result:userSize.toString()});
                            }).catch(function(err){
                                res.status(400).send({status:"Error", err});
                            });
                        }
                    }
                });
            }
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
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
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
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
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
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
                                let path
                                if(req.body.path === 'undefined'){
                                    path = "";
                                }else{
                                    path = req.body.path;
                                }
                                console.log(path);
                                console.log(req.body.path);
                                filesModel.create({name:req.body.foldername,created_at:new Date(),modified_at:new Date(),owner_id:decoded.id,shared:false,parent:req.body.parent,isFolder:true,isTrash:false,path:path},function(err,result){
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
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
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
                                console.log(req.body.path);
                                filesModel.updateOne({_id:req.body.elementid},{$set:{parent:req.body.parent,path:req.body.path}},function(err,result){
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
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },removeAllFiles(req,res){
        if(checkUri(req)){

            
            jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) =>{
                if(err){
                    res.status(400).send({status:"error",message:"Token no authorizado"});
                }else{
                    console.log(decoded);
                    if(decoded.typeUser === typeUser.admin){
                        userModel.findOne({_id:decoded.id},function(err,user){
                            if(user !== null){
                                if(!user.activated){
                                    res.status(400).json({status:"Error", message: "Cuenta no activada"});
                                }else{
                                    filesModel.deleteMany({},function(err,result){
                                        if(err){
                                            res.status(400).json({status:"Error", message:"Ocurrio un problema al borrar todos los archivos"});
                                        }else{
                                            removeAllFiles();
                                            keysModel.deleteMany({},function(err,result){
                                                res.status(200).json({status:"Ok", message:"Se han borrado todos los archivos"});
                                            });
                                        }
                                    });
                                    
                                }
                            }else{
                                res.status(200).json({status:"Error", message:"Usuario no existe"});
                            }
                        });
                    }else{
                        res.status(200).json({status:"Ok", message:"El usuario no es administrador"});
                    }
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },trash:function (req,res){
        if(checkUri(req)){

            jwt.verify(req.body.token,process.env.SECRET_KEY,(err,decoded) =>{
                if(err){
                    res.status(400).send({status:"error",message:"Token no authorizado"});
                }else{
                    userModel.findOne({_id:decoded.id},function(err,user){
                        
                        if(user !== null){
                            if(!user.activated){
                                res.status(400).json({status:"Error", message: "Cuenta no activada"});
                            }else{
                                
                                let elements = new Array();
                                let elementStr = "";
                                for(i=0;i<req.body.elements.length;i++){
                                    if(req.body.elements[i] !== ","){
                                        elementStr += req.body.elements[i];

                                        if(i === (req.body.elements.length - 1)){
                                            elements.push(elementStr);
                                            elementStr = "";
                                        }
                                    }else{
                                        elements.push(elementStr);
                                        elementStr = "";
                                    }
                                }

                                let errCount = 0;
                                

                                for(i=0;i<elements.length;i++){
                                    filesModel.updateOne({_id:elements[i]},{$set:{'isTrash':req.body.trash}},function(err2,result){
                                        if(err2){
                                            errCount++;
                                            
                                        }
                                    });
                                }

                                if(errCount > 1){
                                    res.status(400).json({status:"Error", message:"Ocurrio un problema al restaurar uno o varios elementos."});
                                }else{
                                    console.log("VALUE",req.body.trash);
                                    if(req.body.trash === 'false'){
                                        res.status(200).json({status:"Ok", message:"Se han restaurado "+elements.length+" elementos a Tus Archivos."});
                                    }else if(req.body.trash === 'true'){
                                        res.status(200).json({status:"Ok", message:"Se ha movido "+elements.length+" elementos a la Papelera."});
                                    }
                                    
                                }
                            }
                        }
                    });
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },share(req,res){
        if(checkUri(req)){
            userModel.findOne({_id:req.body.useremail},function(err,user){
                if(user === null){
                    res.status(301).json({status:"error",message:"No existe este usuario."});
                }else{

                    jwt.verify(req.body.token,process.env.SECRET_KEY,(err,owner) =>{
                        if(err){
                            res.status(400).send({status:"error",message:"Token no authorizado"});
                        }

                        jwt.verify(req.body.keys,process.env.SECRET_KEY,(err,decoded) =>{
                            if(err){
                                res.status(400).send({status:"error",message:"Claves no válidas"});
                            }else{
    
                                filesModel.findOne({_id:req.body.idfile},function(err,file){

                                    if(!err){
                                        let privKey = decoded.private_key;
                                        let pubKey = decoded.public_key;
                                        let pbkdf2Key = decoded.pbkdf2Key;
        
                                        //keysModel.findOne({})
                                        keysModel.findOne({$and:[{shared_id:user._id,id_file:req.body.idfile,owner_id:owner.id}]},function(err4,keysResult){
                                            if(keysResult.length === 0){
                                                keysModel.findOne({$and:[{shared_id:owner.id,id_file:req.body.idfile,owner_id:owner.id}]} ,function(err,keyResult2){
                                                    let Filepassword = decryptPrivateKey(keyResult2.password,privKey);
                                                    let encryptedPassword = encryptPublicKey(Filepassword,user.public_key);
                                                    keysModel.create({id_file:req.body.idfile,owner_id:owner.id,password:encryptedPassword,shared_id:user.id},function(err,resultKeyCreate){
                                                        if(!err){
                                                            res.status(200).json({status:"Ok", message: file.name+" se ha compartido correctamente"});
                                                        }
                                                    });
                                                });
                                            }
                                        });
                                    }else{
                                        res.status(400).send({status:"error",message:"Error al compartir el archivo"});
                                    }
                                });   
                            }
                        });
                    });
                }
            });
        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },setPublicDownload(req,res){
        if(checkUri(req)){
            if(req.body.idfile){

                jwt.verify(req.body.keys,process.env.SECRET_KEY,(err,decoded) =>{
                    if(err){
                        res.status(400).send({status:"error",message:"Claves no válidas"});
                    }else{
                        let privKey = decoded.private_key;
                        let pubKey = decoded.public_key;
                        let pbkdf2Key = decoded.pbkdf2Key;

                        keysModel.findOne({$and:[{shared_id:decoded.id,id_file:req.body.idfile,owner_id:decoded.id}]},function(err4,keysResult){
                            
                            
                            if(keysResult === null){
                                //keysModel.deleteOne({$and:[{shared_id:decoded.id,id_file:req.body.idfile,owner_id:decoded.id}]},function(err5){});
                                res.status(401).send({status:"error",message:"Surgió un problema al generar la URL"});
                            }else{
                                

                                let passwordDecrypted = decryptPrivateKey(keysResult.password,privKey);
                                //console.log("PASSWORRD",passwordDecrypted);
                                userModel.findOne({username:'public'},function(err,publicUser){
                                    let encryptedPassword = encryptPublicKey(passwordDecrypted,publicUser.public_key);

                                    keysModel.findOne({id_file:req.body.idfile,owner_id:decoded.id,shared_id:publicUser.id},function(err,keysFind){

                                        
                                        if(keysFind !== null){
                                            keysModel.deleteOne({id_file:req.body.idfile,shared_id:process.env.SHARE_PUBLIC_USER_ID,owner_id:decoded.id},function(err3,keysResult){
                                            });
                                        }

                                        
                                        keysModel.create({id_file:req.body.idfile,owner_id:decoded.id,password:encryptedPassword,shared_id:publicUser.id},function(err,resultKeyCreate){
                                            if(!err){
                                                let urlUnique = true;
                                                do{   
                                                    let url = generateURL();
                                                    filesModel.findOne({url:url}, function(errURL,resultURL){
                                                        if(resultURL === null){
                                                            urlUnique = false;
                                                            console.log("URL",url);
                                                            filesModel.updateOne({_id:req.body.idfile},{$set:{url:url,shared:true}},function(err){
                                                                if(!err){
                                                                    res.status(200).json({status:"Ok", message:"Se ha generado la URL correctamente",url:url,password:passwordDecrypted});
                                                                }else{
                                                                    res.status(400).send({status:"error",message:"Surgió un problema al generar la URL"});
                                                                }
                                                            });
                                                        }
                                                    });
                                                }while(urlUnique === false);
                                            }else{
                                                res.status(400).send({status:"error",message:"Surgió un problema al generar la URL"});
                                            }
                                        });
                                        
                                    });
                                    
                                });
                            }
                        });
                    }
                });  
            }
        }else{
            res.status(301).send({status:"error",message:process.env.USE_ROUTE});
        }
    },getFileToDownload: function(req,res){
        if(checkUri(req)){
            if(req.body.url !== null){
                
                filesModel.findOne({url:req.body.url},function(err,result){
                    if(result === null){
                        res.status(401).send({status:"error",message:"¡Archivo no encontrado!"});
                    }else{
                        
                        userModel.findOne({username:'public'},function(err2,userPublic){
                            if(err){
                                res.status(400).send({status:"error",message:"No se ha encontrado las Claves!"});
                            }else{
                                keysModel.findOne({$and:[{id_file:result._id,shared_id:userPublic._id}]},function(err3,keysResult){

                                    if(err3){
                                        res.status(401).send({status:"error",message:"No se encontraron las claves de encriptación en este archivo."});
                                    }else{
                                        if(keysResult === null){
                                            res.status(401).send({status:"error",message:"Archivo no disponible o borrado por el usuario"});
                                        }else{
                                            
                                            let passwordDecrypted = decryptPrivateKey(keysResult.password,userPublic.private_key);

                                            result = cleanReturn(result);
                                            if(passwordDecrypted === req.body.password){
                                                res.status(201).send({status:"Success",result:result,password:true});
                                            }else{
                                                res.status(201).send({status:"error",result:result,password:false,message:"Código de encriptación no válido."});
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                })
            }else{
                res.status(401).json({status:"error",message:"¡Archivo no encontrado!"});
            }

        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },getPublicFilePassword: function(req,res){
        if(checkUri(req)){
            if(req.body.idfile !== null){
                //console.log(req.body);

                jwt.verify(req.body.keys,process.env.SECRET_KEY,(err,decoded) =>{
                    if(err){
                        res.status(401).json({status:"error",message:"Error surgió un problema al encontrar la clave!"});
                    }else{
                        
                        keysModel.findOne({id_file:req.body.idfile,shared_id:process.env.SHARE_PUBLIC_USER_ID,owner_id:decoded.id},function(err3,keysResult){
                            if(err3){
                                console.log(err3);
                            }
                            console.log(keysResult);

                            if(keysResult !== null){

                                userModel.findOne({username:'public'},function(err,result){
                                    if(err){
                                        res.status(401).json({status:"error",message:"Error, no se encontraron las claves del archivo!"});
                                    }else{
                                        let passwordDecrypted = decryptPrivateKey(keysResult.password,result.private_key);
                                        //console.log(passwordDecrypted);
                                        res.status(201).json({status:"Success",password:passwordDecrypted});
                                    }
                                })
                            }else{
                                res.status(401).json({status:"error",message:"Error surgió un problema al encontrar la clave!"});
                            }
                        });
                    }
                });
            }else{
                res.status(301).json({status:"error",message:"¡Archivo no encontrado!"});
            }

        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    },deleteURL: function(req,res){
        if(checkUri(req)){
            if(req.body.idfile !== null){
                

                jwt.verify(req.body.keys,process.env.SECRET_KEY,(err,decoded) =>{
                    if(err){
                        res.status(401).json({status:"error",message:"Error surgió un problema al encontrar la clave!"});
                    }else{
                        
                        
                        keysModel.deleteOne({id_file:req.body.idfile,shared_id:process.env.SHARE_PUBLIC_USER_ID,owner_id:decoded.id},function(err3,keysResult){
                            if(err3){
                                console.log(err3);
                            }else{
                                console.log(keysResult);
                                filesModel.updateOne({_id:req.body.idfile},{$set:{url:null,shared:false}},function(err,result){
                                    if(err){
                                        console.log(err);
                                        res.status(401).json({status:"error",message:"Error, un problema al borrar el URL!"});
                                    }else{
                                        console.log(result);
                                        res.status(201).json({status:"Success",message:"La URL se eliminó correctamente"});
                                    }
                                });
                            } 
                        });
                    }
                });
            }else{
                res.status(301).json({status:"error",message:"¡Archivo no encontrado!"});
            }

        }else{
            res.status(301).json({status:"error",message:process.env.USE_ROUTE});
        }
    }
}