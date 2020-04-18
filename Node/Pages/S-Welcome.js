//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const session = require('../Utils/SessionMan');

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
exports.router = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/',function(req,res) {
    //Get a session id so that we can track this user's progress through the application
    session.getNewSessionId(1, function(sessionId) {
        //Get the starting form of the webpage
        getPage(function(HTML) {
            //Send the session Id to the client
            res.cookie('SignIn', sessionId, { httpOnly: true });
            //Send the HTML to the client
            res.write(HTML);
            //End our response to the client
            res.end();
        });
    });
});

//********************************************** DEFAULT FUNCTIONS **********************************************

exports.getPage = function(callback) {
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