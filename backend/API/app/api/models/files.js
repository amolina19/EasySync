const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilesSchema = new Schema({
    name :{
        type: String,
        trim: true,
        required: true
    },
    size :{
        type: Number,
        trim: true,
        required: false
    },
    mimetype :{
        type: String,
        trim: true,
        required: false
    },
    extension: {
        type: String,
        trim: true,
        required: false
    },
    md5:{
        type: String,
        trim: true,
        required: false
    },
    created_at:{
        type: Date,
        required: false
    },
    modified_at:{
        type: Date,
        required: false
    },
    owner_id:{
        type: String,
        trim: true,
        required: true
    },
    shared:{
        type: Boolean,
        required: false
    },
    url:{
        type: String,
        trim: true,
        required: false
    },
    parent:{
        type:String,
        required:false
    },
    isFolder:{
        type:Boolean,
        required:false
    },
    isTrash:{
        type:Boolean,
        required:false
    }
});

module.exports = mongoose.model('Files', FilesSchema);
