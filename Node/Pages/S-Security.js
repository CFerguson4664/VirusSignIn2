// Copyright 2020
// Xor Softworks LLC

//**************************************************** IMPORTS **************************************************

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

//Requires the GeneralSQL utility.
const SQL = require("../Utils/GeneralSql");

//Requires Express Node.js framework
const express = require('express');

//Requires the TimeUtils utility
const time = require('../Utils/TimeUtils');
const { json } = require('express');


//const axios = require('axios')

//***************************************************** SETUP ***************************************************

//router to handle moving the get/post requests around
var router = express.Router();

//Export the router so that Main can access it and our GET/POST functions
module.exports = router;

//********************************************* GET / POST Requests *********************************************

//Handles the get request for the starting form of this page
router.get('/',function(req,res) {

    // helmet makes the page not render html, unless the content type is set
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {

            //Get the starting form of the webpage
            getPage(function(HTML) {

                //Send the HTML to the client
                res.write(HTML);
                //End our response to the client
                res.end();
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.redirect('/logintimeout');
            res.end();
        }
    });
});

// when the client posts to nNumber
router.post('/nNumber',function(req,res) {
    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            var nNumber = req.body.nNumber;

            // add the user with the nNumber to the buffer
            addUserToBufferNNumber(nNumber, function(success) {
                // if the user was added
                if (success) {
                    //Send something
                    res.send('done');
                    //End our response to the client
                    res.end();
                }
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/logintimeout');
            res.end();
        }
    });
});

// when the client interval resets (not actual reload)
router.post('/reload', function(req,res) {
    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            // update the buffer
            getAllData(true,function(HTML) {

                // send updated innerHTML to client
                res.send(JSON.stringify(HTML));
                //End our response to the client
                res.end();
            });
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/logintimeout');
            res.end();
        }
    });
});

// when the client posts to submit
router.post('/submit',function(req,res) {
    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {

            // add the user data to useractivity
            addUserActivity(req.body.userId, req.body.allowed, function(success1) {
                // remove user from buffer
                deleteUserFromBuffer(req.body.userId, function(success2) {
                    //End our response to the client
                    res.end();
                });
            });   
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/logintimeout');
            res.end();
        }
    }); 
});

// when the client posts to deny
router.post('/deny',function(req,res) {
    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {

            // remove user from buffer
            deleteUserFromBuffer(req.body.userId, function(success2) {
                // update the buffer
                getUserBuffer(function(HTML) {
                    if (req.body.allowed == 1 || req.body.allowed == 2) {
                        addUserActivity(req.body.userId, req.body.allowed, function(success1) {
                            // send updated innerHTML to client
                            res.send(HTML);
                            //End our response to the client
                            res.end();
                        });
                    }
                    else {
                    
                        // send updated innerHTML to client
                        res.send(HTML);
                        //End our response to the client
                        res.end();
                    }
                    
                });
            });   
        }
        //Otherwise redirect them to the timeout page
        else {
            res.send('/logintimeout');
            res.end();
        }
    }); 
});

//********************************************** DEFAULT FUNCTIONS **********************************************

function getPage(callback) {
    getAllData(false,function(HTML) {

        callback(Template(HTML));
    });
}

function Template(userHTML) {
    var html = `<!DOCTYPE html>
    <html>
        <head>
            <link rel="stylesheet" type="text/css" href="style.css">
            <meta name="author" content="Xor Softworks LLC">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Via Sign In</title>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script type="text/javascript" src="DOMPurify-main/dist/purify.min.js"></script>
            <script src="security.js"></script>
        </head>
        <header class="bg-dark" >
            <div class="logo">
                <img src="companyLogo.png" alt="Xor Via logo">
            </div>
        </header>
        <header class="bg-dark-header" id="header">
        </header>
        
        <main class="bg-light">
            <h1 class='big text-center'>Attendies</h1>
            <div class="admin">
                <div class="button-like">
                    <div id="users">
                        ${userHTML}
                    </div>
                </div>
            </div>
        </main>
        <footer class="bg-dark-float-off" id="subFoot">
        </footer>
        <header class="bg-dark">
            <div class="logo">
                <img src="Xor.png" alt="Xor logo">
            </div>
        </header>
    </html>`;

    return html;
}

//*********************************************** SPECIAL FUNCTIONS *********************************************

function convertNNumberFromDatabase(nNumberIn) {
    var nNumber = '' + (nNumberIn * -1)
    
    while(nNumber.length < 8) {
        nNumber = '0' + nNumber;
    }

    nNumber = 'N' + nNumber;

    return nNumber;
}

function getAllData(asJson, callback) {
    var table = 'userbuffer';
    var columns = ['userbuffer.userId','users.fName','users.lName','userbuffer.bufferId'];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = `LEFT OUTER JOIN users on userbuffer.userId = users.userId`;

    // select userId, name, and bufferId from database
    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {
        //List of the users that need to be added to the security terminal

        //Store the data stubs
        var data = []; 

        if(res.length > 0) {
            //If we got some records from the database
            for(let i = 0; i < res.length; i++) { 
                //Loop throught every record from the database
                if(res[i][0] < 0) { 
                    //If the userId is less than 0 it means that the record 
                    // is an NNumber without an associated account

                    //Convert the nNumber back to the normal format
                    var nNumber = convertNNumberFromDatabase(res[i][0]);

                    //Push the data to the buffer
                    data.push({
                        type:       0,                          //The type of record this is
                        bufferId:   res[i][3],                  //The bufferId of this record 
                        userId:     nNumber,                    //The userId of the user referenced by the record
                        name:       nNumber                     //The name of the user referenced by this record
                    });

                    if(data.length == res.length) {
                        //If this is the last loop, move onto the next step
                        return genHTML(data, asJson, callback); //**************************************** RETURN ***************************************************/
                    }
                }
                else {
                    //If the userId is not less than 0 it mean that the 
                    // record is for a normal user with an associated account

                    //Check to see if this user has been denied in the last 14 days
                    userWasDenied(res[i][0], function(wasDenied, daysSinceDeny, dateOfDeny) {
                        if(wasDenied) {

                            //if the user was denied in the last 14 days

                            //Push the data to the buffer
                            data.push({
                                type:           1,                              //The type of record this is
                                bufferId:       res[i][3],                      //The bufferId of this record 
                                userId:         res[i][0],                      //The userId of the user referenced by the record
                                name:           res[i][1] + ' ' + res[i][2],    //The name of the user referenced by this record
                                daysSinceDeny:  daysSinceDeny,                  //The number of days since the user referenced by this record was denied 
                                dateOfDeny:     dateOfDeny                      //The data fo the last time the user referenced by this record was denied
                            });

                            if(data.length == res.length) {
                                //If this is the last loop, move onto the next step
                                return genHTML(data, asJson, callback); //**************************************** RETURN ***********************************************/
                            }
                        }
                        else {
                            //If the user was not denied in the last 14 days

                            //Push the data to the buffer
                            data.push({
                                type:       2,                              //The type of record this is
                                bufferId:   res[i][3],                      //The bufferId of this record 
                                userId:     res[i][0],                      //The userId of the user referenced by the record
                                name:       res[i][1] + ' ' + res[i][2]     //The name of the user referenced by this record
                            });

                            if(data.length == res.length) {
                                //If this is the last loop, move onto the next step
                                return genHTML(data, asJson, callback); //**************************************** RETURN ***********************************************/
                            }
                        }
                    });
                }
            }
        }
        else {
            //If there is no one in the buffer we can callback no data
            callback('');
        }
    });
}

function genHTML(data, asJson, callback) {
    var finalData = '';

    if(asJson) {
        finalData = [];
    }

    
    
    for(var i = 0; i < data.length; i++) {
        //Get the next record from the data object
        var record = data[i];
        var innerHTML = '';

        // if(record.type == 0) {
        //     //Special HTML for an unknown user
        //     innerHTML = `<div class="button-like">
        //         <h2 class="label text-center">Visitor allowed entry?</h2>
        //         <div class="sidenav-open">
        //             <button name="allowed-userId-${record.userId}" data-choiceId="1" id="buttonYes-userId-${record.userId}" class="selected">Visitor does not have an account. <br> They need to create an account using the QR code.<br> Or click the button above to create it here.</button>
        //         </div>
        //         <button id="submit-userId-${record.userId}" onclick="deny_button_click(this)" class="ready">Ok</button>
        //     </div>`;
        // }
        // else if (record.type == 1) {
        //     //Special HTML for a recently denied user
        //     innerHTML = `<div class="button-like">
        //         <h2 class="label text-center">Visitor allowed entry?</h2>
        //         <div class="sidenav-open">
        //             <h2 name="denied-info-userId-${record.userId}" data-choiceId="1" id="buttonYes-userId-${record.userId}" class="label-b text-center">Visitor was denied ${record.daysSinceDeny} day(s) ago. <br> Date denied: ${record.dateOfDeny}</button>
        //         </div>
        //         <div class="sidenav-open">
        //             <button name="allowed-userId-${record.userId}" onclick="button_click(this)" data-choiceId="1" id="buttonYes-userId-${record.userId}" class="selected">Override and allow</button>
        //             <button name="allowed-userId-${record.userId}" onclick="button_click(this)" data-choiceId="0" id="buttonNo-userId-${record.userId}" class="unselected">Dismiss</button>
        //         </div>
        //         <button id="submit-userId-${record.userId}" onclick="deny_button_click(this)" class="ready">Submit</button>
        //     </div>`;
        // }
        // else if (record.type == 2) {
        //     //Special HTML for a normal user
        //     innerHTML = `<div class="button-like">
        //         <h2 class="label text-center">Visitor allowed entry?</h2>
        //         <div class="sidenav-open">
        //             <button name="allowed-userId-${record.userId}" onclick="button_click(this)" data-choiceId="1" id="buttonYes-userId-${record.userId}" class="selected">Yes</button>
        //             <button name="allowed-userId-${record.userId}" onclick="button_click(this)" data-choiceId="0" id="buttonNo-userId-${record.userId}" class="unselected">No</button>
        //         </div>
        //         <button id="submit-userId-${record.userId}" onclick="submit_button_click(this)" class="ready">Submit</button>
        //     </div>`;
        // }

        //Add the full html for the security prompt
        var html = `<div class="admin">
            <div class="button-like">
            </div>
        </div>`;

        var html = `<h1 id=${record.bufferId} name='prompt' data-userId="${record.userId}" class='mid text-center'>${record.name}</h1>`;

        //asJson determines whether the response of this funcion is the raw HTML or the html separated by bufferId in a json object
        if(asJson) {
            //Store each prompt separately with the bufferId
            finalData.push({
                bufferId: record.bufferId,
                HTML: html
            })
        }
        else {
            //Concatinate all of the html together
            finalData += html;
        }
    }

    console.log(finalData)

    //Callback with either the html or the json object
    callback(finalData);
}


// function to add user to buffer based on nNumber
function addUserToBufferNNumber(nNumber,callback) {
    
    // set up data for select statement
    var table = 'users';
    var columns = ['userId'];
    var params = ['nNumber'];
    var values = [`'${nNumber}'`];

    // select userId with matching nNumber
    SQL.select(table, columns, params, values, function(err,userId) {

        if (userId.length > 0) {
            // set up data for insert statement
            table = 'userbuffer';
            columns = ['userId','loaded'];
            values = [`${userId}`,`0`];

            // insert user into userbuffer
            SQL.insert(table, columns, values, function(err,success) {
                return callback(success);
            });
        }                
        else {
            var table = 'userbuffer';
            var columns = ['userId','loaded'];
            var values = [`${parseInt(nNumber.substring(1)) * -1}`,`0`];

            // insert user into userbuffer
            SQL.insert(table, columns, values, function(err,success) {
                return callback(success);
            });
        }

        return callback(false);
    });
}

// function to delete user from userbuffer table
function deleteUserFromBuffer(userId,callback) {
    // set up data for delete statement
    var table = 'userbuffer';
    var params = ['userId'];
    var values = [userId];

    if (userId[0] == 'N') {
        values = [`-${userId.substring(1)}`];
    }

    // delete record with userId
    SQL.delete(table, params, values, function(err,res) {
        return callback(res);
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
        return callback(success);
    });
}

function userWasDenied(userId,callback) {

    var table = 'useractivity';
    var columns = ['userActivityDatetime'];
    var params = ['userId','admitted'];
    var values = [userId,0];

    SQL.select(table, columns, params, values, function(err,res) {

        if(res.length != 0) {
            res.sort();
            var lastDeniedDate = new Date(res[res.length-1]);

            // To calculate the time difference of two dates 
            var Difference_In_Time = new Date().getTime() - lastDeniedDate.getTime(); 
            
            // To calculate the no. of days between two dates 
            var daysSinceLastDeny = Math.floor(Difference_In_Time / (1000 * 3600 * 24)); 

            if (daysSinceLastDeny < 14) {
                
                return callback(true,daysSinceLastDeny, lastDeniedDate.toLocaleString());
            }
            else {
                return callback(false,undefined,undefined);
            }
        }
        else {
            return callback(false,undefined,undefined);
        }
    });
}