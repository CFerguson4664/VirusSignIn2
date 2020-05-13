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
    callback(Template());
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
            <div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Secuity Username</h2>
                    <input type="text" id="newSecurityUsername" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Security Password</h2>
                    <input type="password" id="newSecurityPassword" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Reenter the new Security Password</h2>
                    <input type="password" id="newSecurityPassword2" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <button name="student" onclick="button_click(this)" data-choiceId="0" id='changeSecurity' class="ready">Change Security Logon</button>
                </div>
            </div>
            <br>
            <br>
            <div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Admin Username</h2>
                    <input type="text" id="newAdminUsername" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Enter the new Admin Password</h2>
                    <input type="password" id="newAdminPassword" autocomplete="off" class="text2" maxlength="50" >
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Reenter the new Admin Password</h2>
                    <input type="password" id="newAdminPassword2" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <button name="student" onclick="button_click(this)" data-choiceId="0" id='changeSecurity' class="ready">Change Admin Logon</button>
                </div>
            </div>


            
        </main>
        

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



