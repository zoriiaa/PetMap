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
    .on("click", function() {
        const { lat, lng } = this.getLatLng()
        const latFixed = lat.toFixed(6);
        const lngFixed = lng.toFixed(6)
        
        const url = `/pet_form?lat=${encodeURIComponent(latFixed)}&lng=${encodeURIComponent(lngFixed)}`;

        window.location.href = url;
    });

});




