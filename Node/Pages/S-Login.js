//**************************************************** IMPORTS **************************************************

//Requires Express Node.js framework
const express = require('express');

//Requires server encryption
const encryption = require('../Utils/CryptoServer')

//Requires passwords
const auth = require('../Utils/AuthMan')

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

    //Get the starting form of the webpage
    getPage(function(HTML) {
        //Send the HTML to the client
        res.write(HTML);
        //End our response to the client
        res.end();
    });
});

router.post('/auth',function(req,res) {

    var encrypted = req.body.data

    encryption.decode(encrypted, function(success,data) {
        console.log(success);
        console.log(`decrypted: ${data}`);
    })

    auth.hash('hello','password')

    res.send('');
    res.end();
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    encryption.init(function(done) {
        encryption.getPublicKey(function(publickey) {
            callback(Template(publickey));
        });
    });
}

function Template(publickey)
{
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>NSCC Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="sodium.js"></script>
            <script src="cryptoclient.js"></script>
            <script src="login.js"></script>
        </head>
        <header class="bg-dark">
            <div class="logo">
                <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
            </div>
        </header>
        <header class="bg-dark-header">
        </header>
        
        <main class="bg-light" id='main' data-publickey='${publickey}'>
            <div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Username</h2>
                    <input type="text" id="username" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <h2 class="label text-center">Password</h2>
                    <input type="password" id="password" autocomplete="off" class="text2" maxlength="50">
                </div>
                <div class="button-like">
                    <button name="login" id='login' class="ready">Login</button>
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

