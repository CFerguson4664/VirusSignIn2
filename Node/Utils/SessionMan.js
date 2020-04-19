const crypto = require('crypto');
const SQL = require('./GeneralSql');
const time = require('./TimeUtils')


//Sets the session lifetime in minutes.
var sessionLifetime = 30 //minutes

//Function to remove old sessions after a given number of minutes
setInterval(function() {
    //Every sessionLifetime delete the old sessions from the database.
    deleteOldSessions(function(success) {});
}, sessionLifetime * 60 * 1000);

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

                    //Insert the id into the database
                    insertId(id, level, function(success){
                        //callback with the valid id
                        return callback(id);
                    });
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

function deleteOldSessions() {
    //Get the current time minus the session lifetime to use in database query
    var deleteTime = time.getTime(0,0,0,0,(-1 * sessionLifetime),0);

    var table = 'sessions'
    var params = ['creationTime']
    var operators = ['<']
    var values = [`${deleteTime}`]
    var extraSQL = '';

    //Delete any sessions older than deleteTime
    SQL.deleteExtra(table, params, operators, values, extraSQL, function(err,res){ 

        //Calls back with true if successful or false if not
        callback(res);
    })
}

function insertId(id, level, callback) {
    //Get the current time to use as the session's creation time
    var currentTime = time.getTime()

    var table = 'sessions';
    var columns = ['sessionId','level','creationTime'];
    var values = [`${id}`,`${level}`,`${currentTime}`];

    SQL.insert(table,columns,values,function(err,success) {
        callback(success);
    })
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