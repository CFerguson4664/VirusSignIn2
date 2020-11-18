// Copyright 2020
// Xor Softworks LLC

//Using libsodium for encryption. Paired with CryptoClient.js on the client side. 
//Requires 'npm install libsodium-wrappers'

//Require the npm module
const sodium = require('libsodium-wrappers')

//Require the database module
const SQL = require('./GeneralSql');

// creds for axios auth
var creds = undefined;

exports.init = function(isAuth, username,password) {
    console.log(`auth?: ${isAuth}`);
    if (isAuth=='true') {
        console.log(`authenticating`);
        creds = {
            auth: {
                username: username,
                password: password
            }
        }
    }
}

exports.getCreds = function() {
    return creds;
}


function hash(password,callback) {
    var hashed = sodium.crypto_pwhash_str(password,
        sodium.crypto_pwhash_OPSLIMIT_MODERATE,
        sodium.crypto_pwhash_MEMLIMIT_MODERATE);
    
    callback(undefined,hashed);
}

exports.getUserNames = function(callback) {
    var table = 'authentication';
    var columns = ['username'];
    var params = [];
    var values = [];

    //Try to select the first and last names from the database
    SQL.select(table,columns,params,values, function(err,data) {
        if (err) return callback(err,undefined);
        callback(undefined,data[0]);
    });
}

//Returns (success)
exports.addAuthForLevel = function(level,username,password,callback) {
    hash(password, function(err,hashed) {
        if (err) return callback(err,undefined);

        var table = 'authentication';
        var columns = ['level','username','hash'];
        var values = [`${level}`,`'${username}'`,`'${hashed}'`];

        //Add the new user to the database
        SQL.insert(table,columns,values, function(err,done) {
            if (err) return callback(err,undefined);
            callback(undefined,done);
        });
    });
}

//Returns (success,authId,level)
exports.authenticate = function(username,password,callback) {
    var table = 'authentication';
    var columns = ['hash','authId','level'];
    var params = ['username'];
    var values = [`'${username}'`];

    //Try to select the first and last names from the database
    SQL.select(table,columns,params,values, function(err,data) {
        if (err) return callback(err,undefined,undefined,undefined);
        
        for(var i = 0; i < data.length; i++) {
            var hash = data[0][0];
            var authId = data[0][1];
            var level = data[0][2];

            var valid = sodium.crypto_pwhash_str_verify(hash,password);

            if(valid) {
                return callback(undefined,true,authId,level);
            }
        }
        return callback(undefined,false,undefined,undefined);
    });
}

//Returns (success,authId,level)
exports.authenticateAtLevel = function(username,password,level,callback) {
    var table = 'authentication';
    var columns = ['hash','authId','level'];
    var params = ['username','level'];
    var values = [`'${username}'`,`${level}`];

    //Try to select the first and last names from the database
    SQL.select(table,columns,params,values, function(err,data) {
        if (err) return callback(err,undefined,undefined,undefined);

        for(var i = 0; i < data.length; i++) {
            var hash = data[0][0];
            var authId = data[0][1];
            var level = data[0][2];

            var valid = sodium.crypto_pwhash_str_verify(hash,password);

            if(valid) {
                return callback(undefined,true,authId,level);
            }
        }
        return callback(undefined,false,undefined,undefined);
    });
}

//Returns (success)
exports.removeOnAuthId = function(authId,callback) {
    var table = 'authentication';
    var params = [`authId`];
    var values = [`${authId}`];

    SQL.delete(table,params,values, function(err,done) {
        if (err) return callback(err,undefined);

        callback(undefined,done);
    });
}

//Returns (success)
exports.removeAllAuthForLevel = function(level, callback) {
    var table = 'authentication';
    var params = [`level`];
    var values = [`${level}`];

    SQL.delete(table,params,values, function(err,done) {
        if (err) return callback(err,undefined);

        callback(undefined,done);
    });
}