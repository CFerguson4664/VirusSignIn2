// Copyright 2020 
// Xor Softworks LLC

//"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Tools\MSVC\14.25.28610\bin\Hostx64\x64\editbin.exe"

var express = require('express');
var helmet = require('helmet'); // package to help prevent attacks
var app = express();


const SQL = require('./Utils/GeneralSql');

const cookieParser = require('cookie-parser'); //Library to allow the use of cookies to track sessions

const bodyParser = require('body-parser'); //Parses AJAX from client
const http = require('http');
const https = require('https');
const fs = require('fs');
const encryption = require('./Utils/CryptoServer'); //Requires server encryption

const Console = require('console').Console; // module to write console output to other streams, i.e. file
const timeUtils = require('./Utils/TimeUtils'); // need to format the time in the ouptut file

app.use(helmet()); // use attack prevention strategies

app.use(cookieParser());

app.use(bodyParser.urlencoded({  //   body-parser to
    extended: true               //   parse data
}));                             //

app.use(bodyParser.json()); //Tells the body parser it will be parsing json.


// app.use(express.static('C:/signin-app/Public')); //Makes all files in the public folder accessable to clients
app.use(express.static('../Public')); //Makes all files in the public folder accessable to clients

app.use(function(req, res, next) { // redirect http to https
    if(!req.secure) {
        return res.redirect(['https://', req.headers.host, req.url].join(''));
    }
    next();
});

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
var SecurityNew = require('./Pages/S-SecurityNewUser');

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
app.use('/securitynew', SecurityNew);

app.get('/',function(req,res) {
    res.redirect('/welcome');
});


// is there a way to not use public variables for the logger?
var logger = undefined;

// middleware to catch error messages, log them, and pass them on
app.use(function (err,req,res,next) {
    // data to be printed in log file
    var json_error = {
        datetime : timeUtils.getTime(),
        error_message : err
    };

    console.log('error');

    // log the error data
    logger.error(json_error);

    // pass the error 'up the chain'
    next(err);
});

function init() {
    // fs.readFile('C:/signin-app/bin/setup.json', function(err,content) {
    fs.readFile('../bin/setup.json', function(err,content) {
        if (err) return console.log('Error loading setup file:\n' + err);
        var parsed = JSON.parse(content);

        // set up append file stream for logger
        var consoleOutputFilename = fs.createWriteStream(parsed.console_output_filename, {'flags': 'a'});
        // send console output to the file stream
        logger = new Console({stdout: consoleOutputFilename});

        const options = {
            key: fs.readFileSync(parsed.key_path),
            cert: fs.readFileSync(parsed.cert_path)
        };

        SQL.init(parsed.database_host, parsed.database_user, parsed.database_password, parsed.database_name, function(done) {
            encryption.init(function(done) {
                https.createServer(options, app).listen(parsed.secure_server_port, function() {
                    http.createServer(app,function(req, res) { // create http to redirect to https
                        res.writeHead(307, { "Location": "https://" + req.headers['host'] + req.url });
                        res.end();
                    }).listen(parsed.insecure_server_port, function() {
                        
                        console.log(`SignIn listening on port ${parsed.secure_server_port}`);
                    });
                });
            });
        });
    });
}

init();