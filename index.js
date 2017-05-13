const express = require("express");
const app = express();
const server = require("http").Server(app);

const LegoDA = require("./LegoDA");
const db = new LegoDA();

server.listen(8080);

app.use(express.static(__dirname + "/public"));

app.get("/search", function (req, res, next) {
    if (req.query.q) res.send(db.queryParts(req.query.q, req.query.c));
    else res.send([]);
});

app.get("/categories", function (req, res, next) {
    res.send(db.getCategories());
});

app.get("/colors", function(req, res, next) {
    res.send(db.getColors());
});