// Copyright 2020 
// Xor Softworks LLC

//"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\VC\Tools\MSVC\14.25.28610\bin\Hostx64\x64\editbin.exe"

// Main library offering may functionalities to ease web development
var express = require('express');

// Package to help mitigate attacks
var helmet = require('helmet'); 

// Package to allow enhanced logging and error handling 
const winston = require('winston'); 
const expressWinston = require('express-winston');
require('winston-daily-rotate-file');



// Package to enable accessing data stored in browser cookies
const cookieParser = require('cookie-parser'); 

// Package to parse AJAX requests from client
const bodyParser = require('body-parser');

// Package to allow clients to connect over http
const http = require('http');

// Package to allow clients to connect over https
const https = require('https');

// Package to allow the server to open files on the local computer
const fs = require('fs');



// Utility file to allow the server to access an SQL database
const SQL = require('./Utils/GeneralSql');

// Utility file to ease in accessing time data
const timeUtils = require('./Utils/TimeUtils');

// Utility file to allow SignIn to send automated emails
const mailer = require('./Utils/Mailer');

// Utility file to enable encryptions between clients and the server
const encryption = require('./Utils/CryptoServer');

// Utility for authentication
const auth = require('./Utils/AuthMan');


//*************************** Create and Configure express Node.JS application ********************************
//Create express Node.JS application
var app = express();

// Include the helmet library's attack prevention strategies
app.use(helmet()); 

// Use the cookieParser library to extract the data from our cookies
app.use(cookieParser());

// Parses data returned to the server in AJAX requests
app.use(bodyParser.urlencoded({ extended: true }));

// Allows the body parser to parse json.
app.use(bodyParser.json()); 

// Make all files in the public folder accessable to clients
// app.use(express.static('../Public')); 
app.use(express.static('C:/signin-app/Public')); //Makes all files in the public folder accessable to clients

// If a client connects over http redirect them to https
app.use(function(req, res, next) { 
    if(!req.secure) {
        return res.redirect(['https://', req.headers.host, req.url].join(''));
    }
    next();
});




// Import the pages of the application 
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
var ServerError = require('./Pages/S-Error');

// Add the imported pages to the express Node.JS application
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
app.use('/error', ServerError);



// If users do not specify what page they want to visit, redirect them to the welcome page
app.get('/',function(req,res) {
    res.redirect('/welcome');
});

var recipient = 'nsccsignin@gmail.com';

// middleware to catch error messages, log them, and pass them on
app.use(function (err,req,res,next) {
    var message = `There was an error with Sign In. Please send the log files to the developers.`;

    mailer.sendEmail(recipient, 'SignInError', message, function(sucess) {
        
        res.status(500).redirect('/error');

        // pass the error 'up the chain'
        next(err);
    });
});


function init() {
    fs.readFile('C:/signin-app/bin/setup.json', function(err,content) {
    //fs.readFile('../bin/setup.json', function(err,content) {
        if (err) return console.log('Error loading setup file:\n' + err);
        var parsed = JSON.parse(content);
        
        // changes the recipient email if the setup file defines an email
        recipient = (parsed.error_email != '') ? parsed.error_email : recipient; 

        // if the number of days in the setup file is set to 0, no files should be deleted
        // var days = parsed.console_output_folder_lifetime_days+'d';
        var days = parsed.console_output_folder_lifetime_days;

        // adds logger for programmer logs
        winston.loggers.add('logger', {
            transports: [
                new winston.transports.Console({
                    level: 'info',
                    format: winston.format.simple()
                }),
                new winston.transports.DailyRotateFile({
                    filename: parsed.console_output_folder + 'consoleOutput-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    level: 'info',
                    maxFiles: days,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            ]
        });

        // brings the logger into this file
        const logger = winston.loggers.get('logger');

        // adds the request logger
        app.use(expressWinston.logger({
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: parsed.console_output_folder + 'req%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxFile: days,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            ]
        }));
        
        // adds the error logger
        app.use(expressWinston.errorLogger({
            transports: [
                new winston.transports.Console(),
                new winston.transports.DailyRotateFile({
                    level: 'error',
                    filename: parsed.console_output_folder + 'error%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxFile: days,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                    
                })
            ]
        }));

        auth.init(parsed.enable_authentication, parsed.authentication_useranme, parsed.authentication_password);

        const options = {
            key: fs.readFileSync(parsed.key_path),
            cert: fs.readFileSync(parsed.cert_path)
        };

        SQL.init(parsed.database_host, parsed.database_user, parsed.database_password, parsed.database_name, function(err,done) {
            encryption.init(function(err,done) {
                https.createServer(options, app).listen(parsed.secure_server_port, function() {
                    http.createServer(app,function(req, res) { // create http to redirect to https
                        res.writeHead(307, { "Location": "https://" + req.headers['host'] + req.url });
                        res.end();
                    }).listen(parsed.insecure_server_port, function() {
                        
                        // console.log(`SignIn listening on port ${parsed.secure_server_port}`);
                        logger.info(`SignIn listening on port ${parsed.secure_server_port}`);
                    });
                });
            });
        });
    });
}

init();

