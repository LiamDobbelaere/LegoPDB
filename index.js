const express = require("express");
const app = express();
const server = require("http").Server(app);
const LegoDA = require("./LegoDA");
const db = new LegoDA();
const webpush = require("web-push");
const fetch = require("node-fetch");
var lego = require("./public/assets/js/shared/lego.js");

var subscriptions = [];

//Push notifications stuff
var appKey = "BEzvvM3fJQcuIPP05IPOqedt9xU3yjLyL2hUSB3fqjKMtS7_7WOTdoF9abEXyBWrl4Pc0vElFeW73ZKliHgPaPk";
var privateKey = "VYSO68iEMGD3XXEs6WR11QhoN33lGTkZkR1jt99RCBk";

function routinePush() {
    console.log("Routine push");

    subscriptions.forEach(function (subscription) {
        const options = {
            TTL: 24 * 60 * 60,
            vapidDetails: {
                subject: 'mailto:tom.dobbelaere@student.howest.be',
                publicKey: appKey,
                privateKey: privateKey
            },
        };

        fetch("http://api.icndb.com/jokes/random")
            .then(function (resp) {
                return resp.json();
            }).then(function (json) {
            webpush.sendNotification(
                subscription,
                json.value.joke,
                options
            );
        });
    });
}

server.listen(80);
setInterval(routinePush, 1000 * 60 * 60);

app.use(express.static(__dirname + "/public"));

app.get("/api/search", function (req, res, next) {
    if (req.query.q) res.send(db.queryParts(req.query.q, req.query.c));
    else res.send([]);
});

app.get("/api/categories", function (req, res, next) {
    res.send(db.getCategories());
});

app.get("/api/colors", function (req, res, next) {
    res.send(db.getColors());
});

app.get("/api/simplecolors", function (req, res, next) {
    res.send(db.getSimpleColors());
});

app.get("/api/stock/add", function (req, res, next) {
    var parsedData = JSON.parse(req.query.data);
    res.send(parsedData);

    var stockEntry = new lego.StockEntry(parsedData.partid);
    stockEntry.simplequantities = parsedData.simplequantities;
    stockEntry.simplequantities.map(function (colorliteral) {
        return new lego.SimpleQuantity(colorliteral.colorid, colorliteral.quantity);
    });

    db.addToStock(stockEntry);
});

app.get("/api/stock/delete", function (req, res, next) {
    var partId = req.query.partid;
    res.send(partId);

    db.removeFromStock(partId);
});

app.get("/api/stock/get", function (req, res, next) {
    res.send(db.getStock());
});

app.get("/api/push/register", function (req, res, next) {
    var subscription = JSON.parse(req.query.data);
    subscriptions.push(subscription);

    console.log("Received new subscription.");

    routinePush();
});