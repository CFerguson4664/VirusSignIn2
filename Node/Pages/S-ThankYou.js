//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');


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

    getPage(function(HTML) {
        //Send the HTML to the client
        res.write(HTML);
        //End our response to the client
        res.end();
    });
});

router.post('/data',function(req,res) {

    res.send('/welcome');
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
            <meta name="author" content="C Ferguson and E Wannemacher">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="style.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="timeout.js"></script>
        </head>
        <body>
            <header class="bg-dark">
                <div class="logo">
                    <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
                </div>
            </header>
            <main class="bg-light">
                <h2 class="text-center">Thank You!<br><br> Click the button to restart</h2>
            </main>
            <footer class="bg-dark-float-off" id="subFoot">
                    <button id="submit-event" class="ready">Restart</button>
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