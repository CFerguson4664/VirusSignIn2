// Copyright 2020
// Xor Softworks LLC

//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//Requires the TimeUtils utility
const time = require('../Utils/TimeUtils');

//Requires the GeneralSQL utility
const SQL = require('../Utils/GeneralSql');

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
module.exports = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/', function(req,res) {

    //Headers to try to prevent the page from being cached 
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    // helmet makes the page not render html, unless the content type is set
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    //Get a new session id to represent this client
    createSession(function(sessionId) {
        //Get the starting form of the webpage
        getPage(function(HTML) {
            //Send the seesion id to the client
            res.cookie('SignInLvl1',sessionId, { httpOnly: true });
            //Send the HTML to the client
            res.write(HTML);
            //End our response to the client
            res.end();
        });
    });
});

router.post('/data',function(req,res) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Store the data sent by the client
    var data = req.body.response

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            if(data == 0) {
                res.send('/new');
                res.end();
            }
            else if(data == 1) {
                res.send('/returning');
                res.end();
            }
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/timeout');
            res.end();
        }
    });
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    callback(Template());
}

function Template() {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="Xor Softworks LLC">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="usertype.js"></script>
            <title>Sign In</title>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company Logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Previous page</button>
        </header>
        <main class="bg-light">
            <button name="type" onclick="button_click(this)" value="0">New User</button>
            <button name="type" onclick="button_click(this)" value="1">Returning User</button>
        </main>
        <footer class="bg-dark-float-off" id="subFoot">
        </footer>
        <footer class="bg-dark">
            <div id="social-icons">
            </div>
        </footer>
    </html>`;

    return html;
}

//*********************************************** SPECIAL FUNCTIONS *********************************************

//Creates a new session and sessionData entry
function createSession(callback) {
    //Get the current time to use as the session's creation time
    var sessionTime = time.getTime();

    //Get a new session id to use for the session
    sessionMan.getNewSessionId(1, function(sessionId) {

        var table = 'sessionData';
        var columns = ['sessionId','sessionDatetime'];
        var values = [`'${sessionId}'`,`'${sessionTime}'`];

        //Insert the session id and creation time into the database
        SQL.insert(table, columns, values, function(err, success) {
            //callback the session id so it can be sent to the client
            callback(sessionId);
        });
    });
}

exports.deleteOldSessionData = function() {
    //Get all of the sessionData entries out of the database
    var table = 'sessiondata';
    var columns = ['sessionId'];
    var params = [];
    var values = [];

    SQL.select(table,columns,params,values,function(err,data) {
        if(data.length > 0) {
            //Delete the data if it is old
            deleteOnId(data, function(done) {

            });
        }
    });
};


//Delete the session data entry for any sessionIds that are no longer in the sessions table
function deleteOnId(data, callback) {
    var current = data.shift();
    var sessionId = current[0];
    sessionMan.sessionIdValid(sessionId, 1, function(valid) {
        if(!valid) {
            var table = 'sessiondata';
            var params = ['sessionId'];
            var values = [`'${sessionId}'`];

            SQL.delete(table,params,values, function(err,success) {
            });
        }
    });

    if(data.length > 0) {
        deleteOnId(data, function(done) {
            callback(done);
        })
    }
    else {
        callback(true);
    }
}