const filesModel = require('../models/files');
const jwt = require('jsonwebtoken');


function checkUri(request){
    if(request.headers.host.includes('api')){
        return true;
    }
    return false;
}

module.exports = {

    upload: function(req,res,next){
        res.send({status:"developing"});
    },

    download: function(req,res,next){
        checkUri(req);
        res.send({status:"developing"});
    }
}