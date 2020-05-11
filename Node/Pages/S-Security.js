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
router.get('/',function(req,res) {
    //Get the starting form of the webpage
    getPage(function(HTML) {
        //Send the HTML to the client
        res.write(HTML);
        //End our response to the client
        res.end();
    });
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    callback(Template(`<div class="button-like">
            <h2 class="label text-center">Visitor identification:</h2>
            <input type="text" name="identification" id="identification" data-userId="0" autocomplete="off" class="text2" maxlength="50" disabled="true">
            
        </div>
        <div class="button-like">
            <h2 class="label text-center">Visitor allowed entry?</h2>
            <div class="sidenav-open">
                <button name="student" onclick="button_click(this)" data-choiceId="1">Yes</button>
                <button name="student" onclick="button_click(this)" data-choiceId="0" id='' class="">No</button>
            </div>
            <button id="submit-event" class="not-ready">Submit</button>
        </div>`));
}

function Template(userHTML) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NSCC Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="security.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
            </div>
        </header>
        <header class="bg-dark-header">
        </header>
        
        <main class="bg-light">
            ${userHTML}
        </main>
        <input type="text" id="nNumber">

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



