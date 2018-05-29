# Auth

- Browser makes request, server checks cookies for user session
- Server redirect to a login page if user is not authorized
- User posts credentials to /login endpoint
- Server authenticates, creates session, stores and returns session cookie to browser 

## Code

### handler.js
Parts to include for auth to work

```
const session = require('./src/auth/session');
const render = require('./src/auth/render');
const authentication = require('./src/auth/authentication');
```

#### Login

```
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
                    Location: "/",
                    headers: { 'Content-Type': 'text/html' },
                    body: authRes
                };
                callback(null, response);
            }
        })
    })
}
```

#### Logout

```
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
```

#### Get/Index

```
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

        var usersSQL = "SELECT username FROM users;";
        connection.query(usersSQL, function(err, users) {

            const sess = session.getSession(event.headers, users);
            if (!sess.valid) {
                connection.end()
                render.login((err, res) => {
                    if (err) { return context.done(err); }
                    const response = {
                        statusCode: 200,
                        headers: {
                            'Content-Type': 'text/html',
                            'Access-Control-Allow-Origin': '*' // Required for CORS support to work
                        },
                        body: res
                    };
                    callback(null, response);
                });
            } else {
            //... Your page content ...
           }
        })
    })
}
```

### serverless.yml

```
  login:
    description: ${env:DESC}
    handler: handler.login 
    package:
      exclude:
        - .env
        - .env*
        - ./**
        - output/**/*
        - events/**/*
        - node_modules/**
      include:
        - handler.js
        - package.json
        - src/**/*
    # We need to define the RDS login
    environment:
      MYSQL_HOST: ${env:MYSQL_HOST}
      MYSQL_USER: ${env:MYSQL_USER}
      MYSQL_PASSWORD_NAME: ${env:MYSQL_PASSWORD_NAME}
      MYSQL_DATABASE: ${env:MYSQL_DATABASE}
    #  We need to allocate VPC and Subnets for access to RDS
    vpc:
      securityGroupIds:
        - ${env:SECURITY_GROUP_ID_1}
        - ${env:SECURITY_GROUP_ID_2}
      subnetIds:
        - ${env:SUBNET_ID_1}
        - ${env:SUBNET_ID_2}
    events:
      - http:
          path: login
          method: post
          cors: true

  logout:
    description: ${env:DESC}
    handler: handler.logout 
    package:
      exclude:
        - .env
        - .env*
        - ./**
        - output/**/*
        - events/**/*
        - node_modules/**
      include:
        - handler.js
        - package.json
        - src/**/*
    #  We need to allocate VPC and Subnets for access to RDS
    vpc:
      securityGroupIds:
        - ${env:SECURITY_GROUP_ID_1}
        - ${env:SECURITY_GROUP_ID_2}
      subnetIds:
        - ${env:SUBNET_ID_1}
        - ${env:SUBNET_ID_2}
    events:
      - http:
          path: logout
          method: post
          cors: true

```

### package.json

```
    "dependencies": {
        "cookie": "^0.3.1",
        "lodash.template": "^4.4.0",
        "mysql": "~2.15.0"
    },
```

