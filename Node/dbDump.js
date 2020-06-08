const SQL = require('./Utils/GeneralSql');
const fs = require('fs');

exports.dumpFormattedData = function(filename, callback) {
    // get the users
    getUsers(function(users) {
        // get the user activity
        getUserActivity(function(userActivity) {
            //write to the given file
            fs.writeFile(filename,JSON.stringify(matchData(users,userActivity), null, '\t'), function(err) {
                if (err) throw err;
            });
        });
    });
}

function matchData(users,userActivity) {
    var data = [];
    // for every user, add their data to the array, as a json element
    for (let i = 0; i < users.length; i++) {
        data.push({
            userId: users[i][0],
            userName: `${users[i][2]} ${users[i][1]}`,
            userEmail: users[i][3],
            userNNumber: users[i][4],
            userData: []
        });
    }
    // console.log('Data After Users Entered:');
    // console.log(data);

    // for every useractivity, if the user did the activity, add the activity data to the user's json element
    for (let j = 0; j < userActivity.length; j++) {
        for (let k = 0; k < data.length; k++) {
            if (data[k]['userId'] == userActivity[j][1]) {
                data[k]["userData"].push({
                    admitted:userActivity[j][2],
                    datetime:userActivity[j][3]
                });
            }
        }
    }
    return data;
}

function getUsers(callback) {
    // console.log("Get Users");
    // connection.query(`SELECT * FROM users;`, function(err,result) {
    //     if (err) return callback(err,null);

    //     var users = [];
    //     for(let i = 0; i < result.length; i++) {
    //         var r = result[i];
    //         users.push([r.userId, r.lName, r.fName, r.email, r.nNumber]);
    //     }
    //     // console.log(users);
    //     callback(users);
    // });
    SQL.select('users', '*', [], [], function(err,res) {
        callback(res);
    });
}

function getUserActivity(callback) {
    // console.log("Get useractivity");
    // connection.query(`SELECT * FROM useractivity;`, function(err,result) {
    //     if (err) return callback(err);

    //     var useractivity = [];
    //     for(let i = 0; i < result.length; i++) {
    //         var r = result[i];
    //         useractivity.push([r.activityId, r.userId, r.admitted, r.userActivityDatetime]);
    //     }
    //     callback(useractivity);
    // });

    SQL.select('useractivity', '*', [], [], function(err,res) {
        callback(res);
    });
}