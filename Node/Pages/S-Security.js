//**************************************************** IMPORTS **************************************************

//Requires the GeneralSQL utility.
const SQL = require("../Utils/GeneralSql");

//Requires Express Node.js framework
const express = require('express');

//Requires the TimeUtils utility
const time = require('../Utils/TimeUtils');

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

router.post('/nNumber',function(req,res) {
    var nNumber = req.body.nNumber;
    addUserToBufferNNumber(nNumber, function(success) {
        getUserBuffer(function(HTML) {

            res.send(HTML);
        });
    });
    
        
});

router.post('/submit',function(req,res) {
    console.log("severSubmit");
    addUserActivity(req.body.userId, req.body.allowed, function(success1) {
        deleteUserFromBuffer(req.body.userId, function(success2) {
            getUserBuffer(function(HTML) {
                res.send(HTML);
            });
        });
    }); 
        
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    getUserBuffer(function(HTML) {
        callback(Template(HTML));
    });
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
            <div id="users">
                ${userHTML}
            </div>
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

function addUserToBufferNNumber(nNumber,callback) {
    var table = 'users';
    var columns = ['userId'];
    var params = ['nNumber'];
    var values = [`'${nNumber}'`];

    SQL.select(table, columns, params, values, function(err,userId) {
        table = 'userbuffer';
        columns = ['userId'];
        values = [userId];

        SQL.insert(table, columns, values, function(err,success) {
            callback(success);
        });
    });

}

function getUserBuffer(callback) {
    var table = 'userbuffer';
    var columns = ['userbuffer.userId','users.fName','users.lName'];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = `INNER JOIN users on userbuffer.userId = users.userId`;

    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {
        console.log(`Err message: ${err}`);
        console.log(`Result: ${res}`);
        callback(genUserBufferInnerHTML(res));
    });
}

function genUserBufferInnerHTML(data) {
    var innerHTML = '';
    for(var i = 0; i < data.length; i++) {
        innerHTML += `<div class="button-like">
        <h2 class="label text-center">Visitor identification:</h2>
        <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
        
    </div>
    <div class="button-like">
        <h2 class="label text-center">Visitor allowed entry?</h2>
        <div class="sidenav-open">
            <button name="allowed-userId-${data[i][0]}" onclick="button_click(this)" data-choiceId="1" id="buttonYes-userId-${data[i][0]}">Yes</button>
            <button name="allowed-userId-${data[i][0]}" onclick="button_click(this)" data-choiceId="0" id="buttonNo-userId-${data[i][0]}" class="">No</button>
        </div>
        <button id="submit-userId-${data[i][0]}" onclick="submit_button_click(this)" class="not-ready">Submit</button>
    </div>`;
    }

    return innerHTML;
}

function deleteUserFromBuffer(userId,callback) {
    var table = 'userbuffer';
    var params = ['userId'];
    var values = [userId];
    console.log('delete');
    
    SQL.delete(table, params, values, function(err,res) {
        callback(res);
    });
}

function addUserActivity(userId, allowed, callback) {
    var table = 'useractivity';
    var columns = ['userId', 'admitted', 'userActivityDatetime'];
    var values = [userId,allowed, `'${time.getTime()}'`];

    SQL.insert(table, columns, values, function(err,success) {
        callback(success);
    });
}