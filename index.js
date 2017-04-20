const express = require("express");
const app = express();

app.use(express.static(__dirname + "/public"));

//app.post()

const server = app.listen(80, function() {
    var port = server.address().port;

    console.log("- Express server running on localhost:" + port);
});