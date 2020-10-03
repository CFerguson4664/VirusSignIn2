// Copyright 2020
// Xor Softworks LLC

const sql = require('./GeneralSql');
const fs = require('fs');

exports.dumpFormattedData = function(filename, callback) {
    getUsers(function(err,users) {
        if (err) return callback(err,undefined);

        getUserActivity(function(err2,userActivity) {
            if (err2) return callback(err2,undefined);

            var data = JSON.stringify(matchData(users,userActivity), null, '\t');

            fs.writeFile(filename, data, function(err3) {
                if (err3) return callback(err3,undefined);
                
                callback(undefined,data);
            });

        });
    });
}

function matchData(users,userActivity) {
    var data = [];
    for (let i = 0; i < users.length; i++) {
        data.push({
            userId: users[i][0],
            userName: `${users[i][2]} ${users[i][1]}`,
            userEmail: users[i][3],
            userNNumber: users[i][4],
            
            userActivity: []
        });
    }
    for (let j = 0; j < userActivity.length; j++) {
        for (let k = 0; k < data.length; k++) {
            if (data[k]['userId'] == userActivity[j][1]) {
                data[k]["userActivity"].push({
                    admitted:userActivity[j][2],
                    datetime:userActivity[j][3]
                });
            }
        }
    }
    return data;
}

function getUsers(callback) {
    sql.select('users',['userId', 'lName', 'fName', 'email', 'nNumber'],[],[],function(err,users) {
        if (err) callback(err,undefined);
        callback(undefined,users);
    });
}

function getUserActivity(callback) {
    sql.select('useractivity',['activityId', 'userId', 'admitted', 'userActivityDatetime'],[],[],function(err,users) {
        if (err) callback(err,undefined);
        callback(undefined,users);
    });
}