// Copyright 2020
// Xor Softworks LLC

//Hash for password password
//$argon2id$v=19$m=262144,t=3,p=1$KVuso7M/kaMnMboUV9PzMg$G7D7DUW4t5+c5Rwv6KgwwOcU9f3nVdeazJv3AcStLMs

//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//Requires passwords
const auth = require('../Utils/AuthMan');

//Requires server encryption
const encryption = require('../Utils/CryptoServer');

//Requires database Downloads
const dbDownload = require('../Utils/DownloadDatabase');

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
module.exports = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/',function(req,res,next) {

    // helmet makes the page not render html, unless the content type is set
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl3;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 3, function(err, valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            //Get the starting form of the webpage
            getPage(function(err2,HTML) {
                if (err2) return next(err2);
                //Send the HTML to the client
                res.write(HTML);
                //End our response to the client
                res.end();
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.redirect('/logintimeout');
            res.end();
        }
    });
});

router.post('/changesecurity',function(req,res,next) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl3;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 3, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {

            encryption.decode(req.body.data, function(err2,success,decoded) {
                if (err2) return next(err2);
                var split = decoded.split(`,`);

                var username = split[0];
                var password = split[1];

                auth.removeAllAuthForLevel(2, function(err3,success) {
                    if (err3) return next(err3);
                    auth.addAuthForLevel(2,username,password,function(err4,success) {
                        if (err4) return next(err4);
                        if(success) {
                            res.send(true);
                            res.end();
                        }
                    });
                });
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/logintimeout');
            res.end();
        }
    });
});

router.post('/changeadmin',function(req,res,next) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl3;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 3, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {

            encryption.decode(req.body.data, function(err2,success,decoded) {
                if (err2) return next(err2);

                var split = decoded.split(`,`);

                var username = split[0];
                var password = split[1];

                auth.removeAllAuthForLevel(3, function(err3,success) {
                    if (err3) return next(err3);
                    auth.addAuthForLevel(3,username,password,function(err4,success) {
                        if (err4) return next(err4);
                        if(success) {
                            res.send(true);
                            res.end()
                        }
                    });
                });
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/logintimeout');
            res.end();
        }
    });
});

router.get('/download',function(req,res,next) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl3;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 3, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            dbDownload.dumpFormattedData("UserActivities.txt", function(err2,data) {
                if (err2) return next(err2);
                sendFileToUser(res,"UserActivities.txt", function(err3,done) {
                    if (err3) return next(err3);
                    res.end();
                });
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.redirect('/logintimeout');
            res.end();
        }
    });
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    encryption.getPublicKey(function(err,publicKey) {
        if (err) return callback(err,undefined);
        callback(undefined,Template(publicKey));
    });
}

function Template(publicKey) {
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
            <script src="admin.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company Logo">
            </div>
        </header>
        <header class="bg-dark-header">
        </header>
        
        <main class="bg-light" id='main' data-publickey='${publicKey}'>
            <h2 class="text-center">This page will reset the security and<br> 
            admin usernames and passwords.  <br>
            <br>
            The two logons must have different usernames.
            </h2>

            <div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Secuity Username</h2>
                    <input type="text" id="newSecurityUsername" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Security Password</h2>
                    <input type="password" id="newSecurityPassword" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Reenter the new Security Password</h2>
                    <input type="password" id="newSecurityPassword2" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <div id="securityData"></div>
                    <button name="changeSecurity" data-choiceId="0" id='changeSecurity' class="not-ready">Change Security Logon</button>
                </div>
            </div>
            <br>
            <br>
            <div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Admin Username</h2>
                    <input type="text" id="newAdminUsername" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Admin Password</h2>
                    <input type="password" id="newAdminPassword" autocomplete="off" class="text2" maxlength="50" >
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Reenter the new Admin Password</h2>
                    <input type="password" id="newAdminPassword2" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <div id="adminData"></div>
                    <button name="changeAdmin" data-choiceId="0" id='changeAdmin' class="not-ready">Change Admin Logon</button>
                </div>
            </div>
            <br><br>
            <div class="button-like">
                <button id="downloadDatabase" class="ready" onclick="downloadDatabase()">Download database</button>
                <div id="downloadInner"></div>
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

// why isnt this just imported from TimeUtils.js?
function pad(number) {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}

// why isn't this just imported from TimeUtils.js?
Date.prototype.toISONormString = function() {
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        '_' + pad(this.getHours()) +
        '-' + pad(this.getMinutes()) +
        '-' + pad(this.getSeconds());
};

function sendFileToUser(res,filename,callback) {
    res.download('./' + filename,`UserActivity_Report_${new Date().toISONormString()}.json`,function(err) {
        if (err) return callback(err,undefined);
        callback(undefined,true);
    });
    
}