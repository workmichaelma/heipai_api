var express = require("express");
var axios = require("axios");
var app = express();
var App = require("./app");

app.get("/", (req, res) => {
  try {
    App.handler()
      .then((e) => {
        const { body } = e || {};
        if (body) {
          res.json(JSON.parse(body));
        } else {
          res.json(["error1"]);
        }
      })
      .catch((err) => {
        res.json(["error2"]);
      });
  } catch (err) {
    res.json(["error3"]);
  }
});

app.listen(3000, function () {
  console.log("Listening on port 3000");
});

module.exports = app;
