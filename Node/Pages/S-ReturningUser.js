//**************************************************** IMPORTS **************************************************

//Requires the URL utilty
const URL = require('url');

//Requires the GeneralSQL utility.
const SQL = require("../Utils/GeneralSql");

//Requires Express Node.js framework
const express = require('express');

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
module.exports = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/',function(req,res) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var queryObject = URL.parse(req.url,true).query;
            
            if(queryObject.userId != null) {
                //Get the starting form of the webpage
                getPagePrefilled(queryObject.userId, function(HTML) {
                    //Send the HTML to the client
                    res.write(HTML);
                    //End our response to the client
                    res.end();
                });
            }
            else {
                //Get the starting form of the webpage
                getPage(function(HTML) {
                    //Send the HTML to the client
                    res.write(HTML);
                    //End our response to the client
                    res.end();
                });
            }
        }
        //Otherwise redirect them to the timeout page
        else {
            res.redirect('/timeout');
            res.end();
        }
    });
});

router.post('/names',function(req,res) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var search = req.body.name;
            
            getNames(search, function(HTML) {
                //Send the HTML to the client
                res.send(HTML);
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

router.post('/submit',function(req,res) {
    //This cookie is the session id stored on welcome page
    var cookie = req.cookies.SignInLvl1;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 1, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            addUserToBuffer(req.body.userId, function(success) {
                res.send('/thankyou');
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

//********************************************** DEFAULT FUNCTIONS **********************************************

//High level function to get the starting state of this webpage.
function getPage(callback) {
    //Calls the template function with no names to avoid displaying too much user data
    callback(Template(`<h2 class="label-b">There are no names that match that search</h2>`));
}

function getPagePrefilled(userId, callback) {

    var table = 'users';
    var columns = ['fName','lName'];
    var params = ['userId'];
    var values = [`${userId}`];

    //Try to select the first and last names from the database
    SQL.select(table,columns,params,values, function(err,data) {
        var fName = data[0][0];
        var lName = data[0][1];

        //Calls the template function with no names to avoid displaying too much user data
        callback(TemplatePrefilled(fName, lName, userId, `<h2 class="label-b">There are no names that match that search</h2>`));
    });
}

//Template function to handle the generation of the HTML for this webpage
function Template(nameHTML) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="returning.js"></script>
            <title>NSCC Sign In</title>
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
    
            <h2 class="text-center">Welcome Back!</h2>
            
            <div class="button-like">
                <input type="text" name="firstname" id="nameText" autocomplete="off" onclick="openNav()" class="text2" placeholder="Enter your last name" maxlength="105">
                <div id="mySidenav" class="sidenav-closed">
                    ${nameHTML}
                </div>
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

//Template function to handle the generation of the HTML for this webpage with a name pre-selected
function TemplatePrefilled(fName, lName, userId, nameHTML) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="returning.js"></script>
            <title>NSCC Sign In</title>
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
    
            <h2 class="text-center">Welcome Back!</h2>
            
            <div class="button-like">
                <input type="text" name="${userId}" id="nameText" autocomplete="off" onclick="openNav()" class="text2" placeholder="Enter your last name" maxlength="105" value="${lName}, ${fName}">
                <div id="mySidenav" class="sidenav-closed">
                    ${nameHTML}
                </div>
            </div>
        </main>
        <footer class="bg-dark-float-on" id="subFoot">
                <button id="submit-event" class="ready">Submit</button>
        </footer>
        <footer class="bg-dark">
            <div id="social-icons">
            </div>
        </footer>
    </html>`;

    return html;
}

//*********************************************** SPECIAL FUNCTIONS *********************************************

//Function to handle getting the names from the database that match the search string
//Calls back with the HTML to generate the names matching the search keyword.
function getNames(search, callback)
{
    //If the search term is something other than an empty string query the database.
    if(search != '') {
        var table = 'users';
        var columns = ['lName','fName','userId'];
        var params = ['lName'];
        var operators = ['LIKE'];
        var values = [`'${search}%'`];
        var extraSQL = '';
        var useLike = true;
        

        //Selects lName, fName, and userId from users where lName starts with the search term with a
        //  limit of 20 records.
        SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err,names) {
            console.log(err);
            console.log(names);
            //After getting the names uses them to generate the HTML to display them and 
            //  calls back with the HTML.
            callback(genNameHTML(names))
        })
    }
    //Otherwise return no names to avoid displaying too much user data
    else {
        //Tries to generate HTML with no names and therefore fails and returns that no names
        //  match the search.
        callback(genNameHTML([]))
    }
}

//Function to covnvert the list of names from getNames() into the HTML
//  that needs to be inserted into the template
//Only generates the HTML for 10 of the names that were in theory retreived from the
//  database in an attempt to ensure that a consistent amount of names is displayed
//  regardless of if there are duplicates that are not displayed.
function genNameHTML(names) {
    var nameHTML = '';

    //List used to keep track of names that have already been displayed so that we do
    //  not display duplicates
    var displayedNames = []

    //Keeps track of if all of the displayed names had the same last name. If so then it will
    // continue to display names past the limit of 10 to try to make sure the user's name is
    // offered as an option to select
    var allSameLastName = true;

    //If names were returned generate the necessary HTML
    if(names.length > 0) {
        //Add User Prompt
        nameHTML += `<h2 class="label-b">Select your name</h2>`
        
        //Iterate through every name that was retreived or until we display 10 names.
        //The excetption to this is if all of the displayed names had the same last name
        //  as explained more above at the declaration fof allSameLastName.
        for(var i = 0; (i < names.length && displayedNames.length < 10) || (allSameLastName && i < names.length); i++) {
            //Flag to store whether or not the name is a duplicate
            var duplicate = false;

            //Check the next name against all of the names that have already been displayed to
            // determine if it is a duplicate
            for(var j = 0; j < displayedNames.length; j++) {
                //Compare the first and last names to determine if there is a match
                if(names[i][0] == displayedNames[j][0] && names[i][1] == displayedNames[j][1]) {
                    //If there is a match the set the duplicate flag
                    duplicate = true
                }
            }

            //If the name is not a duplicate add it to displayed names.
            if(!duplicate){
                //Store current name in displayed names
                displayedNames.push(names[i]);

                //Generate the necessary HTML. Displayes names in 'Last, First' format and uses the userId
                // as the HTML object id.
                nameHTML += `<button onclick="predictButton(this)" id="${names[i][2]}" class="name">${names[i][0]}, ${names[i][1]}</button>`;
            }
        }
    }
    //If no names were returned, add HTML to inform the user that no names matched their search
    else {
        nameHTML += `<h2 class="label-b">There are no names that match that search</h2>`;
    }

    //Call back with the generated HTML
    return nameHTML;
}

// function to add user to buffer based on userId
function addUserToBuffer(userId,callback) {
    var table = 'userbuffer';
    var columns = ['userId'];
    var values = [userId];

    // insert user into userbuffer
    SQL.insert(table, columns, values, function(err,success) {
        callback(success);
    });
}