const myql = require("mysql");
const fs = require("fs");

var connection = undefined;

exports.init = function(credentialFilename, callback) {
    // read credentials from credentialFilename
    fs.readFile(credentialFilename, function(err, content) {
        // if error when reading file, log to console
        if (err) return console.log("Error loading setup file:\n" + err);

        // parse json file
        var creds = JSON.parse(content);

        // create connection pool using json credentials
        connection = mysql.createPool({
            connectionLimit : 50,
            host            : creds.database_host,
            user            : creds.database_user,
            password        : creds.database_password,
            database        : creds.database_name
        });
        
        // return server port from crednetials
        callback(cred.server_port);
    });
}

exports.select = function(table, columns, params, values, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (params.length != valuess.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble columns string
    var cols = `${columnss[0]}`;
    for(var i = 1; i < columns.length; i++) {
        cols += `, ${columns[i]}`;
    }

    // assemble pairs string
    var pairs = `${params[0]} = ${values[0]}`;
    for(var i = 1; i < params.length; i++) {
        pairs += ` AND ${params[i]} = ${values[i]}`;
    }

    // assemble sql statement
    var sql = `SELECT ${columns} FROM ${table} WHERE ${pairs};`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,undefined);

        // assemble data to return, want to get rid of RowDataPackets
        var data = [];
        for (var i = 0; i < result.length; i++) {
            // 2nd dimension of data array
            var recordData = [];
            for (var j = 0; j < cols.length; j++) {
                recordData.push(result[i][columns[j]]);
            }
            data.push(recordData);
        }
        
        // return data constructed from sql query
        callback(undefined, data);
    });
}

//Overloaded function with the ability to tack on extra SQL (Limit, Order By, etc...) 
//  and using 'LIKE' instead of '='
exports.selectExtra = function(table, columns, params, operators, values, extraSQL, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (params.length != valuess.length || params.length != operators.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble columns string
    var cols = `${columnss[0]}`;
    for(var i = 1; i < columns.length; i++) {
        cols += `, ${columns[i]}`;
    }

    
    // assemble pairs string
    pairs = `${params[0]} ${operators[0]} ${values[0]}`;
    for(var i = 1; i < params.length; i++) {
        pairs += ` AND ${params[i]} ${operators[i]} ${values[i]}`;
    }

    // assemble sql statement
    var sql = `SELECT ${columns} FROM ${table} WHERE ${pairs} ${extraSQL};`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,undefined);

        // assemble data to return, want to get rid of RowDataPackets
        var data = [];
        for (var i = 0; i < result.length; i++) {
            // 2nd dimension of data array
            var recordData = [];
            for (var j = 0; j < cols.length; j++) {
                recordData.push(result[i][columns[j]]);
            }
            data.push(recordData);
        }
        
        // return data constructed from sql query
        callback(undefined, data);
    });
}



exports.insert = function(table, columns, values, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (columns.length != values.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble columns string
    var cols = `${columns[0]}`;
    for(var i = 1; i < columns.length; i++) {
        cols += `, ${columns[i]}`;
    }

    // assemble values string
    var vals = `${values[0]}`;
    for(var i = 1; i < values.length; i++) {
        vals += `, ${values[i]}`;
    }

    // assemble sql statement
    var sql = `INSERT INTO ${table} (${cols}) VALUES (${vals});`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,false);
        
        // return true is successful
        callback(undefined, true);
    });
}

exports.delete = function(table, params, values, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (params.length != values.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble pairs string
    var pairs = `${params[0]} = ${values[0]}`;
    for(var i = 1; i < params.length; i++) {
        pairs += ` AND ${params[i]} = ${values[i]}`;
    }

    // assemble sql statement
    var sql = `DELETE FROM ${table} WHERE ${pairs};`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,false);
        
        // return true is successful
        callback(undefined, true);
    });
}

exports.deleteExtra = function(table, params, operators, values, extraSQL, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (params.length != values.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble pairs string
    var pairs = `${params[0]} ${operators[0]} ${values[0]}`;
    for(var i = 1; i < params.length; i++) {
        pairs += ` AND ${params[i]} ${operators[i]} ${values[i]}`;
    }

    // assemble sql statement
    var sql = `DELETE FROM ${table} WHERE ${pairs} ${extraSQL};`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,false);
        
        // return true is successful
        callback(undefined, true);
    });
}

exports.update = function(table, columns, colValues, params, parValues, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (columns.length != colValues.length) return callback(new Error("params and vals must be the same length!"), undefined);
    if (params.length != parValues.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble column pairs string
    var colPairs = `${columns[0]} = ${colValues[0]}`;
    for(var i = 1; i < columns.length; i++) {
        colPairs += ` AND ${columns[i]} = ${colValues[i]}`;
    }

    // assemble parameter pairs string
    var parPairs = `${params[0]} = ${parValues[0]}`;
    for(var i = 1; i < params.length; i++) {
        parPairs += ` AND ${params[i]} = ${parValues[i]}`;
    }

    // assemble sql statement
    var sql = `UPDATE ${table} SET ${colPairs} WHERE ${parPairs};`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,false);
        
        // return true is successful
        callback(undefined, true);
    });
}

exports.updateExtra = function(table, columns, colValues, params, operators, parValues, callback) {
    // check if number of params matches number of values, needed for correct where clause
    if (columns.length != colValues.length) return callback(new Error("params and vals must be the same length!"), undefined);
    if (params.length != parValues.length) return callback(new Error("params and vals must be the same length!"), undefined);

    // assemble column pairs string
    var colPairs = `${columns[0]} = ${colValues[0]}`;
    for(var i = 1; i < columns.length; i++) {
        colPairs += ` AND ${columns[i]} = ${colValues[i]}`;
    }

    // assemble parameter pairs string
    var parPairs = `${params[0]} = ${parValues[0]}`;
    for(var i = 1; i < params.length; i++) {
        parPairs += ` AND ${params[i]} = ${parValues[i]}`;
    }

    // assemble sql statement
    var sql = `UPDATE ${table} SET ${colPairs} WHERE ${parPairs};`;

    // query database
    connection.query(sql, function(err,result) {
        if (err) return callback(err,false);
        
        // return true is successful
        callback(undefined, true);
    });
}

exports.add = function() {

}