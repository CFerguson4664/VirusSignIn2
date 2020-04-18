//Using libsodium for encryption. Paired with CryptoClient.js on the client side. 
//Requires 'npm install libsodium-wrappers'

//Require the npm module
const sodium = require('libsodium-wrappers')

//Variables to store the keys. 
var keys;
var oldKeys;

//The lifetime of the keypair on the server in minutes
//The current public key will be sent to all newly connecting clients.
//The preivous keypair is also stored in the database in order to authenticate
//  any older requests that still have to come in.

//If session tracking is being used then this should be the same as or longer than the session
//  timeout interval
var serverKeyLifetime = 30; //In minutes


exports.encode = function(message, recipientPublicKey, callback) {
    var nonce = sodium.randombytes_buf(window.sodium.crypto_box_NONCEBYTES);
    var ourKeys = keys;

    var box = sodium.crypto_box_easy(message, nonce, recipientPublicKey, ourKeys.privateKey);

    var data = '' + ourKeys.publicKey + '.' + nonce + '.' + box;

    callback(data);
}

exports.decode = function(data, callback) {
    var firstSplit = data.split('.');
    var ourPublicKey = Uint8Array.from(firstSplit[0].split`,`.map(x=>parseInt(x)));
    var theirPulbicKey = Uint8Array.from(firstSplit[1].split`,`.map(x=>parseInt(x)));
    var nonce = Uint8Array.from(firstSplit[2].split`,`.map(x=>parseInt(x)));
    var box = Uint8Array.from(firstSplit[3].split`,`.map(x=>parseInt(x)));

    var decoded;
    var success;
    if(keys.publicKey == ourPublicKey) {
        decoded = sodium.crypto_box_open_easy(box, nonce, theirPulbicKey, keys.privateKey);
        success = true;
    }
    else if(oldKeys.publicKey == ourPublicKey) {
        decoded = sodium.crypto_box_open_easy(box, nonce, theirPulbicKey, oldKeys.privateKey);
        success = true;
    }
    else {
        decoded = undefined;
        success = false;
    }

    var decodedAsString
    if(success)
    {
        decodedAsString = String.fromCharCode.apply(null, decoded);
    }
    else
    {
        decodedAsString = undefined;
    }

    callback(success, decodedAsString);
}

exports.encodeResponse = function(newMessage, oldMessage, callback)
{
    var firstSplit = oldMessage.split('.');
    var theirPulbicKey = Uint8Array.from(firstSplit[1].split`,`.map(x=>parseInt(x)));

    var nonce = sodium.randombytes_buf(window.sodium.crypto_box_NONCEBYTES);
    var ourKeys = keys;

    var box = sodium.crypto_box_easy(newMessage, nonce, theirPulbicKey, ourKeys.privateKey);

    var data = '' + ourKeys.publicKey + '.' + nonce + '.' + box;

    callback(data);
}

setInterval(function(){
    oldKeys = keys;
    keys = sodium.crypto_box_keypair();
}, serverKeyLifetime * 60 * 1000)