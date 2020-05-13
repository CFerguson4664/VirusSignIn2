/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").className = "sidenav-open"
}

/* Set the width of the side navigation to 0 */
function closeNav() {
    document.getElementById("mySidenav").className = "sidenav-closed"
}

//Called when the user clicks a name button
function predictButton(value) {
    document.getElementById('nameText').value = value.innerHTML;
    document.getElementById('nameText').name = value.id;
    document.getElementById("submit-event").className = "ready";
    document.getElementById("subFoot").className = "bg-dark-float-on";
    closeNav();
}

//Called when the backspace button is pressed. Handles seaching when backspace key is pressed because
//pressing backspace doesn't call the keypress event the other handler is looking for
$(document).ready(function () {

    //Called when text box is selected. Checks to see if there is a ',' in the box.
    //Comma would come from clicking a name button. To ensure search works properly all text after and including the ','
    //is removed. Then gets a list of names from the server and populates the choices
    $('#nameText').click(function(event) {
        var name = $(this).val();
        if(name.includes(',')) {
            document.getElementById('nameText').value = name.substring(0,name.indexOf(','));
        }

        var data = document.getElementById('nameText').value;
        document.getElementById("submit-event").className = "not-ready";
        document.getElementById("subFoot").className = "bg-dark-float-off";

        if(data.length >= 3){
            $.ajax({
                global: false,
                type: 'POST',
                url: '/returning/names',
                dataType: 'html',
                data: {
                    name: data
                },
                success: function (result) {
                    if (result == '/timeout') {
                        window.location.replace(result);
                    }
                    else 
                    {
                        document.getElementById('mySidenav').innerHTML = result;
                    }
                },
                error: function (request, status, error) {
                    serviceError();
                }
            });
        }
        else {
            document.getElementById('mySidenav').innerHTML = `<h2 class="label-b">Three characters must be entered before predictions will be provided</h2>`;
        }
    });

    //Called when a new character is typed in the name textbox, gets list of names from server and populates the choices
    $('#nameText').on('input',function(event) {

        document.getElementById("submit-event").className = "not-ready";
        document.getElementById("subFoot").className = "bg-dark-float-off";
        
        if(document.getElementById('nameText').value.length >= 3) {
            $.ajax({
                global: false,
                type: 'POST',
                url: '/returning/names',
                dataType: 'html',
                data: {
                    name: document.getElementById('nameText').value
                },
                success: function (result) {
                    if (result == '/timeout') {
                        window.location.replace(result);
                    }
                    else 
                    {
                       document.getElementById('mySidenav').innerHTML = result;
                    }
                },
                error: function (request, status, error) {
                    serviceError();
                }
            });
        }
        else {
            document.getElementById('mySidenav').innerHTML = `<h2 class="label-b">Three characters must be entered before predictions will be provided</h2>`;
        }
        
    });

    //Called when the user clicks the continue button, submits the data to the server
    $('#submit-event').click(function(event) { 

        $.ajax({
            global: false,
            type: 'POST',
            url: '/returning/data', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                userId : document.getElementById('nameText').name
            },

            //The response from the server
            success: function (result) { 
                window.location.replace(result)
            },

            //Handle any errors
            error: function (request, status, error) { 
                serviceError();
            }
        });
    });

    $('#back').click(function(event) {
        window.location.replace('/usertype');
    })
});