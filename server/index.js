const express = require('express');
const app = express();
const cors = require('cors');
const DAO = require('./dao');
const mongodb = require('./mongodb');
const path = require('path');
const client = mongodb.client;
const handlebars = require('express-handlebars');
const port = 8080;
const { v4: uuidv4 } = require('uuid');

var dao = new DAO();

app.use(cors());
app.use(express.json());

client.connect()
  .then(() => {
    console.log("Database connected!");
    app.listen(port);
    console.log(`Server is listening to port ${port}!`);
})


app.engine(
    "handlebars",
    handlebars.engine({
    layoutsDir: path.join(__dirname, "../views", "layouts"),
    defaultLayout: "main",
    })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "../views"));

/*
    Serve static content from directory "public",
    it will be accessible under path /,
    e.g. http://localhost:8080/index.html
*/
app.use(express.static('public'));

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }));

// parse application/json content from body
app.use(express.json());

// use corse with headers
app.use(cors(origin="https://wiki-shop.onrender.com/"));

app.get('/index.html', (req, res) => {
    res.render("index");
    console.log("[ Rendered categories (index) page. ]")
});

app.get('/category.html', (req, res) => {
    res.render("category");
    console.log("[ Rendered page for products in category. ]");
//   dao.updateCart("Anastasia", ""); // TODO: remove
});

// app.get('/user/:Username', function (req, res) {
//     let contenType = req.header('Accept');
  
//     if (contenType === 'application/json') {
//       console.log("GET cart",req.params.Username)
//       dao.findUserByUsername(req.params.Username)
//         .then(result => {
//           res.send(result[0]);
//         })
//     }
// });
  
app.post('/category.html', function (req, res) {
    let contenType = req.header('Content-Type');

    if (contenType === 'application/json') {

        switch (req.body.post_type) {
            case "login":
                console.log("[ Post-Request: login ]");
                post_req_login(req, res);
                break;
            case "add_to_cart":
                console.log("[ Post-Request: add to cart ]");
                post_req_add_to_cart(req, res);
                break;
            default:
                console.log("[ INVALID post request. ]");
        }

    }
})


// Helper Functions

/**
 * Handle Post request for user login.
 */
function post_req_login(req, res){
    console.log(typeof req);
    console.log(typeof res);
    
    let body = req.body;

    console.log("[ New POST request with content:]");
    console.log(body);
    dao.isUserWithUsername(body.Username)
    .then(result => {
        if (result) { // there is a user with this Username
            dao.findUserByUsername(body.Username)
            .then(userResult => {
                if (userResult[0].Password == body.Password) { // correct password
                    // Successful sign in
                    console.log("[ Sign-in ok. Status 201. ]");
                    let sessionId = uuidv4();
                    console.log(`[ Session ID generated: ${sessionId} ]`);
                    res.status(201).send({ msg: "User's credential are correct", sessionId: sessionId, username: userResult[0].Username });

                    // Update database
                    dao.updateSessionId(body.Username, sessionId);
                }
                else { //false password
                    console.log("[ Sign-in not ok. Status 410. ]");
                    res.status(410).send({ msg: "User's credential are not correct" });
                }
            })
            .catch(error => {
                console.log(`[ Fetch error: ${error} ]`);
                res.status(510).send({ msg: "An error occured while fetching user data" });
            });
        }
        else { // no user with this Username
            console.log("[ Username does not match with  any users! Status 411. ]");
            res.status(411).send({ msg: "There is no such user with this Username!" });
        }
    })
    .catch(error => {
        console.log(`[ Fetch error: ${error} ]`);
        res.status(510).send({ msg: "An error occured while fetching user data" });
    });
}

/**
 * Handle Post request for user adding a product to cart.
 */
function post_req_add_to_cart(req, res){
    let body = req.body;
    let username = body.username;
    let sessionId = body.sessionId;
    let product = body.product;
    let user;

    // Check if valid user
    console.log(`[ Checking authentication for user "${username}".. ]`);
    dao.isUserWithUsername(username)
    .then(exists => {
        if (!exists){
            console.log("[ Status received: 420 ]\n[ Invalid username given for 'Add to Cart'. ]");
            res.status(420).send({ 
                msg: "Invalid user data given for 'Add to Cart'.", 
                sessionId: sessionId, 
                username: username 
            });
            return;
        }

        dao.findUserByUsername(username)
        .then(userResult => {

            // Check if valid session id
            console.log(userResult)
            user = userResult[0];
            console.log(`[ Checking session id for user "${user.Username}" ]`);
            if (sessionId !== user.SessionId){
                console.log(`[ Status received: 420 ]\n[ Invalid session id given for 'Add to Cart'. ]`);
                res.status(420).send({ 
                    msg: "Invalid user data given for 'Add to Cart'.", 
                    sessionId: sessionId, 
                    username: username 
                });
                return;
            }

            console.log(`[ User ${username} has been successfully authenticated. ]`);

            // Update cart

            // Get cart data from Databese
            let cart = user.CartProd;
            console.log(`[ ${user.Username}'s cart (before update): ${cart} ]`);

            if (cart == ""){
                cart = '{\
                    "cartItems": [],\
                    "totalCost": 0\
                }';
            }
            cart = JSON.parse(cart);
            console.log(`[ ${user.Username}'s cart (before update): ]`);
            console.log(cart);

            console.log("[ Cart Items: ]");
            let cartItems = cart["cartItems"];
            console.log(cartItems);
            console.log("[ Total Cost: ]");
            let totalCost = cart["totalCost"];
            console.log(totalCost);

            let product_exists = false; // product already exists in cart
            let product_index = 0;      // index of product in cartItems
            for (p of cartItems) {
                if (p.title == product.title) {
                    product_exists = true;
                    product_index += 1;
                    break;
                }
                product_index += 1;
            }

            // Edit cart data
            if(!product_exists) { // first time that the product is added to cart
                console.log(`[ User doesn't already have "${product.title}" in cart. ]`);
                cartItems[product_index] = {
                    "title": product.title,
                    "cost": product.cost,
                    "quantity": 1
                }
            } else { // product already exists in cart
                console.log(`[ User already has "${product.title}" in cart. ]`);
                cartItems[product_index-1]["quantity"] += 1;
            }
            totalCost += product.cost;
            cart["totalCost"] = totalCost;
            console.log(`[ ${user.Username}'s cart (after update): ]`);
            console.log(cart);

            // Sent update to database
            dao.updateCart(username, JSON.stringify(cart));

            // Inform client of successful change
            res.status(202).send({ msg: "User's cart updated.", username: username, cart: cart });

        })
        .catch(error => {
            console.log(`[ Fetch error: ${error} ]`);
            res.status(520).send({ msg: "An error occured while fetching user data" });
        });  
    })
    .catch(error => {
        console.log(`[ Fetch error: ${error} ]`);
        res.status(520).send({ msg: "An error occured while fetching user data" });
    }); 
}