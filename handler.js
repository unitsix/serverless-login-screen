'use strict';
const path = require('path')
const StaticFileHandler = require('serverless-aws-static-file-handler')
const crypto = require('crypto')
const AWS = require('aws-sdk')
const ssm = new AWS.SSM()
const session = require('./src/auth/session')
const render = require('./src/auth/render')
const authentication = require('./src/auth/authentication')

function getValue(name, withDecryption) {
    var ssmParams = {
        Name: name,
        WithDecryption: withDecryption
    };

    return new Promise(function(resolve, reject) {
        ssm.getParameter(ssmParams, function(err, data) {

            if (err) {
                console.log(err, err.stack);
                resolve('')
            } else {
                var cache = [];
                var dataString = JSON.stringify(data, function(key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            return;
                        }
                        cache.push(value);
                    }
                    return value;
                });
                cache = null;
                resolve(JSON.parse(dataString).Parameter.Value)
            }
        })
    })

}

module.exports.login = (event, context, callback) => {

    getValue(process.env.MYSQL_PASSWORD_NAME, true).then(function(competitor_analysis_rds_password) {
        const mysql = require('mysql');
        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: competitor_analysis_rds_password,
            database: process.env.MYSQL_DATABASE,
            port: 3306,
            multipleStatements: true
        });
        var usersSQL = "SELECT * FROM users;";
        connection.query(usersSQL, function(err, users) {
            connection.end()
            var postData = JSON.parse(event.body),
                username = postData.username,
                pass = crypto.createHash('md5').update(postData.password).digest('hex'),
                authRes = authentication.auth(username, pass, users);

            if (authRes.success) {
                const sess = session.setSession(authRes.user);
                const response = {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        "Set-Cookie": sess.Cookie
                    },
                    body: '{"success": true}'
                };
                callback(null, response);
            } else {
                const response = {
                    statusCode: 200,
                    headers: { 'Content-Type': 'text/html' },
                    body: authRes
                };
                callback(null, response);
            }
        })
    })
}

module.exports.logout = (event, context, callback) => {
    const sess = session.destroySession();
    console.log(sess)
    const response = {
        statusCode: 302,
        headers: {
            'Content-Type': 'application/json',
            "Set-Cookie": sess.Cookie,
            'Location': "/"
        },
        body: '{"success": true}'
    };
    console.log(response)
    callback(null, response);
}

module.exports.index = (event, context, callback) => {

    getValue(process.env.MYSQL_PASSWORD_NAME, true).then(function(competitor_analysis_rds_password) {
        const mysql = require('mysql');
        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: competitor_analysis_rds_password,
            database: process.env.MYSQL_DATABASE,
            port: 3306,
            multipleStatements: true
        });
        var usersSQL = "SELECT `username` FROM users;";
        connection.query(usersSQL, function(err, users) {
            connection.end()
            const sess = session.getSession(event.headers, users);
            if (!sess.valid) {
                render.login((err, res) => {
                    if (err) {
                        callback(err);
                    } else {
                        const response = {
                            statusCode: 200,
                            headers: {
                                'Content-Type': 'text/html',
                                'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                            },
                            body: res
                        };
                        callback(null, response);
                    }
                });
            } else {
                const sourceIp = event.requestContext.identity.sourceIp;
                console.log('{"event.requestContext.identity": ' + JSON.stringify(event.requestContext.identity) + '}');
                render.index((err, res) => {
                    if (err) console.log('{"err": ' + err + '}');
                    const response = {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'text/html',
                            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                        },
                        body: res
                    };
                    callback(null, response);
                })
            }
        })
    })
}

module.exports.staticfile = (event, context, callback) => {
    const clientFilesPath = path.join(__dirname, './src');
    return new StaticFileHandler(clientFilesPath).get(event, context)
        .then(response => context.succeed(response))
        .catch(err => callback(err));
}