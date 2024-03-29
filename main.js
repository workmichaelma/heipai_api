var express = require("express");
var axios = require("axios");
var app = express();
var App = require("./app");
var BallBar = require("./ballbar");

app.get("/", (req, res) => {
  try {
    const event = {
      queryStringParameters: req.query,
    };
    App.handler(event)
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

app.get("/ballbar", (req, res) => {
  try {
    const event = {
      queryStringParameters: req.query,
    };
    BallBar.handler(event)
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
    console.log({ err });
    res.json(["error3"]);
  }
});

app.listen(3000, function () {
  console.log("Listening on port 3000");
});

module.exports = app;
