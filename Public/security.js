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
        buttons[i].className = "unselected";
    }

    // set the css for the clicked button
    sender.className = "selected";
}

function toggleNav(navId) {
    var nav = document.getElementById(navId);

    if(nav.className == "dropdown-open") {
        nav.className = "dropdown-closed";
    }
    else {
        nav.className = "dropdown-open";
    }
}

function office_click(sender,userId) {
    // set the office that was clicked to be selected css
    var dropdowns = document.getElementsByName('office-userId-'+userId);
    for (var i = 0; i < dropdowns.length; i++) {
        dropdowns[i].className = "unselected  dropdown-option";
    }
    sender.className = "selected dropdown-option";

    var toggle = document.getElementById('toggle-userId-' + userId);
    toggle.innerHTML = sender.innerHTML;
    toggle.setAttribute('data-choiceId', sender.getAttribute('data-choiceId'));

    var nav = document.getElementById('nav-userId-' + userId);
    nav.className = "dropdown-closed";
}

// function to handle when a submit button is clicked
function submit_button_click(sender) {
    // parse out the userId text from the id
    sender.className = "not-ready";

    var userId = sender.id.substring(sender.id.indexOf('-')+8, sender.id.length);

    // initialize entryAllowed so no else statement is needed
    var entryAllowed = false;

    var buttons = document.getElementsByName('allowed-userId-'+userId);

    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-choiceId') == 1 && buttons[i].className == "selected") {
            // set entryAllowed to 1
            entryAllowed = 1;
        }
    }
    // if selected button is yes  

    // NSCC Addition
    var officeChoice = document.getElementById('toggle-userId-'+userId).getAttribute('data-choiceid');
    console.log(`office choice: ${officeChoice}`);
    

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
            allowed : entryAllowed,
            // NSCC Addition
            office  : officeChoice
        },

        //The response from the server; result is the data sent back from server; i.e. html code
        success: function (result) { 
            if (result == '/logintimeout') {
                window.location.replace(result);
            }
            else {
                refresh();
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

    // initialize entryAllowed so no else statement is needed
    var entryAllowed = 2;

    var buttons = document.getElementsByName('allowed-'+userId);
    
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].getAttribute('data-choiceId') == 1 && buttons[i].className == "selected") {
            // set entryAllowed to true
            entryAllowed = 1;
        }
    }

    // NSCC Addition
    console.log(`userid: ${userId}`);
    var officeChoice = document.getElementById('toggle-userId-'+userId).getAttribute('data-choiceid');
    console.log(`office choice: ${officeChoice}`);
    
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
            allowed : entryAllowed,
            // NSCC Addition
            office  : officeChoice
        },

        //The response from the server; result is the data sent back from server; i.e. html code
        success: function (result) { 
            if (result == '/logintimeout') {
                window.location.replace(result);
            }
            else {
                refresh();
            }
        },

        //Handle any errors
        error: function (request, status, error) { 
            console.log('Error');
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
                    refresh();
                }
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
                    refresh();
                }
            },

            //Handle any errors
            error: function (request, status, error) { 
                document.getElementById('submit').className = 'selected';
                serviceError();
            }
        });
    });

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

    $('input').on('input', function() {
        var c = this.selectionStart,
            r = /[^a-z0-9@.-]/gi,
            v = $(this).val();
        if(r.test(v)) {
            $(this).val(v.replace(r, ''));
            c--;
        }
        this.setSelectionRange(c, c);
    });
});

window.onload = setInterval(function() {

    checkNNumberInput();
    refresh();
    
},5000);

function refresh2() {
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
                        document.getElementById('users').innerHTML = "";
                    }

                    var test = JSON.parse(result);

                    var prompts = document.getElementsByName('prompt');
                    var ids = [];
                    

                    for (var i = 0; i < prompts.length; i++) {
                        var found = false;

                        for (var j = 0; j < test.length; j++) {
                            if(prompts[i].id == test[j].bufferId) {
                                ids.push(prompts[i].id);
                                found = true;
                            }
                        }

                        if(!found) {
                            prompts[i].parentNode.removeChild(prompts[i]);
                        }
                    }

                    prompts = document.getElementsByName('prompt');

                    for (var k = 0; k < test.length; k++) {
                        var found = false;

                        for (var l = 0; l < prompts.length; l++) {
                            if(test[k].bufferId == prompts[l].id) {

                                found = true;
                            }
                        }
                        
                        if(!found) {
                            document.getElementById('users').innerHTML += test[k].HTML;
                        }
                    }
                }
                else {
                    prompts = document.getElementsByName('prompt');

                    for (var i = 0; i < prompts.length; i++) {
                        prompts[i].parentNode.removeChild(prompts[i]);
                    }
                }
            }
        },

        //Handle any errors
        error: function (request, status, error) {
            serviceError();
        }
    });
}

function refresh() {
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

                //Get a list of all of the prompts currently being displayed
                var prompts = document.getElementsByName('prompt');

                //Erase the 'No pending users display'
                if(prompts.length == 0) {
                    //If we are currently displaying nothing
                    if(result != '""') {
                        //and we got sent something, clear the html
                        document.getElementById('users').innerHTML = '';
                    }
                }


                //Create a list of the currently displayed ids
                var currentIds = [];
                for(var i = 0; i < prompts.length; i++) {
                    currentIds.push(parseInt(prompts[i].id))
                }

                //Create a list of the sent ids
                var sentIds = [];
                var sent = [];
                if(result != '""') {
                    sent = JSON.parse(result);
                    for(var j = 0; j < sent.length; j++) {
                        sentIds.push(parseInt(sent[j].bufferId));
                    }
                }

                var offset = 0;
                //Loop through all of the current ids
                for(var k = 0; k < currentIds.length; k++) {
                    //If this id should no longer be displayed
                    if(!sentIds.includes(currentIds[k])) {

                        // remove the id's html
                        prompts[k-offset].outerHTML = '';

                        // increment the offset variable since the array of DOM objects will shift by 1
                        offset++;
                    }
                }

                //Loop through all of the sent ids
                for(var l = 0; l < sentIds.length; l++) {
                    //If this sent id is not currently being displayed
                    if(!currentIds.includes(sentIds[l])) {
                        //Append its html so it is displayed
                        document.getElementById('users').innerHTML += sent[l].HTML;
                    }
                }


                //Get a list of all of the prompts currently being displayed
                var prompts2 = document.getElementsByName('prompt');

                //Display that there are no pending requests if there was nothing to display
                if(prompts2.length == 0) {
                    document.getElementById('users').innerHTML = `<div class="button-like"><h2 class="label text-center">There are no pending requests.</h2></div>`;
                }
            }
        },

        //Handle any errors
        error: function (request, status, error) {
            serviceError();
        }
    });
}