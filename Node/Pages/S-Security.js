//**************************************************** IMPORTS **************************************************

//Reqires the SessionMan Utility
const sessionMan = require('../Utils/SessionMan');

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
                    // update the buffer with no nNumber
                    updateUserBuffer('',function(HTML) {
                        // send updated innerHTML to client
                        res.send(HTML);
                        //End our response to the client
                        res.end();
                    });
                }
                // if the user was not added to buffer (does not exist)
                else {
                    // update the buffer with nNumber
                    updateUserBuffer(nNumber,function(HTML) {

                        // send updated innerHTML to client
                        res.send(HTML);
                        //End our response to the client
                        res.end();
                    });
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
            updateUserBuffer('',function(HTML) {
                // send updated innerHTML to client
                res.send(HTML);
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
                    // update the buffer
                    getUserBuffer(function(HTML) {
                        // send updated innerHTML to client
                        res.send(HTML);
                        //End our response to the client
                        res.end();
                    });
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
    console.log('deny');
    //This cookie is the session id stored on login page
    var cookie = req.cookies.SignInLvl2;

    //Validate the client using the session Id
    sessionMan.sessionIdValid(cookie, 2, function(valid) {
        //If the client is valid redirect them to the appropiate page
        if(valid) {
            // remove user from buffer
            deleteUserFromBuffer(req.body.userId, function(success2) {
                console.log('after delete');
                // update the buffer
                getUserBuffer(function(HTML) {
                    console.log('after get');
                    console.log(req.body.allowed);
                    if (req.body.allowed == 1) {
                        addUserActivity(req.body.userId, req.body.allowed, function(success1) {
                            // send updated innerHTML to client
                            res.send(HTML);
                            //End our response to the client
                            res.end();
                            console.log('add')
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
        <header class="bg-dark" >
            <div class="logo">
                <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
            </div>
        </header>
        <header class="bg-dark-header" id="header">
        </header>
        
        <main class="bg-light">
            <div id="users">${userHTML}</div>
        </main>
        <p>Input N-number here:</p>
        <input type="text" id="nNumber">

        <footer class="bg-dark-float-off" id="subFoot">
            
        </footer>
        <footer class="bg-dark">
            <div id="social-i ">
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

        if (userId != []) {
            // set up data for insert statement
            table = 'userbuffer';
            columns = ['userId'];
            values = [userId];

            // insert user into userbuffer
            SQL.insert(table, columns, values, function(err,success) {
                return callback(success);
            });
        }
        else {
            return callback(false);
        }
    });
}

// function to update from userbuffer table
function updateUserBuffer(nNumber,callback) {
    // set up data for selectExtra statement
    var table = 'userbuffer';
    var columns = ['userbuffer.userId','users.fName','users.lName','userbuffer.loaded'];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = `INNER JOIN users on userbuffer.userId = users.userId WHERE userbuffer.loaded = 0`;

    // select userId and name from database
    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {

        var needLoaded = [];        

        if(res.length != 0) {
            for (let i = 0; i < res.length; i++) {

                if (res[i][3] == 0) {

                    needLoaded.push(res[i]);
                    columns = ['loaded'];
                    colValues = ['1'];
                    params = ['userId'];
                    parValues = [res[i][0]];
    
                    SQL.update(table, columns, colValues, params, parValues, function(err2,res2) {
                        userWasDenied(needLoaded[needLoaded.length-1][0], function(denied,deniedAgo, deniedDate) {
                            if (denied) {
                                needLoaded[needLoaded.length-1].push(deniedAgo);
                                needLoaded[needLoaded.length-1].push(deniedDate);
                            }

                            if (i == res.length-1) {
                                if (nNumber != '') {
                                    // add undefined user to array
                                    needLoaded.push([nNumber,nNumber,'','','']);
                                }
                                else {
                                    
                                }
                                // callback the innerHTML
                                return callback(genUserBufferInnerHTML(needLoaded));
                            }
                        });
                    });
                }
            }
        }
        else {
            if (nNumber != '') {
                // add undefined user to array
                return callback(genUserBufferInnerHTML([[nNumber,nNumber,'','','']]));
            }
            else {
                return callback('');
            }
        }
    });
}


// function to get all from userbuffer table
function getUserBuffer(callback) {
    // set up data for selectExtra statement
    var table = 'userbuffer';
    var columns = ['userbuffer.userId','users.fName','users.lName','userbuffer.loaded'];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = `INNER JOIN users on userbuffer.userId = users.userId`;

    // select userId and name from database
    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {

        //Makes sure res 
        if(res.length != 0) {
            for (let i = 0; i < res.length; i++) {
                userWasDenied(res[i][0], function(denied,deniedAgo,deniedDate) {
                    if (denied) {
                        res[i].push(deniedAgo);
                        res[i].push(deniedDate);
                    }
                    if (i == res.length-1) {
                        // callback the innerHTML
                        return callback(genUserBufferInnerHTML(res));
                    }
                });  
            }
        }
        else {
            return callback('');
        }
    });
}

// function to generate the innerHTML based on result from selectExtra statement
function genUserBufferInnerHTML(data) {
    // data array: [userId,firstName, lastName(, deniedAgo, deniedDate)]

    var innerHTML = '';
    
    for(var i = 0; i < data.length; i++) {
        var allowedHTML = `<div class="button-like">
                <h2 class="label text-center">Visitor allowed entry?</h2>
                <div class="sidenav-open">
                    <button name="allowed-userId-${data[i][0]}" onclick="button_click(this)" data-choiceId="1" id="buttonYes-userId-${data[i][0]}" class="selected">Yes</button>
                    <button name="allowed-userId-${data[i][0]}" onclick="button_click(this)" data-choiceId="0" id="buttonNo-userId-${data[i][0]}" class="">No</button>
                </div>
                <button id="submit-userId-${data[i][0]}" onclick="submit_button_click(this)" class="ready">Submit</button>
            </div>`;
        var deniedHTML = `<div class="button-like">
                <h2 class="label text-center">Visitor allowed entry?</h2>
                <div class="sidenav-open">
                    <h2 name="denied-info-userId-${data[i][0]}" data-choiceId="1" id="buttonYes-userId-${data[i][0]}" class="label-b text-center">Visitor was denied ${data[i][4]} day(s) ago. <br> Date denied: ${data[i][5]}</button>
                </div>
                <div class="sidenav-open">
                    <button name="allowed-userId-${data[i][0]}" onclick="button_click(this)" data-choiceId="1" id="buttonYes-userId-${data[i][0]}" class="selected">Override and allow</button>
                    <button name="allowed-userId-${data[i][0]}" onclick="button_click(this)" data-choiceId="0" id="buttonNo-userId-${data[i][0]}" class="">Dismiss</button>
                </div>
                <button id="submit-userId-${data[i][0]}" onclick="deny_button_click(this)" class="ready">Submit</button>
            </div>`;
        var unknownHTML = `<div class="button-like">
                <h2 class="label text-center">Visitor allowed entry?</h2>
                <div class="sidenav-open">
                    <button name="allowed-userId-${data[i][0]}" data-choiceId="1" id="buttonYes-userId-${data[i][0]}" class="selected">Visitor does not have an account. <br> They need to create an account using the QR code.</button>
                </div>
                <button id="submit-userId-${data[i][0]}" onclick="deny_button_click(this)" class="ready">Ok</button>
            </div>`;
        // for every returned item
        if (data[i].length == 4) {
            innerHTML += `<div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Visitor identification:</h2>
                    <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
                    
                </div>
                    ${allowedHTML}
                </div>`;
        }
        else if (data[i].length == 6){
            innerHTML += `<div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Visitor identification:</h2>
                    <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
                    
                </div>
                    ${deniedHTML}
                </div>`;
        }
        else {
            innerHTML += `<div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Visitor identification:</h2>
                    <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
                    
                </div>
                    ${unknownHTML}
                </div>`;
        }

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
        return callback(res);
    });
}

// function to add user results to useractivity table
function addUserActivity(userId, allowed, callback) {
    console.log('add useractivity');
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
            var daysSinceLastDeny = new Date().getDate() - lastDeniedDate.getDate();
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