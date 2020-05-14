$(document).ready(function ()  {
    //Called when user clicks 'Submit' button
    $('#login').click(function(event) { 
        init();
        var publicKeyText = document.getElementById('main').getAttribute('data-publickey');

        var publicKey = Uint8Array.from(publicKeyText.split`,`.map(x=>parseInt(x)))

        var data = `${document.getElementById('username').value},${document.getElementById('password').value}`;

        var message = encode(data, publicKey)

        $.ajax({

            global: false,
            type: 'POST',
            url: '/login/auth', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                data : message
            },

            //The response from the server; result is the data sent back from server; i.e. html code
            success: function (result) { 
            },

            //Handle any errors
            error: function (request, status, error) { 
                serviceError();
            }
        });
    });
});