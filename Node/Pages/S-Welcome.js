//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//Requries the TimeUtils utilty
const time = require('../Utils/TimeUtils');

//Requires the GeneralSQL utility
const SQL = require('../Utils/GeneralSql');

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

    //Create a new session for the new client
    createSession(function(sessionId) {
        //Get the starting form of the webpage
        getPage(function(HTML) {
            //Send the session Id to the client
            res.cookie('SignInLvl1', sessionId, { httpOnly: true });
            //Send the HTML to the client
            res.write(HTML);
            //End our response to the client
            res.end();
        });
    });
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    callback(Template());
}

function Template()
{
    var html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>NSCC Sign In</title>
            <meta name="author" content="M Vanderpool">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="style.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="welcome2.js"></script>
        </head>
        <body>
            <header class="bg-dark">
                <div class="logo">
                    <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
                </div>
            </header>
            <main class="bg-light">
                <h2 class="text-center">Welcome!<br> This page will ask some questions <br> 
                to help ensure the health and safety<br> of the visitors, students, and staff <br> 
                at Northwest State.</h2>
            </main>
            <footer class="bg-dark-float-off" id="subFoot">
                    <button id="submit-event" class="ready">Continue</button>
            </footer>
            <footer class="bg-dark">
                <div id="social-icons">
                </div>
            </footer>
        </body>
    </html>
    `;

    return html;
}

//*********************************************** SPECIAL FUNCTIONS *********************************************

function createSession() {
    //Get the current time to use as the session's creation time
    var sessionTime = time.getTime();

    //Get a new session id to use for the session
    sessionMan.getNewSessionId(1, function(sessionId) {

        var table = 'sessionData';
        var columns = ['sessionId','sessionDatetime'];
        var values = [`${sessionId}`,`${sessionTime}`];

        //Insert the session id and creation time into the database
        SQL.insert(table, columns, values, function(err, success) {
            
            //callback the session id so it can be sent to the client
            callback(sessionId);
        });
    });
}