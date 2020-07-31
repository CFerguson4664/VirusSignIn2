// Copyright 2020
// Xor Softworks LLC

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

    // helmet makes the page not render html, unless the content type is set
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    //Get the starting form of the webpage
    getPage(function(HTML) {
        //Send the HTML to the client
        res.write(HTML);
        //End our response to the client
        res.end();
    });
});

router.post('/data',function(req,res) {
    //Send the user to the next page
    res.send('/new');
    res.end();
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
            <title>Via Sign In</title>
            <meta name="author" content="Xor Softworks LLC">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="style.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="welcome.js"></script>
        </head>
        <body>
            <header class="bg-dark">
                <div class="logo">
                    <img src="companyLogo.png" alt="Xor Via logo">
                </div>
            </header>
            <main class="bg-light">
                <h2 class="text-center">Welcome!<br> Thank you for coming. <br><br> 
                The next page will ask you to enter your name so that I have a record of who came and an address to assist me in sending out thank yous.<br><br>Thank you!</h2>
            </main>
            <footer class="bg-dark-float-off" id="subFoot">
                    <button id="submit-event" class="ready">Continue</button>
            </footer>
            <header class="bg-dark">
                <div class="logo">
                    <img src="Xor.png" alt="Xor logo">
                </div>
            </header>
        </body>
    </html>
    `;

    return html;
}

//*********************************************** SPECIAL FUNCTIONS *********************************************

