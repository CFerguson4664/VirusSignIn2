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
var Securtiy = require('./Pages/S-Security');
var Login = require('./Pages/S-Login');

// Import my test routes into the path '/test'
app.use('/welcome', Welcome);
app.use('/usertype', UserType);
app.use('/new', New);
app.use('/returning', Returning);
app.use('/timeout', Timeout);
app.use('/admin', Admin);
app.use('/security', Securtiy);
app.use('/login', Login);

http.createServer(app).listen(8080, function() {
    SQL.init(function(done) {
        console.log(`SignIn listening on port ${8080}`);
    });
});