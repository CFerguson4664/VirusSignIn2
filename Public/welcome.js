// Copyright 2020
// Xor Softworks LLC

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function () {
    
    $('#submit-event').click(function(event) { 
        
        var checkRadio = document.getElementById('selected'); 
          
        $.ajax({
            global: false,
            type: 'POST',
            url: '/welcome/data', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                ready: 1
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
});