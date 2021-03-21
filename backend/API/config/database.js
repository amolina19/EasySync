const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const mongoDB = process.env.DATABASE_CONN;
mongoose.connect(mongoDB,{ useUnifiedTopology: true,useNewUrlParser: true });
mongoose.Promise = global.Promise;
module.exports = mongoose;

