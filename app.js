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

let users = {}; // To track users

io.on("connection", function(socket) {
    console.log("New user connected: " + socket.id);
    
    // Store user in the list
    users[socket.id] = socket.id;

    // Listen for location updates
    socket.on("send-location", function(data) {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    // Listen for messages
    socket.on('send-message', (data) => {
        const { recipientId, message } = data;
        if (users[recipientId]) {
            io.to(recipientId).emit('receive-message', { id: socket.id, message });
        }
    });

    // Handle disconnection
    socket.on("disconnect", function() {
        console.log("User disconnected: " + socket.id);
        delete users[socket.id];  // Remove user from list
        io.emit("user-disconnected", socket.id);
    });
});

app.get("/", function(req, res) {
    res.render("index");
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
