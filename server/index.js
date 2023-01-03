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

app.get('/user/:Username', function (req, res) {
  let contenType = req.header('Accept');

  if (contenType === 'application/json') {
    console.log("GET cart",req.params.Username)
    dao.findUserByUsername(req.params.Username)
      .then(result => {
        res.send(result[0]);
      })
  }
});

app.post('/category.html', function (req, res) {

  let contenType = req.header('Content-Type');

  if (contenType === 'application/json') {

    console.log("[ New POST request with content:]");
    console.log(req.body);
    dao.isUserWithUsername(req.body.Username)
      .then(result => {
        if (result) { //there is a user with this Username
          dao.findUserByUsername(req.body.Username)
            .then(userResult => {
              if (userResult[0].Password == req.body.Password) { //correct password
                // Successful sign in
                console.log("[ Sign-in ok. Status 202. ]");
                let sessionId = uuidv4();
                console.log(`[ Session ID generated: ${sessionId} ]`);
                res.status(202).send({ msg: "User's credential are correct", sessionId: sessionId  });

                // Update database
                dao.updateSessionId(req.body.Username, sessionId);
              }
              else { //false password
                console.log("[ Sign-in not ok. Status 410. ]");
                res.status(410).send({ msg: "User's credential are not correct" });
              }
            })
        }
        else { //no user with this Username
          console.log("[ Username does not match with  any users! Status 411. ]");
          res.status(411).send({ msg: "There is no such user with this Username!" });
        }
      })
  }
})

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

  // var categories;

  app.get('/index.html', (req, res) => {
      res.render("index");
      console.log("[ Rendered categories (index) page. ]")
  });

  app.get('/category.html', (req, res) => {

      const originalurl = req.originalUrl;
      paths = originalurl.split("/");
      category_id = paths[2];


      res.render("category");
      console.log(`[ Rendered page for products in category ${category_id}. ]`)
  });
