const sql = require('./GeneralSql');
const fs = require('fs');

exports.dumpFormattedData = function(filename, callback) {
    getUsers(function(users) {
        getUserActivity(function(userActivity) {
            var data = JSON.stringify(matchData(users,userActivity), null, '\t');

            fs.writeFile(filename, data, function(err) {
                if (err) throw err;
                
                callback(data);
            });
            // console.log(matchData(users,userActivity));

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
    // console.log('Data After Users Entered:');
    // console.log(data);
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
        if (err) throw err;
        callback(users);
    });
}

function getUserActivity(callback) {
    sql.select('useractivity',['activityId', 'userId', 'admitted', 'userActivityDatetime'],[],[],function(err,users) {
        if (err) throw err;
        callback(users);
    });
}

// function getUsers(callback) {
//     console.log("Get Users");
//     connection.query(`SELECT * FROM users;`, function(err,result) {
//         if (err) return callback(err,null);

//         var users = [];
//         for(let i = 0; i < result.length; i++) {
//             var r = result[i];
//             users.push([r.userId, r.lName, r.fName, r.email, r.nNumber]);
//         }
//         // console.log(users);
//         callback(users);
//     });
// }

// function getUserActivity(callback) {
//     console.log("Get useractivity");
//     connection.query(`SELECT * FROM useractivity;`, function(err,result) {
//         if (err) return callback(err);

//         var useractivity = [];
//         for(let i = 0; i < result.length; i++) {
//             var r = result[i];
//             useractivity.push([r.activityId, r.userId, r.admitted, r.userActivityDatetime]);
//         }
//         callback(useractivity);
//     });
// }