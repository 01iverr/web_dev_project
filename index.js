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

// serve index.html as content root
app.get('/', (req, res) => {

    // var options = {
    //     root: path.join(__dirname, 'public')
    // }

    // res.sendFile('html/index.html', options, function(err){
    //     console.log(err)
    // })


    let myHeaders = new Headers();
    myHeaders.append('Accept', 'application/json');

    let init = {
        method: "GET",
        headers: myHeaders
    }

    const url = "https://wiki-shop.onrender.com/categories/";

    fetch(url, init)
        .then(response => {
            if (response.status == 200) {
                return response.json();
            } else {
                console.log("[!] Something went wrong [!]");
            }
        })
        .then((data) => {
            res.render("categories", { 
                page_title: "Product Categories",
                categories: data 
            });
            console.log("[ Rendered categories page. ]")
        })
        .catch((err) => {
			console.log(err);
		});

    // res.render("categories");
    // console.log("[ Rendered categories page. ]")
});

app.listen(port, () => console.log('App listening to port',port));