const socket = io();

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position)=>{
        const {latitude, longitude } = position.coords;
        socket.emit("send-location", {latitude, longitude});
    }, (error)=>{
        console.error(error);
    },
{
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000,
})
}

L.map("map").setView([0,0], 10);