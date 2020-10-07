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

const winston = require('winston'); // module for enhanced logging
    const expressWinston = require('express-winston');
    require('winston-daily-rotate-file');
const timeUtils = require('./Utils/TimeUtils'); // need to format the time in the ouptut file

const mailer = require('./Utils/Mailer');
var recipient = 'nsccsignin@gmail.com';

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
var ServerError = require('./Pages/S-Error');

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
app.use('/error', ServerError);

app.get('/',function(req,res) {
    res.redirect('/welcome');
});

// middleware to catch error messages, log them, and pass them on
app.use(function (err,req,res,next) {

    mailer.sendEmail(recipient, 'SignInError', 'This is a drill.', function(sucess) {
        
        res.status(500).redirect('/error');

        // pass the error 'up the chain'
        next(err);
    });
});


function init() {
    // fs.readFile('C:/signin-app/bin/setup.json', function(err,content) {
    fs.readFile('../bin/setup.json', function(err,content) {
        if (err) return console.log('Error loading setup file:\n' + err);
        var parsed = JSON.parse(content);
        
        // changes the recipient email if the setup file defines an email
        recipient = (parsed.error_email != '') ? parsed.error_email : recipient; 

        // if the number of days in the setup file is set to 0, no files should be deleted
        var days = parsed.console_output_folder_lifetime_days+'d'
        if (days = '0d') {
            days = null;
        }

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
                new winston.transports.Console(),
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