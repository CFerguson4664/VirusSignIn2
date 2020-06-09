// global variables kind of smelly, but easiest way to keep track of whether
// email or nnumber have been checked with the server
// this was done to save from pinging the server an ungodly number of unnecessary times
var EmailNotDuplicate = true;
var NNumberNotDuplicate = true;

//Checks all values to see if they are valid
function checkAll() {
    //Make sure the first name isnt blank
    var good = document.getElementById('firstname').value != '';

    //Make sure the last name is atleast 3 characters long
    good = good && document.getElementById('lastname').value.length >= 3; //Needs to be changed with min length of returning search

    //Make sure the email passes its regex
    good = good && checkEmail(email);

    //Make sure the email is not a duplicate
    good = good && EmailNotDuplicate; 

    //Make sure the NNumber passes its regex
    good = good && checkNNumber();

    //Make sure the nNumber is not a duplicate
    good = good && NNumberNotDuplicate; 
    
    //If everything passes display the submit button
    if(good) {
        document.getElementById("submit-event").className = "ready";
        // document.getElementById("subFoot").className = "bg-dark-float-on";
    }
    //Otherwise, hide it
    else {
        document.getElementById("submit-event").className = "not-ready";
        document.getElementById("subFoot").className = "bg-dark-float-off";
    }
}

//Checks the NNumber to see if it is valid
function checkNNumber() {
    
    var checkRadio = document.getElementById('selected').getAttribute('data-choiceId');

    // determine if user has nNumber (yes button selected)
    if(checkRadio == '1') {
        // get user entered nnumber
        nnumber = document.getElementById('nnumber').value;

        // set up regex to test if nnumber is valid
        var regEx = new RegExp('^[N,n][0-9]{8}$');

        // test nNumber and return result
        return regEx.test(nnumber);
    }
    else
    {
        return true;
    }
}

//Checks the Email to see if it is valid
function checkEmail() {
    var regEx = new RegExp('^.+@.+\\..+$');
    var value = $('#email').val();
    return regEx.test(value);
}

//Controls the nnumber y/N buttons
function button_click(sender)
{
    // gets all buttons 
    var buttons = document.getElementsByName("student");

    // for every button
    for (var i = 0; i < buttons.length; i++)
    {
        // reset the css formatting and change id (essentially resets buttons)
        buttons[i].className = "";
        buttons[i].id = "";

        // if this is the button that was clicked
        if(buttons[i] == sender){
            // if the yes button was clicked
            if(sender.getAttribute("data-choiceId") == '1') {
                // show the nnumber prompt
                document.getElementById('nndiv').style = '';
            }
            // if the no button was clicked
            else
            {
                // hide the nnumber prompt
                document.getElementById('nndiv').style = 'display:none;';
            }

            // graphically select button (change css class) ** this does not have to be here, it can go after the for loop
            sender.className = "selected";
        }
    }

    // select button for the program to see
    sender.id = "selected";

    // check if all inputs are valid
    checkAll()
}

// if the user clicks the button because they had a duplicate email or nnumber
function exists_button_click(sender) {
    // get the user id stored in the button
    var userId = sender.getAttribute("data-UserId");
    // prepare a url to send the user (will go to the returning page with their name already filled in)
    var url = '/returning?userId=' + userId;
    // send the user to the url
    window.location.replace(url);
}

function reset_button_click(sender,type) {
    if (type == 'email') {
        document.getElementById('email').value = '';
        document.getElementById('email').focus();
        document.getElementById('emailerror').innerHTML = '';
    }
    else {
        document.getElementById('nnumber').value = '';
        document.getElementById('nnumber').focus();
        document.getElementById('nnerror').innerHTML = '';
    }
}

function disable_submit() {
    document.getElementById('subFoot').className = 'bg-dark-float-off';
    document.getElementById('submit-event').className = 'not-ready';
    
}

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function ()  {

    $('#email').on('input',function(event) {

        // if the user entered email is invalid (dosen't look like an email)
        if(!checkEmail())
        {
            // tell them in red text
            document.getElementById('emailerror').innerHTML = `<h2 class="red text-center">This email is invalid</h2>`;
            checkAll();
        }
        // if the user entered an email that is valid (lookd like an email)
        else
        {
            $.ajax({
                global: false,
                type: 'POST',
                url: '/securitynew/checkEmail', //The url to post to on the server
                dataType: 'html',
    
                //The data to send to the server
                data: { 
                    email : document.getElementById('email').value,
                },
    
                //The response from the server
                success: function (result) {
                    if (result == '/timeout') {
                        window.location.replace(result);
                    }
                    else if(result != '') {
                        document.getElementById('emailerror').innerHTML = result;
                        EmailNotDuplicate = false;
                        checkAll();
                    }
                    else {
                        document.getElementById('emailerror').innerHTML = '';
                        EmailNotDuplicate = true;
                        checkAll();
                    }
                },
    
                //Handle any errors
                error: function (request, status, error) { 
                    serviceError();
                }
            });
        }
    });

    $('#nnumber').on('input',function(event) {
        if($('#nnumber').val() == '') {
            document.getElementById('nnumber').value = 'N'
        }
        if(!checkNNumber())
        {
            document.getElementById('nnerror').innerHTML = `<h2 class="red text-center">This N-number is invalid</h2>`;
            checkAll()
        }
        else
        {
            $.ajax({
                global: false,
                type: 'POST',
                url: '/securitynew/checkNNumber', //The url to post to on the server
                dataType: 'html',
    
                //The data to send to the server
                data: { 
                    nNumber : document.getElementById('nnumber').value
                },
    
                //The response from the server
                success: function (result) {
                    if (result == '/timeout') {
                        window.location.replace(result);
                    }
                    else if(result != '') {
                        document.getElementById('nnerror').innerHTML = result;
                        NNumberNotDuplicate = false;
                        checkAll();
                    }
                    else {
                        document.getElementById('nnerror').innerHTML = '';
                        NNumberNotDuplicate = true;
                        checkAll();
                    }
                },
    
                //Handle any errors
                error: function (request, status, error) { 
                    serviceError();
                }
            });
        }
    });

    $('#firstname').on('input',function(event) {
        checkAll();
    });

    $('#lastname').on('input',function(event) {
        checkAll();
        if($('#lastname').val().length < 3) {
            document.getElementById('lnameerror').innerHTML = `<h2 class="red text-center">Last name must be at least 3 characters</h2>`;
        }
        else {
            document.getElementById('lnameerror').innerHTML = '';
        }
    });

    //Called when user clicks 'New User' button
    $('#submit-event').click(function(event) { 
        
        var studentBox = document.getElementById('selected').getAttribute('data-choiceId');

        var nNumberVal = 0;
        if(studentBox == 1) {
            nNumberVal = document.getElementById('nnumber').value;
        }
          
        $.ajax({
            global: false,
            type: 'POST',
            url: '/securitynew/updateUser', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                userId :document.getElementById('main').getAttribute('data-userId'),
                fname : document.getElementById('firstname').value,
                lname : document.getElementById('lastname').value,
                email : document.getElementById('email').value,
                nNumber : nNumberVal
            },

            //The response from the server
            success: function (result) {
                disable_submit();
                window.location.replace(result);
            },

            //Handle any errors
            error: function (request, status, error) { 
                serviceError();
            }
        });
    });

    $('#back').click(function(event) {
        window.location.replace('/security');
    })
});