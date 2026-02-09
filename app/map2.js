const map = L.map('map').setView([0,0], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);


navigator.geolocation.getCurrentPosition(pos => {
    map.setView([pos.coords.latitude, pos.coords.longitude], 13);
});

let selectedPoint = null;
let tempMarker = null;
let addPetMarker = null;


const addPetIcon = L.icon({
    iconUrl: '/static/icons/add-pet.svg',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
});


map.on("click", e => {
    selectedPoint = e.latlng;


    if(tempMarker){
        map.removeLayer(tempMarker);
    }

    tempMarker = L.marker(selectedPoint).addTo(map);

    if(addPetMarker){
        map.removeLayer(addPetMarker);
    }

    addPetMarker = L.marker(selectedPoint, { icon: addPetIcon })
        .addTo(map)
        .on("click", () => {
            const lat = selectedPoint.lat;
            const lng = selectedPoint.lng;
            window.location.href = `find.html?lat=${lat}&lng=${lng}`;
        });
});
