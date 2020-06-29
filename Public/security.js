// Copyright 2020
// Xor Softworks LLC

// global variable to keep track of the nNumber input
var previousInput = '';

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
    }

    // set the css for the clicked button
    sender.className = "selected";
}

// function to handle when a submit button is clicked
function submit_button_click(sender) {
    // parse out the userId text from the id
    sender.className = "not-ready";

    var userId = sender.id.substring(sender.id.indexOf('-')+8, sender.id.length);

    // initialize entryAllowed so no else statement is needed
    var entryAllowed = false;

    var buttons = document.getElementsByName('allowed-userId-'+userId)

    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-choiceId') == 1 && buttons[i].className == "selected") {
            // set entryAllowed to true
            entryAllowed = true;
        }
    }
    // if selected button is yes  
    

    // ajax post with the userId and whether or not the user was allowed
    $.ajax({

        global: false,
        type: 'POST',
        url: '/security/submit', //The url to post to on the server
        dataType: 'html',

        //The data to send to the server
        data: {
            // parse the userId number from the userId string
            userId  : userId,
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
            checkForUsers();
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

    // initialize entryAllowed so no else statement is needed
    var entryAllowed = 2;

    var buttons = document.getElementsByName('allowed-'+userId);

    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-choiceId') == 1 && buttons[i].className == "selected") {
            // set entryAllowed to true
            entryAllowed = 1;
        }
    }

    // ajax post with the userId and whether or not the user was allowed
    $.ajax({

        global: false,
        type: 'POST',
        url: '/security/deny', //The url to post to on the server
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
            checkForUsers();
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
                    window.location.replace(result);
                }
                else {
                    if(result != '') {
                        if(document.getElementById('users').innerHTML == `<div class="button-like"><h2 class="label text-center">There are no pending requests.</h2></div>`) {
                            document.getElementById('users').innerHTML = result;
                        }
                        else {
                            document.getElementById('users').innerHTML += result;
                        }
                    }
                    document.getElementById('nNumber').value = '';
                }
                checkForUsers();
            },

            //Handle any errors
            error: function (request, status, error) {
                serviceError();
            }
        });
    } 
}

function checkNNumberInput() {
    var textBox = document.getElementById('nNumber');
    if (textBox.value == previousInput) {
        textBox.value = '';
    }
    previousInput = textBox.value;
}

function checkForUsers() {
    if (document.getElementById('users').innerHTML == '') {
        document.getElementById('users').innerHTML =  `<div class="button-like"><h2 class="label text-center">There are no pending requests.</h2></div>`;
    }
}

function edit_click(sender) {
    // parse out the userId text from the id
    var userId = sender.id.substring(sender.id.indexOf('-')+1, sender.id.length);

    userId = userId.substring(userId.indexOf('-')+1,userId.length)

    window.location.replace("/securitynew?userId=" + userId);
}

function new_click(sender) {
    // parse out the userId text from the id
    var userId = sender.id.substring(sender.id.indexOf('-')+1, sender.id.length);

    userId = userId.substring(userId.indexOf('-')+1,userId.length)

    if(userId != 0) {
        window.location.replace("/securitynew?nNumber=" + userId);
    }
    else {
        window.location.replace("/securitynew");
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

        document.getElementById('identification').value = '';

        $.ajax({

            global: false,
            type: 'POST',
            url: '/security/data', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                id : DOMPurify.sanitize(visitorIdentification),
                allowed : DOMPurify.sanitize(isEntryAllowed)
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
                checkForUsers();
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

    checkNNumberInput();
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
                if(result != '') {
                    if(document.getElementById('users').innerHTML == `<div class="button-like"><h2 class="label text-center">There are no pending requests.</h2></div>`) {
                        document.getElementById('users').innerHTML = result;
                    }
                    else {
                        document.getElementById('users').innerHTML += result;
                    }
                }
                
            }
            checkForUsers();
        },

        //Handle any errors
        error: function (request, status, error) {
            serviceError();
        }
    });
},5000);