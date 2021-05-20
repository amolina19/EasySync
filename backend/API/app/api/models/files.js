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
        required: true
    },
    mimetype :{
        type: String,
        trim: true,
        required: true
    },
    extension: {
        type: String,
        trim: true,
        required: true
    },
    md5:{
        type: String,
        trim: true,
        required: true
    },
    created_at:{
        type: Date
    },
    modified_at:{
        type: Date,
    },
    owner_id:{
        type: String,
        trim: true,
        required: true
    },
    shared:{
        type: Boolean,
    },
    url:{
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Files', FilesSchema);
