const mongoose = require('mongoose');
const mongoDB = 'mongodb://easysync:#sxFGpKj9@localhost:27017/EasySync';
mongoose.connect(mongoDB,{ useUnifiedTopology: true,useNewUrlParser: true });
mongoose.Promise = global.Promise;
module.exports = mongoose;

