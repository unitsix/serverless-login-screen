'use strict';

const cookie = require('cookie');

const cookieKey = 'SID';
const cookiePrefix = 'Session';

module.exports = {
    getSession: (headers, users) => {
        const cookieStr = headers ? (headers.Cookie || '') : '';
        const cookies = cookie.parse(cookieStr);
        if (!cookies[cookieKey]) {
            return { valid: false };
        }
        const username = cookies[cookieKey].replace(cookiePrefix, '');
        var user = search(username, users)

        return {
            valid: !!user,
            user: user
        };

    },
    setSession: (user) => {
        const sessionId = `${cookiePrefix}${user}`;
        const newCookie = cookie.serialize(cookieKey, sessionId);
        return { Cookie: newCookie };
    },
    destroySession: () => {
        const clearCookie = cookie.serialize(cookieKey, 'empty', { maxAge: 0 });
        return { Cookie: clearCookie };
    }
};

function search(username, users) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            return users[i];
        }
    }
}