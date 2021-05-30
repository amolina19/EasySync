const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeysSchema = new Schema({
    id_file :{
        type: String,
        trim: true,
        required: true
    },
    owner_id :{
        type: String,
        trim: true,
        required: false
    },
    shared_id:{
        type:String,
        trim:true,
        required:true
    },
    password :{
        type: String,
        trim: true,
        required: false
    }
});

module.exports = mongoose.model('Keys', KeysSchema);
