const express = require("express");
const session = require("express-session");
const app = express();

var sessionConfig = {
    key: 'legopdbsess',
    secret: 'qc7kYDlD66ZK7cbh2J73FRX6Sx7pk5T2',
    resave: true,
    saveUninitialized: false
};

app.use(session(sessionConfig));

/**
 *  URLs for static files (does not require a login)
 */
app.use(express.static(__dirname + "/public"));

/**
 *  URLs that don't require the user to be logged in
 */
app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/public/signup.html");
});

app.post("/login.do", function(req, res) {
    req.session.login = "ayy";
    res.send("(( login ))");
});

app.post("/signup.do", function(req, res) {
    res.send("(( sign up ))");
});

app.post("/logout.do", function (req, res) {

});

/**
 *  Pass all URLs after this handler through this login filter
 */
app.get("*", function(req, res) {
    if (req.session.login == null) {
        res.sendFile(__dirname + "/public/login.html");
    } else {
        next();
    }
});

/**
 *  Login-only main application URLs
 */


const server = app.listen(80, function() {
    var port = server.address().port;

    console.log("- Express server running on localhost:" + port);
});