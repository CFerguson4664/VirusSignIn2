//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
exports.router = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/', function(req,res) {

    //Headers to try to prevent the page from being cached 
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    //This cookie is the session id stored on welcome page
    var cookie = req.cookie.signInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(vaild) {
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

app.post('/data',function(req,res) {

    //This cookie is the session id stored on welcome page
    var cookie = req.cookie.signInLvl1;

    //Store the data sent by the client
    var data = req.body.response

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(vaild) {
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

