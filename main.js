var path = require("path");
var express = require("express");
var app = express();
var port = 4000;
var dir = path.join(__dirname, "public");
app.use(express.static(dir));

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
