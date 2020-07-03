// Copyright 2020
// Xor Softworks LLC

$(document).ready(function ()  {
    $(document).keypress(function(event) {
        if(event.charCode == 13 && document.getElementById('username').value.length > 0 && document.getElementById('password').value.length > 0) {
            $('#login').click();
        }
    });


    //Called when user clicks 'Submit' button
    $('#login').click(function(event) { 
        document.getElementById("login").className = "not-ready";
        document.getElementById('passworderror').innerHTML = `<h2 class="white text-center">Hashing and validating credentials...</h2>`

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
                data : DOMPurify.sanitize(message)
            },

            //The response from the server; result is the data sent back from server; i.e. html code
            success: function (result) { 
                if(result == '-1') {
                    document.getElementById('passworderror').innerHTML = `<h2 class="red text-center">That username or password is invalid</h2>`
                    document.getElementById("login").className = "ready";
                }
                else {
                    window.location.replace(result);
                }
            },

            //Handle any errors
            error: function (request, status, error) { 
                serviceError();
            }
        });
    });

    $('input').on('input', function() {
        var c = this.selectionStart,
            r = /[^a-z0-9\@\.\-\!\#\%\(\)]/gi,
            v = $(this).val();
        if(r.test(v)) {
            $(this).val(v.replace(r, ''));
            c--;
        }
        this.setSelectionRange(c, c);
    });
});