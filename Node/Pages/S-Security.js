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
                    // update the buffer with no nNumber
                    updateUserBuffer(function(HTML) {
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
            updateUserBuffer(function(HTML) {

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
    getUserBuffer(function(HTML) {
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
            <button id="new-userId-0" class="ready" onclick="new_click(this)">Add new user</button>
        </header>
        
        <main class="bg-light">
            <div id="users">${userHTML}</div>
        </main>
        <input type="text" id="nNumber" placeholder="Input N-number here:">

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

//Get Request for NSCC API integration
// const getNSCC = async () => {
//     try {
//         return await axios.get('http://127.0.0.1:31415/api/signin?NNUM=N00000000&OFFICE=REG')
//     } catch (error) {
//         console.error(error)
//     }
// }


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

// function to update from userbuffer table
function updateUserBuffer(callback) {
    // set up data for selectExtra statement
    var table = 'userbuffer';
    var columns = ['userId','loaded'];
    var params = ['userId','loaded'];
    var operators = ['<','='];
    var values = [`0`,`0`];
    var extraSQL = ``;

    SQL.selectExtra(table,columns,params,operators,values,extraSQL, function(err,res) {

        //List of the users that need to be added to the security terminal
        var needLoaded = []; 

        if(res.length > 0) {
            for(let j = 0; j < res.length; j++) {
                var nNumber = '' + (res[j][0] * -1)
    
                while(nNumber.length < 8) {
                    nNumber = '0' + nNumber;
                }
    
                nNumber = 'N' + nNumber;
                
                needLoaded.push([nNumber,nNumber,'','','']);
    
                columns = ['loaded'];
                colValues = ['1'];
                params = ['userId'];
                parValues = [res[j][0]];
    
                SQL.update(table, columns, colValues, params, parValues, function(err2,res2) {
                    if(j == res.length-1) {
                        updateNormalUserBuffer(callback, needLoaded)
                    }
                })
            }
        }
        else {
            updateNormalUserBuffer(callback, needLoaded)
        }
        
    })
}

function updateNormalUserBuffer(callback,needLoaded) {

    var table = 'userbuffer';
    var columns = ['userbuffer.userId','users.fName','users.lName','userbuffer.loaded'];
    var params = [];
    var operators = [];
    var values = [];
    var extraSQL = `INNER JOIN users on userbuffer.userId = users.userId WHERE userbuffer.loaded = 0`;

    // select userId and name from database
    SQL.selectExtra(table, columns, params, operators, values, extraSQL, function(err, res) {

        

        //If there was a response to the database query
        if(res.length != 0) {
            //For every response to the database query
            for (let i = 0; i < res.length; i++) {
                //If the user has not been loaded
                if (res[i][3] == 0) {

                    //Add them to the list of users that need loaded
                    needLoaded.push(res[i]);

                    //Log that the user has been loaded
                    columns = ['loaded'];
                    colValues = ['1'];
                    params = ['userId'];
                    parValues = [res[i][0]];
    
                    SQL.update(table, columns, colValues, params, parValues, function(err2,res2) {

                        //Check if the user was denied within the last 14 days
                        userWasDenied(needLoaded[needLoaded.length-1][0], function(denied,deniedAgo, deniedDate) {
                            if (denied) {
                                needLoaded[needLoaded.length-1].push(deniedAgo);
                                needLoaded[needLoaded.length-1].push(deniedDate);
                            }

                            if (i == res.length-1) {
                                return callback(genUserBufferInnerHTML(needLoaded));
                            }
                        }); //End userWasDenied
                    }); //End SQL.update
                } //End if loaded 0
                else {
                    if(i == res.length-1) {
                        if (needLoaded.length > 0) {
                            return callback(genUserBufferInnerHTML(needLoaded));
                        }
                        else {
                            return callback('');
                        } 
                    } //End if last loop
                } //End else loaded 0
            } //End for every response
        } //End if res.length != 0
        else {
            if(needLoaded.length > 0) {
                return callback(genUserBufferInnerHTML(needLoaded));
            }
            else {
                return callback('');
            }
        } //End else res.length > 0
    }); //End SQL.selectExtra
}

// function to get all from userbuffer table
function getUserBuffer(callback) {
    // set up data for selectExtra statement
    var table = 'userbuffer';
    var columns = ['userId','loaded'];
    var params = ['userId'];
    var operators = ['<'];
    var values = [`0`];
    var extraSQL = ``;

    SQL.selectExtra(table,columns,params,operators,values,extraSQL, function(err,res) {

        //List of the users that need to be added to the security terminal
        var needLoaded = []; 
        
        if(res.length > 0) {
            for(let j = 0; j < res.length; j++) {
                var nNumber = '' + (res[j][0] * -1)
    
                while(nNumber.length < 8) {
                    nNumber = '0' + nNumber;
                }
    
                nNumber = 'N' + nNumber;
                
                needLoaded.push([nNumber,nNumber,'','','']);
    
                columns = ['loaded'];
                colValues = ['1'];
                params = ['userId'];
                parValues = [res[j][0]];
    
                SQL.update(table, columns, colValues, params, parValues, function(err2,res2) {
                    if(j == res.length-1) {
                        getNormalUserBuffer(callback, needLoaded)
                    }
                })
            }
        }
        else {
            getNormalUserBuffer(callback, needLoaded)
        }
    })
}

function getNormalUserBuffer(callback, needLoaded) {
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



                //Add them to the list of users that need loaded
                needLoaded.push(res[i]);

                if(res[i][3] == 0) {
                    //Log that the user has been loaded
                    columns = ['loaded'];
                    colValues = ['1'];
                    params = ['userId'];
                    parValues = [res[i][0]];

                    SQL.update(table, columns, colValues, params, parValues, function(err2,res2) {

                        //Check if the user was denied within the last 14 days
                        userWasDenied(needLoaded[needLoaded.length-1][0], function(denied,deniedAgo, deniedDate) {
                            if (denied) {
                                needLoaded[needLoaded.length-1].push(deniedAgo);
                                needLoaded[needLoaded.length-1].push(deniedDate);
                            }

                            if (i == res.length-1) {
                                return callback(genUserBufferInnerHTML(needLoaded));
                            }
                        }); //End userWasDenied
                    }); //End SQL.update
                }
                else {
                    //Check if the user was denied within the last 14 days
                    userWasDenied(needLoaded[needLoaded.length-1][0], function(denied,deniedAgo, deniedDate) {
                        if (denied) {
                            needLoaded[needLoaded.length-1].push(deniedAgo);
                            needLoaded[needLoaded.length-1].push(deniedDate);
                        }

                        if (i == res.length-1) {
                            return callback(genUserBufferInnerHTML(needLoaded));
                        }
                    }); //End userWasDenied
                }
            }
        }
        else {
            if(needLoaded.length > 0) {
                return callback(genUserBufferInnerHTML(needLoaded));
            }
            else {
                return callback('');
            }
        } //End else res.length > 0
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
                    <button name="allowed-userId-${data[i][0]}" data-choiceId="1" id="buttonYes-userId-${data[i][0]}" class="selected">Visitor does not have an account. <br> They need to create an account using the QR code.<br> Or click the button above to create it here.</button>
                </div>
                <button id="submit-userId-${data[i][0]}" onclick="deny_button_click(this)" class="ready">Ok</button>
            </div>`;

        // for every returned item
        if (data[i].length == 4) {
            innerHTML += `<div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Visitor identification:</h2>
                    <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
                    <button name="edit-userId-${data[i][0]}" onclick="edit_click(this)" id="edit-userId-${data[i][0]}" class="ready">Edit User Information</button>
                </div>
                    ${allowedHTML}
                </div>`;
        }
        else if (data[i].length == 6){
            innerHTML += `<div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Visitor identification:</h2>
                    <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
                    <button name="edit-userId-${data[i][0]}" onclick="edit_click(this)" id="edit-userId-${data[i][0]}" class="ready">Edit User Information</button>
                </div>
                    ${deniedHTML}
                </div>`;
        }
        else {
            innerHTML += `<div class="admin">
                <div class="button-like">
                    <h2 class="label text-center">Visitor identification:</h2>
                    <input type="text" name="name-userId-${data[i][0]}" id="userId-${data[i][0]}" data-userId="${data[i][0]}" autocomplete="off" class="text2" maxlength="50" disabled="true" value="${data[i][1]} ${data[i][2]}">
                    <button name="new-userId-${data[i][0]}" onclick="new_click(this)" id="new-userId-${data[i][0]}" class="ready">Add User Information</button>
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

    if (userId[0] == 'N') {
        values = [`-${userId.substring(1)}`];
    }

    // delete record with userId
    SQL.delete(table, params, values, function(err,res) {
        return callback(res);
    });
}

// function to remove user from buffer based on nNumber
function removeNNumberFromBuffer(nNumber,callback) {
    var table = 'userbuffer';
    var params = ['userId'];
    var values = [`${parseInt(nNumber.substring(1)) * -1}`];

    // insert user into userbuffer
    SQL.delete(table, params, values, function(err,success) {
        callback(success);
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