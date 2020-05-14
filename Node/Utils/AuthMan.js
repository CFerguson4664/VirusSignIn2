//Using libsodium for encryption. Paired with CryptoClient.js on the client side. 
//Requires 'npm install libsodium-wrappers'

//Require the npm module
const sodium = require('libsodium-wrappers')


exports.hash = function(username,password) {
    
    var hashed = sodium.crypto_pwhash_str(password,
        sodium.crypto_pwhash_OPSLIMIT_MODERATE,
        sodium.crypto_pwhash_MEMLIMIT_MODERATE);

    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hashed}`);

    console.log(`bytes: ${sodium.crypto_pwhash_STRBYTES}`)
}

//Returns (success)
exports.removeAllAuthForLevel = function(level, callback) {

}

//Returns (success)
exports.addAuthForLevel = function(level,username,password,callback) {

}

//Returns (success,level,authId)
exports.authenticate = function(usrname,password) {

}

//Returns (success,level,authId)
exports.authenticateAtLevel = function(username,password) {

}