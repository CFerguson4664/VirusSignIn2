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
router.get('/', function(req,res,next) {

    //Headers to try to prevent the page from being cached 
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    // helmet makes the page not render html, unless the content type is set
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(err,valid) {
        if (err) return next(err);
        //If the client is valid prepare the page
        if(valid) {
            //Get the starting form of the webpage
            getPage(function(HTML) {
                //Send the HTML to the client
                res.write(HTML);
                //End our response to the client
                res.end();
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.redirect('/timeout');
            res.end();
        }
    });
});

router.post('/checkNNumber',function(req,res,next) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var nNumber = req.body.nNumber;

            checkIfNNumberExists(nNumber, function(err2,exists,userId) {
                if (err2) return next(err2);
                if (exists) {
                    getButton(userId, 'N-number', function(err3,dead,HTML) {
                        if (err3) return next(err3);
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

router.post('/checkEmail',function(req,res,next) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var email = req.body.email.toLowerCase();

            checkIfEmailExists(email, function(err2,exists,userId) {
                if (err2) return next(err2);
            
                if (exists) {
                    getButton(userId, 'email', function(err3,dead,HTML) {
                        if (err3) return next(err3);
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

router.post('/newUser',function(req,res,next) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var fName = req.body.fname;
            var lName = req.body.lname;
            var email = req.body.email.toLowerCase();
            var nNumber = req.body.nNumber;

            addNewUser(lName, fName, email, nNumber, function(err2,success,userId) {
                if (err2) return next(err2);
                addUserToBuffer(userId, function(err3,success2) {
                    if (err3) return next(err3);

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
            <title>Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="new.js"></script>
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
                <h2 class="label text-center">Enter your email</h2>
                <input type="text" name="email" id="email" autocomplete="off" class="text2" maxlength="75">
                
                <div id='emailerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Do you have an ID Number?</h2>
                <div class="sidenav-open">
                    <button name="student" onclick="button_click(this)" data-choiceId="1" class="unselected">Yes</button>
                    <button name="student" onclick="button_click(this)" data-choiceId="0" id='selected' class="selected">No</button>
                </div>
            </div>
            <div class="button-like" id="nndiv" style="display:none;">
                <h2 class="label text-center">Enter your ID Number</h2>
                <input type="text" name="nnumber" id="nnumber" autocomplete="off" class="text2" value='' maxlength="9">
                <div id='nnerror'></div>
            </div>
        </main>
        <footer class="bg-dark-float-off" id="subFoot">
            <button id="submit-event" class="not-ready">Submit</button>
        </footer>
        <footer class="bg-dark">
            <div id="social-icons">
            </div>
        </footer>
    </html>`;

    return html;
}

//*********************************************** SPECIAL FUNCTIONS *********************************************

//Adds a new user to the database. Return true and the userid if user could be added or false if not
function addNewUser(lName,fName,email,nNumber,callback) {

    //Get the current time to use as the signup datetime
    var currentTime = time.getTime();

    var table = 'users';
    var columns = ['lname','fname','email','nNumber','signUpDatetime'];
    var values = [`'${lName}'`,`'${fName}'`,`'${email}'`,`'${nNumber}'`,`'${currentTime}'`];

    //Add the new user to the database
    SQL.insert(table,columns,values, function(err,done) {
        if (err) return callback(err,undefined,undefined);

        //Now we need to get the userId of the newly created user
        var table = 'users';
        var columns = ['userId'];
        var params = ['lName','fName','email'];
        var values = [`'${lName}'`,`'${fName}'`,`'${email}'`];
        
        //Select the userId from the database
        SQL.select(table,columns,params,values,function(err2,data) {
            if (err2) return callback(err2,undefined,undefined);

            //Return true because the user could be created and the userId
            return callback(undefined,true, data[0][0]);
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
        if (err) return callback(err,undefined);
        callback(undefined,success);
    });
}

function checkIfNNumberExists(nNumber, callback) {
    var table = 'users';
    var columns = ['userId'];
    var params = ['nNumber'];
    var values = [`'${nNumber}'`];

    //Try to select the nNumber from the database
    SQL.select(table,columns,params,values, function(err,data) {
        if (err) return callback(err,undefined,undefined);

        //If we have the email return the corresponding userId otherwise return false
        if(data.length > 0) {
            return callback(undefined,true, data[0][0]);
        }
        else {
            return callback(undefined,false, undefined);
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
        if (err) return callback(err,undefined,undefined);

        //If we have the email return the corresponding userId otherwise return false
        if(data.length > 0) {
            return callback(undefined,true, data[0][0]);
        }
        else {
            return callback(undefined,false, undefined);
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
        if (err) return callback(err,undefined,undefined);

        var fName = data[0][0];
        var lName = data[0][1];
        var template = `<br><h2 class="label text-center">Someone has that ${type} already. <br> Are you: </h2>
            <div class="sidenav-open">
            <button name="exists" onclick="exists_button_click(this)" data-UserId="${userId}">${fName} ${lName}</button>
            <button name="exists" onclick="reset_button_click(this,'${type}')" data-UserId="${userId}">This is not me <br>(enter new ${type})</button>
        </div>`

        return callback(undefined,true, template);
    });
}