const express = require("express");
const app = express();
const server = require("http").Server(app);
const LegoDA = require("./LegoDA");
const db = new LegoDA();
var lego = require("./public/assets/js/shared/lego.js");

server.listen(80);

app.use(express.static(__dirname + "/public"));

app.get("/api/search", function (req, res, next) {
    if (req.query.q) res.send(db.queryParts(req.query.q, req.query.c));
    else res.send([]);
});

app.get("/api/categories", function (req, res, next) {
    res.send(db.getCategories());
});

app.get("/api/colors", function(req, res, next) {
    res.send(db.getColors());
});

app.get("/api/simplecolors", function(req, res, next) {
    res.send(db.getSimpleColors());
});

app.get("/api/stock/add", function(req, res, next) {
    var parsedData = JSON.parse(req.query.data);
    res.send(parsedData);

    var stockEntry = new lego.StockEntry(parsedData.partid);
    stockEntry.simplequantities = parsedData.simplequantities;
    stockEntry.simplequantities.map(function(colorliteral) {
        return new lego.SimpleQuantity(colorliteral.colorid, colorliteral.quantity);
    });

    db.addToStock(stockEntry);
});

app.get("/api/stock/get", function(req, res, next) {
    res.send(db.getStock());
});