const socket = io();

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let markers = {};
const userList = document.getElementById('user-list');
const messageInput = document.getElementById('message');
const sendMessageButton = document.getElementById('send-message');
const messagesList = document.getElementById('messages');

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit('send-location', { latitude, longitude });
            if (!markers[socket.id]) {
                markers[socket.id] = L.marker([latitude, longitude]).addTo(map);
                map.setView([latitude, longitude], 16);
            } else {
                markers[socket.id].setLatLng([latitude, longitude]);
            }
        },
        (error) => {
            console.error(`Geolocation error: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

socket.on('update-users', (users) => {
    userList.innerHTML = '<option value="" disabled selected>Select a user</option>';
    Object.keys(users).forEach((id) => {
        if (id !== socket.id) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = users[id];
            userList.appendChild(option);
        }
    });
});

sendMessageButton.addEventListener('click', () => {
    const recipientId = userList.value;
    const message = messageInput.value.trim();
    if (recipientId && message) {
        socket.emit('send-message', { recipientId, message });
        messageInput.value = '';
    }
});

socket.on('receive-message', (data) => {
    const { id, message } = data;
    const messageItem = document.createElement('li');
    messageItem.textContent = `${id}: ${message}`;
    messagesList.appendChild(messageItem);
});

// ..
