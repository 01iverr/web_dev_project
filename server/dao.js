const User = require('./user');
const mongodb = require('./mongodb');

const users = mongodb.Users;

class DAO {
    constructor() {
        this.users = users;
    }

    isUserWithUsername(username) {
        let query = { Username: username };
        return this.users.find(query).toArray()
            .then(result => {
                console.log("Results for: " + username, result)
                if (result.length === 0) {
                    return false;
                }
                else {
                    return true;
                }
            })
    }

    findUserByUsername(username) {
        let query = { Username: username };
        return this.users.find(query).toArray()
            .then(result => {
                if (result.length === 0) {
                    return null;
                }
                else {
                    return this.users.find(query).toArray();
                }
            })
    }
}

module.exports = DAO;
