function checkAdmin() {
    var password1 = document.getElementById('newAdminPassword').value;
    var password2 = document.getElementById('newAdminPassword2').value;

    if(password1 == password2) {
        document.getElementById('changeAdmin').className = 'ready';
        document.getElementById('adminData').innerHTML = ``;
    }
    else {
        document.getElementById('changeAdmin').className = 'not-ready';
        document.getElementById('adminData').innerHTML = `<h2 class="red text-center">The two passwords do not match</h2>`;
    }
}

function checkSecurity() {
    var password1 = document.getElementById('newSecurityPassword').value;
    var password2 = document.getElementById('newSecurityPassword2').value;

    if(password1 == password2) {
        document.getElementById('changeSecurity').className = 'ready';
        document.getElementById('securityData').innerHTML = ``;
    }
    else {
        document.getElementById('changeSecurity').className = 'not-ready';
        document.getElementById('securityData').innerHTML = `<h2 class="red text-center">The two passwords do not match</h2>`;
    }
}

//Wait to execute until AJAX is ready
$(document).ready(function ()  {

    $('#newSecurityPassword').on('input',function(event) {
        
        checkSecurity();
    });

    $('#newSecurityPassword2').on('input',function(event) {
        checkSecurity();
    });

    $('#newAdminPassword').on('input',function(event) {
        checkAdmin();
    });

    $('#newAdminPassword2').on('input',function(event) {
        checkAdmin();
    });

    //Called when user clicks 'Change Admin' button
    $('#changeAdmin').click(function(event) { 
        document.getElementById('changeAdmin').className = 'not-ready';
        document.getElementById('adminData').innerHTML = `<h2 class="white text-center">Changing credentials...</h2>`;

        init();
        
        var publicKeyText = document.getElementById('main').getAttribute('data-publickey');

        var publicKey = Uint8Array.from(publicKeyText.split`,`.map(x=>parseInt(x)))

        var data = `${document.getElementById('newAdminUsername').value},${document.getElementById('newAdminPassword').value}`;

        var message = encode(data, publicKey)
          
        $.ajax({
            global: false,
            type: 'POST',
            url: '/admin/changeadmin', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                data : message
            },

            //The response from the server
            success: function (result) {
                if (result == '/logintimeout') {
                    window.location.replace(result);
                }
                else {
                    document.getElementById('adminData').innerHTML = `<h2 class="white text-center">Credentials changed successfully.</h2>`;
                }
            },

            //Handle any errors
            error: function (request, status, error) { 
                serviceError();
                document.getElementById('securityData').innerHTML = `<h2 class="red text-center">Error: Unable to change credentials.</h2>`;
            }
        });
    });

    //Called when user clicks 'Change Security' button
    $('#changeSecurity').click(function(event) {  
        document.getElementById('changeSecurity').className = 'not-ready';
        document.getElementById('securityData').innerHTML = `<h2 class="white text-center">Changing credentials...</h2>`;

        init();

        var publicKeyText = document.getElementById('main').getAttribute('data-publickey');

        var publicKey = Uint8Array.from(publicKeyText.split`,`.map(x=>parseInt(x)))

        var data = `${document.getElementById('newSecurityUsername').value},${document.getElementById('newSecurityPassword').value}`;

        var message = encode(data, publicKey)

        $.ajax({
            global: false,
            type: 'POST',
            url: '/admin/changesecurity', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                data : message
            },

            //The response from the server
            success: function (result) {
                if (result == '/logintimeout') {
                    window.location.replace(result);
                }
                else {
                    document.getElementById('securityData').innerHTML = `<h2 class="white text-center">Credentials changed successfully.</h2>`;
                }
            },

            //Handle any errors
            error: function (request, status, error) { 
                document.getElementById('securityData').innerHTML = `<h2 class="red text-center">Error: Unable to change credentials.</h2>`;
                serviceError();
            }
        });
    });
});