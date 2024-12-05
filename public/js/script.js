const socket = io();

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let markers = {};
let onlineUsers = {}; // To track online users

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
        },
        (error) => {
            console.log(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    map.setView([latitude, longitude], 16);

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Default marker
    }
});

socket.on('user-disconnected', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
    delete onlineUsers[id];
    updateUserList();
});

socket.on('receive-message', (data) => {
    const { id, message } = data;
    const messageItem = document.createElement('li');
    messageItem.textContent = `User ${id}: ${message}`;
    messagesList.appendChild(messageItem);
});

socket.on('connect', () => {
    onlineUsers[socket.id] = socket.id;
    updateUserList();
});

function updateUserList() {
    const recipientSelect = document.getElementById('recipient');
    recipientSelect.innerHTML = '<option value="">Select recipient</option>';
    for (let id in onlineUsers) {
        if (id !== socket.id) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `User ${id}`;
            recipientSelect.appendChild(option);
        }
    }
}

const messageInput = document.getElementById('message');
const sendMessageButton = document.getElementById('send-message');
const messagesList = document.getElementById('messages');

sendMessageButton.addEventListener('click', () => {
    const recipientId = document.getElementById('recipient').value;
    const message = messageInput.value;
    if (recipientId && message.trim()) {
        socket.emit('send-message', { recipientId, message });
        messageInput.value = '';
    }
});
