const filesModel = require('../models/files');
const jwt = require('jsonwebtoken');


function checkUri(request){
    if(request.secure){
        console.log(request.secure);
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