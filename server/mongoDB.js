// const mongoClient = require('mongodb').MongoClient;
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://AuebServer:AuebServer@auebserver.ittbh9s.mongodb.net/?retryWrites=true&w=majority";



// var client = new mongoClient(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

var usersDB = client.db("users-db");
var users = usersDB.collection("users");

module.exports = {
    client,
    users
};
