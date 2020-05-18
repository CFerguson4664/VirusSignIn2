var express = require('express');

var app = express();

const SQL = require('./Utils/GeneralSql');
const cookieParser = require('cookie-parser'); //Library to allow the use of cookies to track sessions
const bodyParser = require('body-parser'); //Parses AJAX from client
const http = require('http'); //Allows our server to be http

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

http.createServer(app).listen(31415, function() {
    SQL.init(function(done) {
        console.log(`SignIn listening on port ${31415}`);
    });
});