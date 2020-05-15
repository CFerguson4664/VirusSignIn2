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
                console.log('after addUserToBufferNNumber');
                // if the user was added
                if (success) {
                    console.log("add success");
                    // update the buffer with no nNumber
                    updateUserBuffer('',function(HTML) {
                        console.log('after updateUserBuffer');
                        // send updated innerHTML to client
                        res.send(HTML);
                        console.log("HTML sent");
                        //End our response to the client
                        res.end();
                    });
                }
                // if the user was not added to buffer (does not exist)
                else {
                    console.log("add fail");
                    // update the buffer with nNumber
                    updateUserBuffer(nNumber,function(HTML) {
                        console.log('after updateUserBuffer');

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
                    // send updated innerHTML to client
                    res.send(HTML);
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
    
    console.log('insode addUserToBufferNNumber');
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
                callback(success);
            });
        }
        else {
            callback(false);
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
    var extraSQL = `INNER JOIN users on userbuffer.userId = users.userId`;

    // select userId and name from database
    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {
        // console.log('err: ' + err);
        var needLoaded = [];
        // console.log(`res len: ${res.length}`);
        // console.log('res:');
        // console.log(res);
        // if (!res.length) {
        //     console.log('res.length = 0');
        //     if (nNumber != '') {
        //         console.log('push nNumber to needLoaded');
        //         // add undefined user to array
        //         needLoaded.push[nNumber,nNumber,'',''];
                
        //         // callback the innerHTML
        //         callback(genUserBufferInnerHTML(needLoaded));
        //     }
        // }
        for (let i = 0; i < res.length; i++) {
            if (res[i][3] == 0) {
                needLoaded.push(res[i]);
                columns = ['loaded'];
                colValues = ['1'];
                params = ['userId'];
                parValues = [res[i][0]];

                SQL.update(table, columns, colValues, params, parValues, function(err2,res2) {
                    console.log('after table update');
                    userWasDenied(needLoaded[needLoaded.length-1], function(denied,deniedAgo, deniedDate) {
                        console.log("user was denied: " + denied);
                        if (denied) {
                        //     console.log('needLoaded:');
                        //     console.log(needLoaded);
                        //     console.log('needLoaded at '+(needLoaded.length-1));
                        //     console.log(needLoaded[needLoaded.length-1]);
                            needLoaded[needLoaded.length-1].push(deniedAgo);
                            needLoaded[needLoaded.length-1].push(deniedDate);
                        }
                        
                    });
                });
            }
            if (i == res.length-1) {
                console.log(nNumber);
                console.log(nNumber != '');
                if (nNumber != '') {
                    // add undefined user to array
                    needLoaded.push([nNumber,nNumber,'','','']);
                    console.log(needLoaded);
                }
                else {
                    
                }
                console.log('generate innerHTML');
                console.log('final needLoaded:');
                console.log(needLoaded);
                // callback the innerHTML
                callback(genUserBufferInnerHTML(needLoaded));
            }
            
            console.log(needLoaded);
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
        for (let i = 0; i < res.length; i++) {
            userWasDenied(res[i][0], function(denied,deniedAgo,deniedDate) {
                if (denied) {
                    res[i].push(deniedAgo);
                    res[i].push(deniedDate);
                }
                console.log(res);
                console.log(i);
                console.log(res[i]);
                if (i == res.length-1) {
                    // callback the innerHTML
                    callback(genUserBufferInnerHTML(res));
                }
            });  
        }
    });
}

// function to generate the innerHTML based on result from selectExtra statement
function genUserBufferInnerHTML(data) {
    // data array: [userId,firstName, lastName(, deniedAgo, deniedDate)]
    console.log('inhtml')
    console.log(data);

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
                    <button name="allowed-userId-${data[i][0]}" data-choiceId="1" id="buttonYes-userId-${data[i][0]}" class="selected">Visitor was denied ${data[i][4]} day(s) ago. <br> Date denied: ${data[i][5]}</button>
                </div>
                <button id="submit-userId-${data[i][0]}" onclick="deny_button_click(this)" class="ready">Ok</button>
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

function userWasDenied(userId,callback) {
    console.log(`userWasDenied: userId: ${userId}`);

    var table = 'useractivity';
    var columns = ['userActivityDatetime'];
    var params = ['userId','admitted'];
    var values = [userId,0];

    SQL.select(table, columns, params, values, function(err,res) {
        res.sort();
        var lastDeniedDate = new Date(res[res.length-1]);
        var daysSinceLastDeny = new Date().getDate() - lastDeniedDate.getDate();
        console.log(lastDeniedDate);
        console.log(daysSinceLastDeny);
        // console.log(`date: ${date}`);
        if (daysSinceLastDeny < 14) {
            
            // console.log('true');
            return callback(true,daysSinceLastDeny, lastDeniedDate.toLocaleString());
        }
        else {
            // console.log('false');
            return callback(false,undefined,undefined);
        }
    });
}