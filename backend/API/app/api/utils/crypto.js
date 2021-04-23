
const pbkdf2 = require('pbkdf2');
const dotenv = require('dotenv');
dotenv.config();


const crypto = {

    getPBKDF2: function (password){
        let derivedKey = pbkdf2.pbkdf2Sync(password, process.env.PBKDF2_SALT, parseInt(process.env.PBKDF2_ITERATIONS), parseInt(process.env.PBKDF2_BIT_LENGTH), 'sha512');
        return derivedKey.toString();
    },
    getPBKDF2Hex: function (password){
        let derivedKey = pbkdf2.pbkdf2Sync(password, process.env.PBKDF2_SALT, parseInt(process.env.PBKDF2_ITERATIONS), parseInt(process.env.PBKDF2_BIT_LENGTH), 'sha512');
        return derivedKey.toString('hex');
    }
}

exports.easysync = crypto;
