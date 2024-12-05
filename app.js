const express = require('express');
const app = express();
const path = require("path");

// set up socket io

const http = require("http");
const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

// ejs

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set(express.static(path.join(__dirname,"public")));

io.on("connection", function(socket){
    console.log("connected");
});

app.get("/", function (req, res) {
    res.render("index")
})

server.listen(3000)