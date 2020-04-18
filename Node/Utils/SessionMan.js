const crypto = require('crypto');
const SQL = require('./GeneralSql');

//Gets a new valid session Id for the provided access level.
exports.getNewSessionId = function(level, callback) {
    valid = false;

    //Loops until a valid id is found
    while(!valid) {
        //Get 16 random bytes
        crypto.randomBytes(16, function(err, buf) {
            //Convert the 16 random bytes to a 32 character hexadecimal number
            var id = buf.toString('hex');

            //Check to see if the newly generated id already exists
            idExists(id, function(exists) {

                //If the id does not exist it is valid and can be used, otherwise it is not valid and we
                //  need to try again
                if(!exists) {
                    //End the loop
                    valid = true;

                    //callback with the valid id
                    return callback(id);
                }
            });
        });
    }
}

//Checks if a provided session Id is valid at the provided permission level
exports.sessionIdValid = function(sessionId, level, callback) {

    //Query the database and callback with the result
    idExistsAtLevel(sessionId, level, function(exists) {
        callback(exists);
    });
}

//Querys the database to see if the sessionId exists
function idExists(id, callback) {
    var table = 'sessions';
    var columns = ['sessionId'];
    var params = ['sessionId'];
    var values = [`${id}`];

    //Will only return values if the session id exists
    SQL.select(table, columns, params, values, function(err,ids) {
        
        //After checking callback true if the id was found and false if it was not
        if(ids.length == 0) {
            return callback(false);
        }
        else {
            return callback(true);
        }
    });
}

//Checks if the id exist with the given perimission level
function idExistsAtLevel(id, level, callback) {
    var table = 'sessions';
    var columns = ['sessionId'];
    var params = ['sessionId','level'];
    var values = [`${id}`,`${level}`];

    //Will only return values if the session id exists
    SQL.select(table, columns, params, values, function(err,ids) {
        
        //After checking callback true if the id was found and false if it was not
        if(ids.length == 0) {
            return callback(false);
        }
        else {
            return callback(true);
        }
    });
}