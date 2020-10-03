// Copyright 2020
// Xor Softworks LLC

//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Requires server encryption
const encryption = require('../Utils/CryptoServer');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//Requires the TimeUtils utility
const time = require('../Utils/TimeUtils');

//Requires passwords
const auth = require('../Utils/AuthMan');

//Requires the GeneralSQL utility
const SQL = require('../Utils/GeneralSql');

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
module.exports = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/', function(req,res,next) {
    //Headers to try to prevent the page from being cached 
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    // helmet makes the page not render html, unless the content type is set
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    //Get the starting form of the webpage
    getPage(function(err,HTML) {
        if (err) return next(err);
        //Send the HTML to the client
        res.write(HTML);
        //End our response to the client
        res.end();
    });
});

router.post('/auth',function(req,res,next) {

    var encrypted = req.body.data;

    encryption.decode(encrypted, function(err,success,data) {
        if (err) return next(err);

        var split = data.split(`,`);

        auth.authenticate(split[0],split[1], function(err2,success,authId,level) {
            if (err2) return next(err2);

            if(success) {
                if(level == 3) {
                    createAdminSession(function(err3,sessionId) {
                        if (err3) return next(err3);
                        res.cookie('SignInLvl3',sessionId, { httpOnly: true });
                        res.send('/admin');
                        res.end();
                    })
                }
                else if(level == 2) {
                    createSecuritySession(function(err4,sessionId) {
                        if (err4) return next(err4);
                        res.cookie('SignInLvl2',sessionId, { httpOnly: true });
                        res.send('/security');
                        res.end();
                    })
                }
                else {
                    res.send('-1');
                    res.end();
                }
            }
            else {
                res.send('-1');
                res.end();
            }
        });
    });
    

    
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    encryption.getPublicKey(function(err,publickey) {
        if (err) return callback(err,undefined);
        callback(undefined,Template(publickey));
    });
}

function Template(publickey)
{
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="Xor Softworks LLC">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="sodium.js"></script>
            <script src="cryptoclient.js"></script>
            <script src="login.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company logo">
            </div>
        </header>
        <header class="bg-dark-header">
        </header>
        
        <main class="bg-light" id='main' data-publickey='${publickey}'>
            <div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Username</h2>
                    <input type="text" id="username" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Password</h2>
                    <input type="password" id="password" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <div id='passworderror'></div>
                    <button name="login" id='login' class="ready">Login</button>
                </div>
            </div>
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
function createAdminSession(callback) {
    //Get the current time to use as the session's creation time
    var sessionTime = time.getTime();

    //Get a new session id to use for the session
    sessionMan.getNewSessionId(3, function(err,sessionId) {
        if (err) return callback(err,undefined);

        var table = 'sessionData';
        var columns = ['sessionId','sessionDatetime'];
        var values = [`'${sessionId}'`,`'${sessionTime}'`];

        //Insert the session id and creation time into the database
        SQL.insert(table, columns, values, function(err2, success) {
            if (err2) return callback(err2,undefined);
            //callback the session id so it can be sent to the client
            callback(undefined,sessionId);
        });
    });
}

//Creates a new session and sessionData entry
function createSecuritySession(callback) {
    //Get the current time to use as the session's creation time
    var sessionTime = time.getTime();

    //Get a new session id to use for the session
    sessionMan.getNewSessionId(2, function(err,sessionId) {
        if (err) return callback(err,undefined);

        var table = 'sessionData';
        var columns = ['sessionId','sessionDatetime'];
        var values = [`'${sessionId}'`,`'${sessionTime}'`];

        //Insert the session id and creation time into the database
        SQL.insert(table, columns, values, function(err2, success) {
            if (err2) return callback(err2,undefined);
            //callback the session id so it can be sent to the client
            callback(undefined,sessionId);
        });
    });
}