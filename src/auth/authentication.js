'use strict';

module.exports = {
    auth: (username, pass, users) => {
        if (!username || !pass) {
            return { success: false, message: 'Must provide username and password.' };
        } else {
            var userObject = search(username, users)
            if (!userObject) {
                return { success: false, message: 'User doesn\'t exist.' };
            } else if (userObject.password !== pass) {
                return { success: false, message: 'Incorrect password.' };
            } else {
                return { success: true, user: userObject.username };
            }
        }
    }
};

function search(username, users) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) {
            return users[i];
        }
    }
}