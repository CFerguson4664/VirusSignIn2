const nodemailer = require('nodemailer');
// const log = ('./Log').log;

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
        user: 'nsccsignin@gmail.com',
        pass: '89#RedRockyRoad'
    }
});


exports.sendEmail = function(to,sub,msg,callback) {
    let mailOptions = {
        from: 'nsccsignin@gmail.com',
        to: to,
        subject: sub,
        text: msg
    };

    transporter.sendMail(mailOptions, function(err,info) {
        if (err) console.log(err);
        else console.log('mailed to: ' + mailOptions.to);
        callback(true);
    });
    
};