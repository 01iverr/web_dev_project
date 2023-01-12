# WikiShop

## Description

An eshop created as part of the lesson *"Technologies and Programming of Web Applications"*. 

For the implementaion, we used **Node.js**, and **express framework**.

The project uses **Fetch API** to get the product data, with GET requests on [this](https://wiki-shop.onrender.com/) server (created for the purpose of this course).

All page content is dynamically generated using **Handlebars**.

User data (username, password, cart) are saved on a database we created on **MongoDB**.


## What was implemented

The user can browse the main product categories (`/index.html`), as well as the products on each category (`/category.html`). \
In each category page, they can:
* filter products by subcategories
* login with valid username/password
* add products to their cart

Users can also view their cart on `/cart.html`, by clicking the appropriate button on `/category.html`.

User can only view their cart when logged in.

On user login, a new session id is generated, using **uuid**. Both *username* and *session id* are passed as url parameters, to use for user authentication.

## Dependencies

```
cors              : 2.8.5
express           : 4.18.2
express-handlebars: 6.0.6
handlebars        : 4.7.7
mongodb           : 4.13.0
path              : 0.12.7
uuid              : 9.0.0
```

## How to run

Using Node.js:
1. Clone project
2. Using the terminal `cd` to the project folder
3. Install dependencies 
```
> npm install <dependency>
```
4. To run the server, type:
```
> node server/index.js
```
5. Wait for server to start:\
`Database connected!` \
`Server is listening to port 8080!`
6. Open your browser and visit \
`http://localhost:8080/index.html`


**Note:** In order to login, you may use the following credentials:

User *Anastasia*:\
`username: Anastasia`\
`password: 7654321`\
User *Oli*:\
`username: Oli`\
`password: 1234567`