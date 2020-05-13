function isIdentificationTypeNNumber(identification) {
    var regEx = new RegExp('[0-9]');
    return regEx.test(identification);
}

function checkEmail(value) {
    //Taken from emailregex.com
    var regEx = new RegExp('^.+@.+\\..+$');

    return regEx.test(value);
}

// uses simple regex to determine whether entered nnumber is valid
// probably not needed
function checkStudent(name) {
    // var checkRadio = document.getElementById('selected').getAttribute('data-choiceId');

    value = document.getElementById('identification').value;
    var regEx = new RegExp('^[N,n][0-9]{8}$');

    return regEx.test(value);
}

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

function checkall(name) {
    // I need comments!
    var good = (document.getElementById('identification').value != '');
    // good = good && checkEmail(email);
    // good = good && checkStudent();
    
    if(good) {
        document.getElementById("submit-event").className = "ready";
        document.getElementById("subFoot").className = "bg-dark-float-on";
    }
    else {
        document.getElementById("submit-event").className = "not-ready";
        document.getElementById("subFoot").className = "bg-dark-float-off";
    }
}



function button_click(sender)
{
    var buttons = document.getElementsByName(sender.name);

    for (var i = 0; i < buttons.length; i++)
    {
        buttons[i].className = "";
        buttons[i].id = "";

        if(buttons[i] == sender){

            sender.className = "selected";
        }
    }

    sender.id = "selected";
    checkall(sender.name);
}

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function ()  {
    
    // here for record keeping
    // $('#lastname').on('input',function(event) {
    //     checkall($('#email').val());
    // });

    $('#nNumber').on('input',function(event) {
        if (checkNNumberLength()) {
            var n = document.getElementById('nNumber').value;
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
                    // window.location.replace(result);
                    // console.log(document.getElementById('nNumber').value);
                    document.getElementById('users').innerHTML = result;
                    document.getElementById('nNumber').value = '';
                    // console.log(result);
                },

                //Handle any errors
                error: function (request, status, error) {
                    serviceError();
                }
            });
        } 
    });

    //Called when user clicks 'Submit' button
    $('#submit-event').click(function(event) { 
        
        
        var visitorIdentification = document.getElementById('identification').getAttribute('data-userId');
        var isEntryAllowed = document.getElementById('selected').getAttribute('data-choiceId');

        // var typeOfIdentification = 'name';
        // if (isIdentificationTypeNNumber(visitorIdentification)) {
        //     typeOfIdentification = 'nnumber';
        // }



        console.log(visitorIdentification);
        console.log(isEntryAllowed);
        document.getElementById('identification').value = '';

        $.ajax({

            global: false,
            type: 'POST',
            url: '/new/data', //The url to post to on the server
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