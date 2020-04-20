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

    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
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
            res.send('/timeout');
            res.end();
        }
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
            var fname = req.body.fname;
            var lname = req.body.lname;
            var email = req.body.email.toLowerCase();
            var nNumber = req.body.nNumber;
            console.log(fname);
            console.log(lname);
            console.log(email);
            console.log(nNumber);
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NSCC Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="new.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
            </div>
        </header>
        <header class="bg-dark-header">
            <button id="back" class="ready">Previous page</button>
        </header>
        <main class="bg-light">

            <div class="button-like">
                <h2 class="label text-center">Enter your first name</h2>
                <input type="text" name="firstname" id="firstname" autocomplete="off" class="text2" maxlength="50">
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter your last name</h2>
                <input type="text" name="lastname" id="lastname" autocomplete="off" class="text2" maxlength="50">
            </div>
            <div class="button-like">
                <h2 class="label text-center">Enter your email</h2>
                <input type="text" name="email" id="email" autocomplete="off" class="text2" maxlength="75">
                <div id='emailerror'></div>
            </div>
            <div class="button-like">
                <h2 class="label text-center">Are you a student at Northwest?</h2>
                <div class="sidenav-open">
                    <button name="student" onclick="button_click(this)" data-choiceId="1">Yes</button>
                    <button name="student" onclick="button_click(this)" data-choiceId="0" id='selected' class="selected">No</button>
                </div>
            </div>
            <div class="button-like" id="nndiv" style="display:none;">
                <h2 class="label text-center">Enter your N-number</h2>
                <input type="text" name="nnumber" id="nnumber" autocomplete="off" class="text2" value='N' maxlength="10">
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

//Adds a new user to the database
function addNewUser(lName,fName,email,nNumber,callback) {
    
    //Check to see if this email already exists
    checkIfEmailExists(email, function(exists,userId) {
        if(exists) {
            return callback(userId)
        }
        else {
            //Get the current time to use as the signup datetime
            var currentTime = time.getTime();

            var table = 'users';
            var columns = ['lname','fname','email','nNumber','signUpDatetime'];
            var values = [`'${lName}'`,`'${fName}'`,`'${email}'`,`'${nNumber}'`,`'${currentTime}'`];

            //Add the new user to the database
            SQL.insert(table,columns,values, function(err,done) {

                //Now we need to get the userid of the newly created user
                var table = 'users';
                var columns = ['userId'];
                var params = ['lName','fName','email'];
                var values = [`'${lName}'`,`'${fName}'`,`'${email}'`];
                
                //Select the userId from the database
                SQL.select(table,columns,params,values,function(err,data) {
                    return callback(data[0][0])
                })
            })
        }
    })

}


//callsback with true or false on whether the email exists, inclues the userId of the email if it exists
function checkIfEmailExists(email, callback) {
    //Get all emails from the database
    var table = 'users';
    var columns = ['userId'];
    var params = ['email'];
    var values = [`'${email}'`];

    //Try to select the email from the database
    SQL.select(table,columns,params,values,function(err,data) {

        //If we have the email return the corresponding userId otherwise return false
        if(data.lenght > 0) {
            return callback(true);
        }
        else {
            return callback(false);
        }
    })
}

function addTempUser(lName,fName,email,nNumber,callback) {
    //Get the current time to use as the signup datetime
    var currentTime = time.getTime();

    var table = 'tempusers';
    var columns = ['lname','fname','email','nNumber','signUpDatetime','existsInUsers'];
    var values = [`'${lName}'`,`'${fName}'`,`'${email}'`,`'${nNumber}'`,`'${currentTime}'`,'0'];

    SQL.insert(table,columns,values, function(err,done) { 
        callback(done);
    });
}

