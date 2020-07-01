// Copyright 2020
// Xor Softworks LLC

//Using libsodium for encryption. Paired with CryptoClient.js on the client side. 
//Requires 'npm install libsodium-wrappers'

//Require the npm module
const sodium = require('libsodium-wrappers')

//Require the database module
const SQL = require('./GeneralSql');

//Variables to store the keys. 

//The lifetime of the keypair on the server in minutes
//The current public key will be sent to all newly connecting clients.
//The preivous keypair is also stored in the database in order to authenticate
//  any older requests that still have to come in.

//If session tracking is being used then this should be the same as or longer than the session
//  timeout interval
var serverKeyLifetime = 24 * 60; //In minutes


function getKeys(callback) {
    //table, columns, params, operators, values, extraSQL, callback

    var table = 'encryptionkeys';
    var columns = [`publicKey`,`privateKey`,`age`];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = 'ORDER BY age';

    SQL.selectExtra(table,columns,params,operators,values,extraSQL, function(err,data) {
        //key1.public,key1.private,key2.public,key2.private

        var newPublic = Uint8Array.from(data[0][0].split`,`.map(x=>parseInt(x)));
        var newPrivate = Uint8Array.from(data[0][1].split`,`.map(x=>parseInt(x)));
        var oldPublic = Uint8Array.from(data[1][0].split`,`.map(x=>parseInt(x)));
        var oldPrivate = Uint8Array.from(data[1][1].split`,`.map(x=>parseInt(x)));

        callback(newPublic, newPrivate, oldPublic, oldPrivate);
    })
}

exports.getPublicKey = function(callback) {
    getKeys(function(newPublic,newPrivate,oldPublic,oldPrivate) {
        callback(newPublic);
    });
}

exports.init = function(callback) {
    var table = 'encryptionkeys';
    var params = [];
    var values = [];

    SQL.delete(table,params,values, function(err,done) {
        var keys = sodium.crypto_box_keypair();
    
        var table = 'encryptionkeys';
        var columns = ['publicKey','privateKey','age'];
        var values = [`'${keys.publicKey}'`,`'${keys.privateKey}'`,`2`];

        SQL.insert(table,columns,values, function(err,done) {
            var keys = sodium.crypto_box_keypair();
    
            var table = 'encryptionkeys';
            var columns = ['publicKey','privateKey','age'];
            var values = [`'${keys.publicKey}'`,`'${keys.privateKey}'`,`1`];

            SQL.insert(table,columns,values, function(err,done) {
                callback(done);
            });
        });
    });
}


exports.encode = function(message, recipientPublicKey, callback) {
    getKeys(function(newPublic,newPrivate,oldPublic,oldPrivate) {
        var nonce = sodium.randombytes_buf(window.sodium.crypto_box_NONCEBYTES);

        var box = sodium.crypto_box_easy(message, nonce, recipientPublicKey, newPrivate);

        var data = '' + newPublic + '.' + nonce + '.' + box;

        callback(data);
    });
}

exports.decode = function(data, callback) {
    getKeys(function(newPublic,newPrivate,oldPublic,oldPrivate) {
        var firstSplit = data.split('.');
        var ourPublicKey = Uint8Array.from(firstSplit[0].split`,`.map(x=>parseInt(x)));
        var theirPulbicKey = Uint8Array.from(firstSplit[1].split`,`.map(x=>parseInt(x)));
        var nonce = Uint8Array.from(firstSplit[2].split`,`.map(x=>parseInt(x)));
        var box = Uint8Array.from(firstSplit[3].split`,`.map(x=>parseInt(x)));

        var decoded;
        var success;

        if(newPublic.toString() == ourPublicKey.toString()) {
            decoded = sodium.crypto_box_open_easy(box, nonce, theirPulbicKey, newPrivate);
            success = true;
        }
        else if(oldPublic.toString() == ourPublicKey.toString()) {
            decoded = sodium.crypto_box_open_easy(box, nonce, theirPulbicKey, oldPrivate);
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

    });
}

exports.encodeResponse = function(newMessage, oldMessage, callback)
{
    getKeys(function(newPublic,newPrivate,oldPublic,oldPrivate) {
        var firstSplit = oldMessage.split('.');
        var theirPulbicKey = Uint8Array.from(firstSplit[1].split`,`.map(x=>parseInt(x)));

        var nonce = sodium.randombytes_buf(window.sodium.crypto_box_NONCEBYTES);

        var box = sodium.crypto_box_easy(newMessage, nonce, theirPulbicKey, newPrivate);

        var data = '' + newPublic + '.' + nonce + '.' + box;

        callback(data);
    });
}

setInterval(function() {
    var table = 'encryptionkeys';
    var params = ['age'];
    var values = ['2'];

    SQL.delete(table,params,values, function(err,done) {
        var table = 'encryptionkeys';
        var columns = ['age'];
        var colValues = ['2'];
        var params = ['age'];
        var parValues = ['1'];
        
        SQL.update(table,columns,colValues,params,parValues, function(err,done) {
            var keys = sodium.crypto_box_keypair();
    
            var table = 'encryptionkeys';
            var columns = ['publicKey','privateKey','age'];
            var values = [`'${keys.publicKey}'`,`'${keys.privateKey}'`,`1`];
    
            //Add the new user to the database
            SQL.insert(table,columns,values, function(err,done) {
                getKeys(function(a,b,c,d){});
            });
        });
    });
}, serverKeyLifetime * 60 * 1000)