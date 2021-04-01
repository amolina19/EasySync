const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilesSchema = new Schema({
    owner :{
        type: String,
        trim: true,
        required: true
    },
    chunk_id :{
        type: String,
        trim: true,
        required: true
    },
});

module.exports = mongoose.model('Files', FilesSchema);
