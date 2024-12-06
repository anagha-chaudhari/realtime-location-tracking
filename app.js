const express = require('express');
const app = express();
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, "public")));

let users = {};

io.on("connection", function (socket) {
    console.log(`User connected: ${socket.id}`);
    users[socket.id] = `User ${socket.id.substring(0, 5)}`;
    io.emit("update-users", users);

    socket.on("send-location", function (data) {
        io.emit("receive-location", { id: socket.id, latitude: data.latitude, longitude: data.longitude });
    });

    socket.on('send-message', (data) => {
        const { recipientId, message } = data;
        io.to(recipientId).emit('receive-message', { id: users[socket.id], message });
        io.to(socket.id).emit('receive-message', { id: "You", message }); // Reflect sent message in sender's chat.
    });

    socket.on("disconnect", function () {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        io.emit("update-users", users);
    });
});

app.get("/", function (req, res) {
    res.render("index");
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
