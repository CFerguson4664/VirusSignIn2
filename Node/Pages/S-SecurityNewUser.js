// Copyright 2020
// Xor Softworks LLC

//**************************************************** IMPORTS **************************************************

//Requires the URL utilty
const URL = require('url');

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
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(err,valid) {
        if (err) return next(err);
        //If the client is valid prepare the page
        if(valid) {
            var queryObject = URL.parse(req.url,true).query;
            
            if(queryObject.userId != null) {
                getPagePrefilledUserId(queryObject.userId, function(err2,HTML) {
                    if (err2) return next(err2);
                    //Send the HTML to the client
                    res.write(HTML);
                    //End our response to the client
                    res.end();
                });
            }
            else if(queryObject.nNumber != null) {
                getPagePrefilledNNumber(queryObject.nNumber, function(err3,HTML) {
                    if (err3) return next(err3);
                    //Send the HTML to the client
                    res.write(HTML);
                    //End our response to the client
                    res.end();
                });
            }
            else {
                getPage(function(HTML) {
                    //Send the HTML to the client
                    res.write(HTML);
                    //End our response to the client
                    res.end();
                });
            }
        }
        //Otherwise redirect them to the timeout page
        else {
            res.redirect('/login');
            res.end();
        }
    });
});

router.post('/checkNNumber',function(req,res,next) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var nNumber = req.body.nNumber;
            var activeUserId = req.body.userId;

            checkIfNNumberExists(nNumber, function(err2,exists,userId) {
                if (err2) return next(err2);
                
                var idValid = true;

                if(exists && activeUserId != 0){
                    idValid = activeUserId != userId;
                    if (idValid) {
                        getButtonUpdate(userId, 'N-number', function(err3,dead,HTML) {
                            if (err3) return next(err3);
                            res.send(HTML);
                            res.end();
                        });
                    }
                    else {
                        res.send();
                        res.end();
                    }
                }
                else if (exists){
                    getButtonNew(userId, 'N-number', function(err3,dead,HTML) {
                        if (err3) return next(err3);
                        res.send(HTML);
                        res.end();
                    });
                }
                else {
                    res.send();
                    res.end();
                }
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/login');
            res.end();
        }
    });
});

router.post('/checkEmail',function(req,res,next) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var email = req.body.email.toLowerCase();
            var activeUserId = req.body.userId;

            checkIfEmailExists(email, function(err2,exists,userId) {
                if (err2) return next(err2);
                var idValid = true;

                // if the email and user exists already
                if(exists && activeUserId != 0){
                    idValid = activeUserId != userId;
                    if (idValid) {
                        getButtonUpdate(userId, 'email', function(err3,dead,HTML) {
                            if (err3) return next(err3);
                            res.send(HTML);
                            res.end();
                        });
                    }
                    else {
                        res.send();
                        res.end();
                    }
                }
                else if (exists){
                    getButtonNew(userId, 'email', function(err3,dead,HTML) {
                        if (err3) return next(err3);
                        res.send(HTML);
                        res.end();
                    });
                }
                else {
                    res.send();
                    res.end();
                }         
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/login');
            res.end();
        }
    });
});

router.post('/newUser',function(req,res,next) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var fName = req.body.fname;
            var lName = req.body.lname;
            var email = req.body.email.toLowerCase();
            var nNumber = req.body.nNumber;
            var remove = req.body.remove;
            var dataNNumber = req.body.dataNNumber;

            if(remove == 1) {
                removeNNumberFromBuffer(dataNNumber, function(err2,success) {
                    if (err2) return next(err2);
                    addNewUser(lName, fName, email, nNumber, function(err3,success,userId) {
                        if (err3) return next(err3);
                        addUserToBuffer(userId, function(err4,success2) {
                            if (err4) return next(err4);
        
                            res.send('/security');
                            res.end();
                        });
                    });
                });
            }
            else {
                addNewUser(lName, fName, email, nNumber, function(err5,success,userId) {
                    if (err5) return next(err5);
                    addUserToBuffer(userId, function(err6,success2) {
                        if (err6) return next(err6);
    
                        res.send('/security');
                        res.end();
                    });
                });
            }
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/login');
            res.end();
        }
    });
});

router.post('/updateUser',function(req,res,next) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(err,valid) {
        if (err) return next(err);
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var userId = req.body.userId;
            var fName = req.body.fname;
            var lName = req.body.lname;
            var email = req.body.email.toLowerCase();
            var nNumber = req.body.nNumber;

            updateUser(userId, lName, fName, email, nNumber, function(err2,success,userId) {
                if (err2) return next(err2);
                res.send('/security');
                res.end();
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/login');
            res.end();
        }
    });
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPagePrefilledUserId(userId, callback) {

    var table = 'users';
    var columns = ['fName','lName','email','nNumber'];
    var params = ['userId'];
    var values = [`${userId}`];

    //Try to select the first and last names from the database
    SQL.select(table,columns,params,values, function(err,data) {
        if (err) return callback(err,undefined);

        if(data.length > 0) {
            var fName = data[0][0];
            var lName = data[0][1];
            var email = data[0][2];
            var nNumber = data[0][3];

            //Calls the template function with no names to avoid displaying too much user data
            if(nNumber != 0) {
                callback(undefined,TemplateUpdateNNumber(userId,fName,lName,email,nNumber));
            }
            else {
                callback(undefined,TemplateUpdate(userId,fName,lName,email));
            }
        }
    });
}

function getPagePrefilledNNumber(nNumber, callback) {

    callback(undefined,TemplateNewUserNNumber(nNumber));
}

function getPage(callback) {

    callback(TemplateNewUser());
}

function TemplateUpdateNNumber(userId,fName,lName,email,nNumber) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="Xor Softworks LLC">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="securityupdateuser.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company Logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Back to Security Page</button>
            <button id="reload" class="ready" onclick='reloadPage(this)'>Restore Data</button>
        </header>
        <main class="bg-light" id='main' data-userId='${userId}'>

            <div class="button-like">
                <h2 class="label text-center">Enter the user's first name</h2>
                <input type="text" name="firstname" id="firstname" autocomplete="off" class="text2" maxlength="50" value="${fName}">
                <div id="nameExists"></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's last name</h2>
                <input type="text" name="lastname" id="lastname" autocomplete="off" class="text2" maxlength="50" value=${lName}>
                <div id='lnameerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's email</h2>
                <input type="text" name="email" id="email" autocomplete="off" class="text2" maxlength="75" value=${email} data-initial=${email}>
                
                <div id='emailerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Does the user have an N-number?</h2>
                <div class="sidenav-open">
                    <button name="student" onclick="button_click(this)" data-choiceId="1"  id='selected' class="selected">Yes</button>
                    <button name="student" onclick="button_click(this)" data-choiceId="0" class="unselected">No</button>
                </div>
            </div>
            <div class="button-like" id="nndiv">
                <h2 class="label text-center">Enter the user's N-number</h2>
                <input type="text" name="nnumber" id="nnumber" autocomplete="off" class="text2" value='${nNumber}' maxlength="9" data-initial=${nNumber}>
                <div id='nnerror'></div>
            </div>
        </main>
        <footer class="bg-dark-float-off" id="subFoot">
            <button id="submit-event" class="ready">Submit Update</button>
        </footer>
        <footer class="bg-dark">
            <div id="social-icons">
            </div>
        </footer>
    </html>`;

    return html;
}

function TemplateUpdate(userId, fName,lName,email) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="C Ferguson and E Wannemacher">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="securityupdateuser.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company Logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Back to Security Page</button>
            <button id="reload" class="ready" onclick='reloadPage(this)'>Restore Data</button>
        </header>
        <main class="bg-light" id='main' data-userId='${userId}'>

            <div class="button-like">
                <h2 class="label text-center">Enter the user's first name</h2>
                <input type="text" name="firstname" id="firstname" autocomplete="off" class="text2" maxlength="50" value="${fName}">
                <div id="nameExists"></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's last name</h2>
                <input type="text" name="lastname" id="lastname" autocomplete="off" class="text2" maxlength="50" value="${lName}">
                <div id='lnameerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's email</h2>
                <input type="text" name="email" id="email" autocomplete="off" class="text2" maxlength="75" value="${email}" data-initial="${email}">
                
                <div id='emailerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Does the user have an N-number?</h2>
                <div class="sidenav-open">
                    <button name="student" onclick="button_click(this)" data-choiceId="1" class="unselected">Yes</button>
                    <button name="student" onclick="button_click(this)" data-choiceId="0" id="selected" class="selected">No</button>
                </div>
            </div>
            <div class="button-like" id="nndiv" style="display:none;">
                <h2 class="label text-center">Enter the user's N-number</h2>
                <input type="text" name="nnumber" id="nnumber" autocomplete="off" class="text2" value="" maxlength="9" data-initial="N">
                <div id='nnerror'></div>
            </div>
        </main>
        <footer class="bg-dark-float-off" id="subFoot">
            <button id="submit-event" class="ready">Submit Update</button>
        </footer>
        <footer class="bg-dark">
            <div id="social-icons">
            </div>
        </footer>
    </html>`;

    return html;
}

function TemplateNewUserNNumber(nNumber) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="C Ferguson and E Wannemacher">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Via Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="securitynewuser.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company Logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Back to Security Page</button>
        </header>
        <main class="bg-light" id='main' data-userId='0'>

            <div class="button-like">
                <h2 class="label text-center">Enter the user's first name</h2>
                <input type="text" name="firstname" id="firstname" autocomplete="off" class="text2" maxlength="50">
                <div id="nameExists"></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's last name</h2>
                <input type="text" name="lastname" id="lastname" autocomplete="off" class="text2" maxlength="50">
                <div id='lnameerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's email</h2>
                <input type="text" name="email" id="email" autocomplete="off" class="text2" maxlength="75">
                
                <div id='emailerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Does the user have an N-number?</h2>
                <div class="sidenav-open">
                    <button name="student" onclick="button_click(this)" data-choiceId="1" id='selected' class="selected">Yes</button>
                    <button name="student" onclick="button_click(this)" data-choiceId="0"class="unselected">No</button>
                </div>
            </div>
            <div class="button-like" id="nndiv" data-nNumber="${nNumber}">
                <h2 class="label text-center">Enter the user's N-number</h2>
                <input type="text" name="nnumber" id="nnumber" autocomplete="off" class="text2" maxlength="9" value="${nNumber}">
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

function TemplateNewUser() {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="C Ferguson and E Wannemacher">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Via Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="securitynewuser.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="active.png" alt="Company Logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Back to Security Page</button>
        </header>
        <main class="bg-light" id='main' data-userId='0'>

            <div class="button-like">
                <h2 class="label text-center">Enter the user's first name</h2>
                <input type="text" name="firstname" id="firstname" autocomplete="off" class="text2" maxlength="50">
                <div id="nameExists"></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's last name</h2>
                <input type="text" name="lastname" id="lastname" autocomplete="off" class="text2" maxlength="50">
                <div id='lnameerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter the user's email</h2>
                <input type="text" name="email" id="email" autocomplete="off" class="text2" maxlength="75">
                
                <div id='emailerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Does the user have an N-number?</h2>
                <div class="sidenav-open">
                    <button name="student" onclick="button_click(this)" data-choiceId="1" class="unselected">Yes</button>
                    <button name="student" onclick="button_click(this)" data-choiceId="0" id='selected' class="selected">No</button>
                </div>
            </div>
            <div class="button-like" id="nndiv"  style="display:none;" data-nNumber="0">
                <h2 class="label text-center">Enter the user's ID-Number</h2>
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

//Updates a users information. Return true and the userid if user could be added or false if not
function updateUser(userId,lName,fName,email,nNumber,callback) {

    var table = 'users';
    var columns = ['lName','fName','email','nNumber'];
    var values = [`'${lName}'`,`'${fName}'`,`'${email}'`,`'${nNumber}'`];
    var params = ['userId'];
    var parValues = [`${userId}`];

    //Add the new user to the database
    SQL.update(table,columns,values,params,parValues, function(err,done) {
        if (err) return callback(err,undefined,undefined);

        return callback(undefined,true, userId);
    });
}

// function to remove user from buffer based on nNumber
function removeNNumberFromBuffer(nNumber,callback) {
    var table = 'userbuffer';
    var params = ['userId'];
    var values = [`${parseInt(nNumber.substring(1)) * -1}`];

    // insert user into userbuffer
    SQL.delete(table, params, values, function(err,success) {
        if (err) return callback(err,undefined);
        callback(undefined,success);
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
function getButtonUpdate(userId,type,callback) {
    var table = 'users';
    var columns = ['fName','lName'];
    var params = ['userId'];
    var values = [`${userId}`]

    //Select the name from the database
    SQL.select(table,columns,params,values,function(err,data) {
        if (err) return callback(err,undefined,undefined);

        var fName = data[0][0];
        var lName = data[0][1];
        var template = `<br><h2 class="label text-center">A user with the name: <br><br> ${fName} ${lName} <br><br> has that ${type} already.</h2>
            <div class="sidenav-open">
            <button name="exists" onclick="reset_button_click(this,'${type}')" data-UserId="${userId}">Enter a different ${type}</button>
            <button name="exists" onclick="restore_button_click(this,'${type}')" data-info="${userId}">Restore ${type}</button>
        </div>`

        return callback(undefined,true, template);
    });
}

//Gets the button to go to returning user page
function getButtonNew(userId,type,callback) {
    var table = 'users';
    var columns = ['fName','lName'];
    var params = ['userId'];
    var values = [`${userId}`]

    //Select the name from the database
    SQL.select(table,columns,params,values,function(err,data) {
        if (err) return callback(err,undefined,undefined);

        var fName = data[0][0];
        var lName = data[0][1];
        var template = `<br><h2 class="label text-center">A user with the name: <br><br> ${fName} ${lName} <br><br> has that ${type} already.</h2>
            <div class="sidenav-open">
            <button name="exists" onclick="reset_button_click(this,'${type}')" data-UserId="${userId}">Enter a different ${type}</button>
        </div>`

        return callback(undefined,true, template);
    });
}