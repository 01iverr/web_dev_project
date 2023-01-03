const User = require('./user');
const mongodb = require('./mongodb');

const users = mongodb.users;

class DAO {
    constructor() {
        this.users = users;
    }

    /**
     * Finds if user exists in database.
     * @param {String} username user's username
     * @returns true if user exists in database, else false
     */
    isUserWithUsername(username) {
        let query = { Username: username };
        return this.users.find(query).toArray()
            .then(result => {
                console.log(`[ Results for: ${username} ]`);
                console.log(result);
                if (result.length === 0) {
                    return false;
                }
                else {
                    return true;
                }
            })
    }

    /**
     * Find user in Database by username.
     * @param {String} username user's username
     * @returns user
     */
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

    /**
     * Update session id in database for user.
     * @param {String} username username of user to be edited
     * @param {String} sessionId new session id
     */
    updateSessionId(username, sessionId) {
        this.findUserByUsername(username)
            .then(userResult => {
                let user = userResult[0];
                console.log(`[ Editing session id of user with id ="${user._id}" in database ]`);

                const filter = { _id: user._id };
                const updateDocument = {
                    $set: {
                        SessionId: sessionId,
                    },
                };
                this.users.updateOne(filter, updateDocument)
                    .then(result => {
                        console.log("[ Results from database edit: ]");
                        console.log(result);
                    })
                
            })

        
    }
}

module.exports = DAO;
