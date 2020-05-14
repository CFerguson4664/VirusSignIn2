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

// when the client posts to nNumber
router.post('/nNumber',function(req,res) {
    var nNumber = req.body.nNumber;

    // add the user with the nNumber to the buffer
    addUserToBufferNNumber(nNumber, function(success) {
        // update the buffer
        getUserBuffer(function(HTML) {

            // send updated innerHTML to client
            res.send(HTML);
        });
    });
});

// when the client interval resets (not actual reload)
router.post('/reload', function(req,res) {
    // update the buffer
    getUserBuffer(function(HTML) {
        // send updated innerHTML to client
        res.send(HTML);
    });
});

// when the client posts to submit
router.post('/submit',function(req,res) {
    // add the user data to useractivity
    addUserActivity(req.body.userId, req.body.allowed, function(success1) {
        // remove user from buffer
        deleteUserFromBuffer(req.body.userId, function(success2) {
            // update the buffer
            getUserBuffer(function(HTML) {
                // send updated innerHTML to client
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

// function to add user to buffer based on nNumber
function addUserToBufferNNumber(nNumber,callback) {
    // set up data for select statement
    var table = 'users';
    var columns = ['userId'];
    var params = ['nNumber'];
    var values = [`'${nNumber}'`];

    // select userId with matching nNumber
    SQL.select(table, columns, params, values, function(err,userId) {
        // set up data for insert statement
        table = 'userbuffer';
        columns = ['userId'];
        values = [userId];

        // insert user into userbuffer
        SQL.insert(table, columns, values, function(err,success) {
            callback(success);
        });
    });
}

// function to get all from userbuffer table
function getUserBuffer(callback) {
    // set up data for selectExtra statement
    var table = 'userbuffer';
    var columns = ['userbuffer.userId','users.fName','users.lName'];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = `INNER JOIN users on userbuffer.userId = users.userId`;

    // select userId and name from database
    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {
        // callback the innerHTML
        callback(genUserBufferInnerHTML(res));
    });
}

// function to generate the innerHTML based on result from selectExtra statement
function genUserBufferInnerHTML(data) {
    var innerHTML = '';
    // for every returned item
    for(var i = 0; i < data.length; i++) {
        // append to the innerHTML
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

    // return fully generated innerHTML
    return innerHTML;
}

// function to delete user from userbuffer table
function deleteUserFromBuffer(userId,callback) {
    // set up data for delete statement
    var table = 'userbuffer';
    var params = ['userId'];
    var values = [userId];

    // delete record with userId
    SQL.delete(table, params, values, function(err,res) {
        callback(res);
    });
}

// function to add user results to useractivity table
function addUserActivity(userId, allowed, callback) {
    // set up data for insert statement
    var table = 'useractivity';
    var columns = ['userId', 'admitted', 'userActivityDatetime'];
    var values = [userId,allowed, `'${time.getTime()}'`];

    // insert user activity into database
    SQL.insert(table, columns, values, function(err,success) {
        callback(success);
    });
}