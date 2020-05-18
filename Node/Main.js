var express = require('express');

var app = express();

const SQL = require('./Utils/GeneralSql');
const cookieParser = require('cookie-parser'); //Library to allow the use of cookies to track sessions
const bodyParser = require('body-parser'); //Parses AJAX from client
const https = require('https');
const fs = require('fs');
const encryption = require('./Utils/CryptoServer'); //Requires server encryption

app.use(cookieParser());

app.use(bodyParser.urlencoded({  //   body-parser to
    extended: true               //   parse data
}));                             //

app.use(bodyParser.json()); //Tells the body parser it will be parsing json.
app.use(express.static('../Public')); //Makes all files in the public folder accessable to clients

var Welcome = require('./Pages/S-Welcome');
var UserType = require('./Pages/S-UserType');
var New = require('./Pages/S-NewUser');
var Returning = require('./Pages/S-ReturningUser');
var Timeout = require('./Pages/S-Timeout');
var Admin = require('./Pages/S-Admin');
var Security = require('./Pages/S-Security');
var Login = require('./Pages/S-Login');
var LoginTimeout = require('./Pages/S-LoginTimeout');
var ThankYou = require('./Pages/S-ThankYou');

// Import my test routes into the path '/test'
app.use('/welcome', Welcome);
app.use('/usertype', UserType);
app.use('/new', New);
app.use('/returning', Returning);
app.use('/timeout', Timeout);
app.use('/admin', Admin);
app.use('/security', Security);
app.use('/login', Login);
app.use('/logintimeout', LoginTimeout);
app.use('/thankyou', ThankYou);

function init() {
    fs.readFile('../bin/setup.json', function(err,content) {
        if (err) return console.log('Error loading setup file:\n' + err);
        var parsed = JSON.parse(content);

        const options = {
            key: fs.readFileSync(parsed.key_path),
            cert: fs.readFileSync(parsed.cert_path)
        };

        SQL.init(parsed.database_host, parsed.database_user, parsed.database_password, parsed.database_name, function(done) {
            encryption.init(function(done) {
                https.createServer(options, app).listen(parsed.server_port, function() {
                    console.log(`SignIn listening on port ${parsed.server_port}`);
                });
            });
        });
    });
}

init();