
// function to determine if the text in the nnumber box is the right length
function checkNNumberLength() {
    value = document.getElementById('nNumber').value;
    if (value.length == 9) {
        // document.getElementById('nNumber').value = '';
        return true;
    }
    else {
        return false;
    }
}

// function to handle when a yes/no button is clicked (userId specific)
function button_click(sender) {
    // gets all the buttons in the name group
    var buttons = document.getElementsByName(sender.name);

    // for every button in the name group
    for (var i = 0; i < buttons.length; i++) {
        // clear the css and ids
        buttons[i].className = "";
        buttons[i].id = "";
    }

    // set the css for the clicked button
    sender.className = "selected";

    // grab the userId data from the clicked button name
    var userId = sender.name.substring(sender.name.indexOf('-'), sender.name.length);
    
    // set the css for the specific submit button (show it)
    document.getElementById("submit"+userId).className = "ready";
    
    // set the sender to be selected (for use when the submit button is clicked)
    sender.id = "selected"+userId;
}

// function to handle when a submit button is clicked
function submit_button_click(sender) {
    // parse out the userId text from the id
    var userId = sender.id.substring(sender.id.indexOf('-')+1, sender.id.length);

    // initialize entryAllowed so no else statement is needed
    var entryAllowed = false;

    // if selected button is yes  
    if (document.getElementById('selected-'+userId).getAttribute('data-choiceId') == 1) {
        // set entryAllowed to true
        entryAllowed = true;
    }

    // ajax post with the userId and whether or not the user was allowed
    $.ajax({

        global: false,
        type: 'POST',
        url: '/security/submit', //The url to post to on the server
        dataType: 'html',

        //The data to send to the server
        data: {
            // parse the userId number from the userId string
            userId  : userId.substring(userId.indexOf('-')+1,userId.length),
            allowed : entryAllowed
        },

        //The response from the server; result is the data sent back from server; i.e. html code
        success: function (result) { 
            if (result == '/logintimeout') {
                window.location.replace(result);
            }
            else {
                document.getElementById('users').innerHTML = result;
            }
        },

        //Handle any errors
        error: function (request, status, error) { 
            serviceError();
        }
    });
}

function deny_button_click(sender) {
    // parse out the userId text from the id
    var userId = sender.id.substring(sender.id.indexOf('-')+1, sender.id.length);

    // ajax post with the userId and whether or not the user was allowed
    $.ajax({

        global: false,
        type: 'POST',
        url: '/security/deny', //The url to post to on the server
        dataType: 'html',

        //The data to send to the server
        data: {
            // parse the userId number from the userId string
            userId  : userId.substring(userId.indexOf('-')+1,userId.length)
        },

        //The response from the server; result is the data sent back from server; i.e. html code
        success: function (result) { 
            if (result == '/logintimeout') {
                window.location.replace(result);
            }
            else {
                document.getElementById('users').innerHTML = result;
            }
        },

        //Handle any errors
        error: function (request, status, error) { 
            serviceError();
        }
    });
}

function input_to_textBox() {
    // if the text in the box is long enough
    if (checkNNumberLength()) {
        console.log("validNNumber");

        var n = document.getElementById('nNumber').value;

        // post to server the nnumber and clear the box
        $.ajax({
            global: false,
            type: 'POST',
            url: '/security/nNumber', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                nNumber : n,
            },

            //The response from the server
            success: function (result) { 
                if (result == '/logintimeout') {
                    console.log('timeout');
                    window.location.replace(result);
                }
                else {
                    console.log('replace innerHTML');
                    document.getElementById('users').innerHTML += result;
                    console.log('reset nNumber value');
                    document.getElementById('nNumber').value = '';
                }
            },

            //Handle any errors
            error: function (request, status, error) {
                serviceError();
            }
        });
    } 
}

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function ()  {

    

    // ************************************** DEPRECATED **************************************
    //Called when user clicks 'Submit' button
    $('#submit-event').click(function(event) { 
        
        
        var visitorIdentification = document.getElementById('identification').getAttribute('data-userId');
        var isEntryAllowed = document.getElementById('selected').getAttribute('data-choiceId');

        console.log(visitorIdentification);
        console.log(isEntryAllowed);
        document.getElementById('identification').value = '';

        $.ajax({

            global: false,
            type: 'POST',
            url: '/security/data', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                id : visitorIdentification,
                allowed : isEntryAllowed
            },

            //The response from the server; result is the data sent back from server; i.e. html code
            success: function (result) { 

                if (result == '/logintimeout') {
                    window.location.replace(result);
                }
                else {
                    // window.location.replace(result);
                    document.getElementById('submit').className = 'selected';
                }
            },

            //Handle any errors
            error: function (request, status, error) { 
                document.getElementById('submit').className = 'selected';
                serviceError();
            }
        });
    });

    // $(document).keypress(function(event) {
    //     document.getElementById('nNumber').value += String.fromCharCode(event.charCode);
    //     event.preventDefault();
    // });

    $(document).keydown(function(event) {
        if (event.keyCode == 8) {
            var text = document.getElementById('nNumber').value;
            document.getElementById('nNumber').value = text.substring(0,text.length-1);
        }
        else if (event.key.length == 1){
            document.getElementById('nNumber').value += event.key;
            
        }
        event.preventDefault();
        input_to_textBox();
    });
});

window.onload = setInterval(function() {
    // document.getElementById('nNumber').focus();
    $.ajax({
        global: false,
        type: 'POST',
        url: '/security/reload', //The url to post to on the server
        dataType: 'html',

        //The data to send to the server
        data: {
        },

        //The response from the server
        success: function (result) { 
            if (result == '/logintimeout') {
                window.location.replace(result);
            }
            else {
                document.getElementById('users').innerHTML += result;
            }
        },

        //Handle any errors
        error: function (request, status, error) {
            serviceError();
        }
    });
    console.log("reload");
},10000);