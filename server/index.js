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
});

app.get('/cart.html', (req, res) => {
    res.render("cart");
    console.log("[ Rendered cart page. ]")
});

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
            case "num_items_in_cart":
                console.log("[ Post-Request: number of items in cart ]");
                post_req_num_items_cart(req, res);
                break;
            default:
                console.log("[ INVALID post request. ]");
                res.status(400).send({ msg: "Invalid POST request." });
        }

    }
})

app.post('/cart.html', function (req, res) {
  let contenType = req.header('Content-Type');
  if (contenType === 'application/json') {
      post_req_cart(req,res);
  }
})


// Helper Functions

/**
 * Handle Post request for user login.
 */
function post_req_login(req, res){
    let body = req.body;

    console.log("[ New POST request with content:]");
    console.log(body);
    dao.isUserWithUsername(body.Username)
    .then(exists => {
        if (!exists){
            console.log("[ Status received: 401 ]\n[ Invalid username given for 'Add to Cart'. ]");
            res.status(401).send({msg: "Invalid user data given for 'Add to Cart'."});
            return;
        }

        return dao.findUserByUsername(body.Username)
    })
    .then(userResult => {

        if (!userResult){
            return;
        }

        if (userResult[0].Password == body.Password) { // correct password
            // Successful sign in
            console.log("[ Sign-in ok. Status 200. ]");
            let sessionId = uuidv4();
            console.log(`[ Session ID generated: ${sessionId} ]`);
            res.status(200).send({ msg: "User's credential are correct", sessionId: sessionId, username: userResult[0].Username });

            // Update database
            dao.updateSessionId(body.Username, sessionId);
        }
        else { //false password
            console.log("[ Sign-in not ok. Status 410. ]");
            res.status(401).send({ msg: "User's credential are not correct!" });
        }
    })
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
            console.log("[ Status received: 401 ]\n[ Invalid username given for 'Add to Cart'. ]");
            res.status(401).send({
                msg: "Invalid user data given for 'Add to Cart'.",
                sessionId: sessionId,
                username: username
            });
            return;
        }

        return dao.findUserByUsername(username)
    })
    .then(userResult => {

        if (!userResult){
            return;
        }

        // Check if valid session id
        console.log(userResult)
        user = userResult[0];
        console.log(`[ Checking session id for user "${user.Username}" ]`);
        if (sessionId !== user.SessionId){
            console.log(`[ Status received: 401 ]\n[ Invalid session id given for 'Add to Cart'. ]`);
            res.status(401).send({
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
        res.status(201).send({ msg: "User's cart updated.", username: username, cart: cart });

    })
}

/**
 * Handle Post request for getting number of items in cart for logged in user.
 */
function post_req_num_items_cart(req, res){
    let body = req.body;
    let username = body.username;
    let sessionId = body.sessionId;
    let user;

    // Check if valid user
    console.log(`[ Checking authentication for user "${username}".. ]`);
    dao.isUserWithUsername(username)
    .then(exists => {
        if (!exists){
            console.log("[ Status received: 401 ]\n[ Invalid username given for 'Number of items in cart'. ]");
            res.status(401).send({
                msg: "Invalid user data given for 'Number of items in cart'.",
                sessionId: sessionId,
                username: username
            });
            return;
        }
        return dao.findUserByUsername(username);
    })
    .then(userResult => {
        if (!userResult){
            return;
        }

        // Check if valid session id
        user = userResult[0];
        console.log(`[ Checking session id for user "${user.Username}" ]`);
        if (sessionId !== user.SessionId){
            console.log(`[ Status received: 401 ]\n[ Invalid session id given for 'Number of items in cart'. ]`);
            res.status(401).send({
                msg: "Invalid user data given for 'Number of items in cart'.",
                sessionId: sessionId,
                username: username
            });
            return;
        }

        console.log(`[ User ${username} has been successfully authenticated. ]`);
        let cart = user.CartProd;

        if (cart == ""){
            cart = '{\
                "cartItems": [],\
                "totalCost": 0\
            }';
        }

        let cartItems = JSON.parse(cart)["cartItems"];

        // Find total number of items in cart and send to client
        console.log("[ Received user's cart items: ]");
        console.log(cartItems);

        let cartSize = 0;
        for (product of cartItems) {
            cartSize += product["quantity"];
        }
        console.log(`[ ${cartSize} items in user's cart. ]`);
        res.status(200).send({ msg: "User's cart items count received.", size: cartSize });

    })
}

function post_req_cart(req, res){
    let body = req.body;
    let username = body.username;
    let sessionId = body.sessionId;
    let user;

    // Check if valid user
    console.log(`[ Checking authentication for user "${username}".. ]`);
    dao.isUserWithUsername(username)
    .then(exists => {
        if (!exists){
            console.log("[ Status received: 401 ]\n[ Invalid username given for 'Number of items in cart'. ]");
            res.status(401).send({
                msg: "Invalid user data given for loading cart page.",
                sessionId: sessionId,
                username: username
            });
            return;
        }
        return dao.findUserByUsername(username);
    })
    .then(userResult => {
        if (!userResult){
            return;
        }

        // Check if valid session id
        user = userResult[0];
        console.log(`[ Checking session id for user "${user.Username}" ]`);
        if (sessionId !== user.SessionId){
            console.log(`[ Status received: 401 ]\n[ Invalid session id given for 'Number of items in cart'. ]`);
            res.status(401).send({
                msg: "Invalid user data given for 'Number of items in cart'.",
                sessionId: sessionId,
                username: username
            });
            return;
        }

        console.log(`[ User ${username} has been successfully authenticated. ]`);
        let cartraw = user.CartProd;

        if (cartraw == ""){
            cartraw = '{\
                "cartItems": [],\
                "totalCost": 0\
            }';
        }
        let cart = JSON.parse(cartraw);
        res.status(200).send({ msg: "User's cart received.", cart: cart });

    })
}
