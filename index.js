const cors = require ('cors');
const express = require('express');
const path = require('path');
const handlebars = require('express-handlebars');
const app = express();
const port = 8080;

app.engine(
    "handlebars",
    handlebars.engine({
      layoutsDir: path.join(__dirname, "views", "layouts"),
      defaultLayout: "main",
    })
  );
  app.set("view engine", "handlebars");
  app.set("views", path.join(__dirname, "views"));

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

// var categories;

app.get('/index.html', (req, res) => {
    res.render("index");
    console.log("[ Rendered categories (index) page. ]")
});

app.get('/category.html', (req, res) => {

    const originalurl = req.originalUrl;
    paths = originalurl.split("/");
    category_id = paths[2];

    // console.log(`[ Accessing page for products in category ${category_id} ]`);
    
    // let myHeaders = new Headers();
    // myHeaders.append('Accept', 'application/json');

    // let init = {
    //     method: "GET",
    //     headers: myHeaders
    // }

    // const url = "https://wiki-shop.onrender.com/categories/"+category_id+"/products";

    // let category_title = categories[category_id];

    // fetch(url, init)
    //     .then(response => {
    //         if (response.status == 200) {
    //             return response.json();
    //         } else {
    //             console.log("[!] Something went wrong [!]");
    //         }
    //     })
    //     .then((data) => {
    //         res.render("category", { 
    //             page_title: "Products - "+category_title,
    //             category_title: category_title,
    //             products: data,
    //         });
    //         console.log("[ Rendered products ("+category_title+") page. ]")
    //     })
    //     .catch((err) => {
	// 		console.log(err);
	// 	});


    // ##################
    

    res.render("category");
    console.log(`[ Rendered page for products in category ${category_id}. ]`)
});

app.listen(port, () => console.log('App listening to port',port));