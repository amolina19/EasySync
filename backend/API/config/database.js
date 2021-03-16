const mongoose = require('mongoose');
const mongoDB = 'mongodb://localhost:27017/Easysync';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
module.exports = mongoose;