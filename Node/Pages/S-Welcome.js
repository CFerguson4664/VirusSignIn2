function Template()
{
    var html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>NSCC Sign In</title>
            <meta name="author" content="M Vanderpool">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="style.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
            <script src="welcome2.js"></script>
        </head>
        <body>
            <header class="bg-dark">
                <div class="logo">
                    <img src="nscc-logo-white-gold.png" alt="Northwest State Community College logo">
                </div>
            </header>
            <main class="bg-light">
                <h2 class="text-center">Welcome!<br> This page will ask some questions <br> 
                to help ensure the health and safety<br> of the visitors, students, and staff <br> 
                at Northwest State.</h2>
            </main>
            <footer class="bg-dark-float-off" id="subFoot">
                    <button id="submit-event" class="ready">Continue</button>
            </footer>
            <footer class="bg-dark">
                <div id="social-icons">
                </div>
            </footer>
        </body>
    </html>
    `;

    return html;
}

exports.getPage = function(callback) {
    callback(Template());
}