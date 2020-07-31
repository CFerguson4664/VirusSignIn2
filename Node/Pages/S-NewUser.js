// Copyright 2020
// Xor Softworks LLC

//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//Requires the GeneralSQL utility
const SQL = require('../Utils/GeneralSql');

//Requires the TimeUtils utility
const time = require('../Utils/TimeUtils');

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

router.post('/checkNNumber',function(req,res) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var nNumber = req.body.nNumber;

            checkIfNNumberExists(nNumber, function(exists,userId) {
                if (exists) {
                    getButton(userId, 'N-number', function(dead,HTML) {
                        res.send(HTML);
                        
                    });
                }
                else {
                    res.send();
                }
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/timeout');
            res.end();
        }
    });
});

router.post('/checkEmail',function(req,res) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var email = req.body.email.toLowerCase();

            checkIfEmailExists(email, function(exists,userId) {
            
                if (exists) {
                    getButton(userId, 'email', function(dead,HTML) {
                        res.send(HTML);
                    });
                }
                else {
                    res.send();
                }
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/timeout');
            res.end();
        }
    });
});

router.post('/newUser',function(req,res) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var fName = req.body.fname;
            var lName = req.body.lname;
            var email = req.body.address;
            // var nNumber = req.body.nNumber;

            addNewUser(lName, fName, email, '0', function(success,userId) {
                addUserToBuffer(userId, function(success2) {

                    res.send('/thankyou');
                    res.end();
                });
            });
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
            <title>Via Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="new.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="companyLogo.png" alt="Xor Via logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Previous page</button>
        </header>
        <main class="bg-light">
            <div class="button-like">
                <h2 class="label text-center">Enter your first name</h2>
                <input type="text" name="firstname" id="firstname" autocomplete="off" class="text2" maxlength="50">
                <div id="nameExists"></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter your last name</h2>
                <input type="text" name="lastname" id="lastname" autocomplete="off" class="text2" maxlength="50">
                <div id='lnameerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter your address</h2>
                <input type="text" name="addr" id="addr" autocomplete="off" class="text2" maxlength="75">
                <div id='addresserror'></div>
            </div>
        </main>
        <footer class="bg-dark-float-off" id="subFoot">
            <button id="submit-event" class="not-ready">Submit</button>
        </footer>
        <header class="bg-dark">
            <div class="logo">
                <img src="Xor.png" alt="Xor logo">
            </div>
        </header>
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

//Adds a new user to the database. Return true and the userid if user could be added or false if not
function addNewUser(lName,fName,email,nNumber,callback) {

    //Get the current time to use as the signup datetime
    var currentTime = time.getTime();

    var table = 'users';
    var columns = ['lname','fname','email','nNumber','signUpDatetime'];
    var values = [`'${lName}'`,`'${fName}'`,`'${email}'`,`'${nNumber}'`,`'${currentTime}'`];

    //Add the new user to the database
    SQL.insert(table,columns,values, function(err,done) {

        //Now we need to get the userId of the newly created user
        var table = 'users';
        var columns = ['userId'];
        var params = ['lName','fName','email'];
        var values = [`'${lName}'`,`'${fName}'`,`'${email}'`];
        
        //Select the userId from the database
        SQL.select(table,columns,params,values,function(err,data) {

            //Return true because the user could be created and the userId
            return callback(true, data[0][0]);
        });
    });
}

// function to add user to buffer based on userId
function addUserToBuffer(userId,callback) {
    var table = 'userbuffer';
    var columns = ['userId','loaded'];
    var values = [`${userId}`,`0`];

    // insert user into userbuffer
    SQL.insert(table, columns, values, function(err,success) {
        callback(success);
    });
}

function checkIfNNumberExists(nNumber, callback) {
    var table = 'users';
    var columns = ['userId'];
    var params = ['nNumber'];
    var values = [`'${nNumber}'`];

    //Try to select the nNumber from the database
    SQL.select(table,columns,params,values, function(err,data) {

        //If we have the email return the corresponding userId otherwise return false
        if(data.length > 0) {
            return callback(true, data[0][0]);
        }
        else {
            return callback(false, undefined);
        }
    });
}

//callsback with true or false on whether the email exists, inclues the userId of the email if it exists
function checkIfEmailExists(email, callback) {
    var table = 'users';
    var columns = ['userId'];
    var params = ['email'];
    var values = [`'${email}'`];

    //Try to select the email from the database
    SQL.select(table,columns,params,values,function(err,data) {

        //If we have the email return the corresponding userId otherwise return false
        if(data.length > 0) {
            return callback(true, data[0][0]);
        }
        else {
            return callback(false, undefined);
        }
    });
}

//Gets the button to go to returning user page
function getButton(userId,type,callback) {
    var table = 'users';
    var columns = ['fName','lName'];
    var params = ['userId'];
    var values = [`${userId}`]

    //Select the name from the database
    SQL.select(table,columns,params,values,function(err,data) {
        var fName = data[0][0];
        var lName = data[0][1];
        var template = `<br><h2 class="label text-center">Someone has that ${type} already. <br> Are you: </h2>
            <div class="sidenav-open">
            <button name="exists" onclick="exists_button_click(this)" data-UserId="${userId}">${fName} ${lName}</button>
            <button name="exists" onclick="reset_button_click(this,'${type}')" data-UserId="${userId}">This is not me <br>(enter new ${type})</button>
        </div>`

        return callback(true, template);
    });
}