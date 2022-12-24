const cors =require ('cors');
const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

const corsOptions = {
  origin: "https://wiki-shop.onrender.com/categories/",
  originSuccessStatus: 200,
};
app.listen(port)

/*
    Serve static content from directory "public",
    it will be accessible under path /,
    e.g. http://localhost:8080/index.html
*/
app.use(express.static('public'))

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }))

// parse application/json content from body
app.use(express.json())

// serve index.html as content root
app.get('/',cors(corsOptions), function(req, res){

    var options = {
        root: path.join(__dirname, 'public')
    }

    res.sendFile('html/index.html', options, function(err){
        console.log(err)
    })
})
