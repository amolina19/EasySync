const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({

    browser :{
        type: String,
        trim: true,
        required: true
    },
    os :{
        type: String,
        trim: true,
        required: true
    }, 
    ip :{
        type: String,
        trim: true,
        required: true
    }, 
    country :{
        type: String,
        trim: true,
        required: true
    }, 
    date :{
        type: Date,
        trim: true,
        required: true
    }, 
    org :{
        type: String,
        trim: true,
        required: true
    }, 
    latitude :{
        type: Number,
        trim: true,
        required: true
    }, 
    longitude :{
        type: Number,
        trim: true,
        required: true
    },
    country_code :{
        type: String,
        trim: true,
        required: true
    },
    country_name :{
        type: String,
        trim: true,
        required: true
    },
    city :{
        type: String,
        trim: true,
        required: false
    },
    region :{
        type: String,
        trim: true,
        required: true
    },
    region_code :{
        type: String,
        trim: true,
        required: true
    },
    postal :{
        type: String,
        trim: true,
        required: true
    },
    deviceuuid :{
        type: String,
        trim: true,
        required: true
    },user_id :{
        type: String,
        trim: true,
        required: true
    }
});

module.exports = mongoose.model('Session', SessionSchema);