// Copyright 2020
// Xor Softworks LLC

//Enables submit button once an option has been selected and changes the css class
function button_click(sender)
{
    var buttons = document.getElementsByName("type");

    for (var i = 0; i < buttons.length; i++){
        buttons[i].className = "";
        buttons[i].id = "";
    }

    sender.className = "selected";
    sender.id = "selected";
}

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function () {

    //Called when user clicks 'Submit' button
    $('button[name="type"]').click(function(event) { 
        
        var checkRadio = document.getElementById('selected'); 

        $.ajax({
            global: false,
            type: 'POST',
            url: '/usertype/data', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                response: checkRadio.value
            },

            //The response from the server
            success: function (result) { 
                window.location.replace(result);
            },

            //Handle any errors
            error: function (request, status, error) { 
                serviceError();
            }
        });
    });

    $('#back').click(function(event) {
        window.location.replace('/welcome');
    })
});