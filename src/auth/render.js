'use strict';

const fs = require('fs');
const path = require('path');
const template = require('lodash.template');

const loginPath = path.resolve(__dirname, './login.html');
const indexPath = path.resolve(__dirname, '../index.html');

module.exports = {
    login: (cb) => {
        fs.readFile(loginPath, (err, res) => {
            if (err) { return cb(err); }
            return cb(null, res.toString());
        });
    },
    index: (cb) => {
        let output = '';
        fs.readFile(indexPath, 'utf8', (err, res) => {
            if (err) console.warn(`{"err": "${err}"}`);
            var body = res.replace('${output}', output);
            return cb(null, body);
        });
    }
};

function getDateTimeFromTimestamp(unixTimeStamp) {
    var date = new Date(unixTimeStamp * 1000);
    date.setHours(date.getHours() + 10);
    return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
}