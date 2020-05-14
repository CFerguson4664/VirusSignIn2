
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
            document.getElementById('users').innerHTML = result;
        },

        //Handle any errors
        error: function (request, status, error) { 
            serviceError();
        }
    });
}

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function ()  {

    $('#nNumber').on('input',function(event) {
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
                    document.getElementById('users').innerHTML = result;
                    document.getElementById('nNumber').value = '';
                },

                //Handle any errors
                error: function (request, status, error) {
                    serviceError();
                }
            });
        } 
    });

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
                // window.location.replace(result);
                document.getElementById('submit').className = 'selected';
            },

            //Handle any errors
            error: function (request, status, error) { 
                document.getElementById('submit').className = 'selected';
                serviceError();
            }
        });
    });
});

// window.onload = setInterval()