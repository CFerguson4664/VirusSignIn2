function checkEmail(value) {
    //Taken from emailregex.com
    var regEx = new RegExp('^.+@.+\\..+$');

    return regEx.test(value);
}

function checkStudent() {
    var checkRadio = document.getElementById('selected').getAttribute('data-choiceId');

    if(checkRadio == '1') {
        value = document.getElementById('nnumber').value;
        var regEx = new RegExp('^[N,n][0-9]{8}$');

        return regEx.test(value);
    }
    else
    {
        return true;
    }
}

function checkall(email) {
    // I need comments!
    var good = (document.getElementById('firstname').value != '') && (document.getElementById('lastname').value != '') ;
    good = good && checkEmail(email);
    good = good && checkStudent();
    
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
    var buttons = document.getElementsByName("student");

    for (var i = 0; i < buttons.length; i++)
    {
        buttons[i].className = "";
        buttons[i].id = "";

        if(buttons[i] == sender){
            if(sender.getAttribute("data-choiceId") == '1') {
                document.getElementById('nndiv').style = '';
            }
            else
            {
                document.getElementById('nndiv').style = 'display:none;';
            }

            sender.className = "selected";
        }
    }

    sender.id = "selected";
    checkall(document.getElementById('email').value)
}

//AJAX Functions

//Wait to execute until AJAX is ready
$(document).ready(function ()  {
    $('#email').on('input',function(event) {

        if(!checkEmail($(this).val()))
        {
            document.getElementById('emailerror').innerHTML = `<h2 class="red text-center">This email is invalid</h2>`;
        }
        else
        {
            document.getElementById('emailerror').innerHTML = '';
        }
        checkall($('#email').val());
    });

    $('#nnumber').on('input',function(event) {
        if($('#nnumber').val() == '') {
            document.getElementById('nnumber').value = 'N'
        }
        if(!checkStudent())
        {
            document.getElementById('nnerror').innerHTML = `<h2 class="red text-center">This N-number is invalid</h2>`;
        }
        else
        {
            document.getElementById('nnerror').innerHTML = '';
        }
        checkall($('#email').val());
    });

    $('#firstname').on('input',function(event) {
        checkall($('#email').val());
    });

    $('#lastname').on('input',function(event) {
        checkall($('#email').val());
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
            url: '/new/data', //The url to post to on the server
            dataType: 'html',

            //The data to send to the server
            data: { 
                fname : document.getElementById('firstname').value,
                lname : document.getElementById('lastname').value,
                email : document.getElementById('email').value,
                nNumber : nNumberVal
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