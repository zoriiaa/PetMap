
const map = L.map('map').setView([0, 0], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    map.setView([lat, lng], 13);
});

function goToAdd() {
    window.location.href = "/map_mark";
}


function createPetIcon() {
    return L.icon({
        iconUrl: '/static/icons/pet-marker.svg',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
    });
}

async function loadPets() {
    try {
        const res = await fetch("/api/pets");
        const pets = await res.json();

        pets.forEach(pet => {

            let iconUrl;
            if (pet.status === "Знайдена") {
                iconUrl = "/static/icons/pet-found.svg";
            } else {
                iconUrl = "/static/icons/pet-lost.svg";
            }

            const petIcon = L.icon({
                iconUrl: iconUrl,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });

            L.marker([pet.lat, pet.lng], { icon: petIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="pet-popup">
                        <div class="pet-header">
                            <div class="pet-date">
                                ${pet.created_at || ""}
                            </div>
                            <div class="pet-status ${pet.status === "Знайдена" ? "found" : "lost"}">
                                ${pet.status}
                            </div>
                        </div>
                        <div class="pet-content">
                            <div class="pet-info">
                                <h3>${pet.name || "Без імені"}</h3>
                                <p>${pet.species}</p>
                            </div>
                            <div class="pet-photo">
                                ${pet.photo_name
                                            ? `<img src="/static/uploads/${pet.photo_name}">`
                                            : ""
                                        }
                            </div>
                        </div>
                        <div class="pet-desc">
                            ${pet.description || ""}
                        </div>
                        <div class="pet-process">
                            ${pet.process_status || ""}
                        </div>
                        <div class="pet-contact">
                            Звʼязатися з автором
                        </div>
                    </div>
                    `);
        });

    } catch (err) {
        console.error("Помилка завантаження:", err);
    }
}


loadPets();

async function loadFilteredPets() {

    let url = "/api/pets";

    if (currentStatus) {
        url += `?status=${currentStatus}`;
    }

    const res = await fetch(url);
    const pets = await res.json();

    console.log(pets);

    pets.forEach(pet => {

        L.marker([pet.lat, pet.lng], {
            icon: createPetIcon(pet.status)
        })
        .addTo(map)
        .bindPopup(`
                    <div class="pet-popup">
                        <div class="pet-header">
                            <div class="pet-date">
                                ${pet.created_at || ""}
                            </div>
                            <div class="pet-status ${pet.status === "Знайдена" ? "found" : "lost"}">
                                ${pet.status}
                            </div>
                        </div>
                        <div class="pet-content">
                            <div class="pet-info">
                                <h3>${pet.name || "Без імені"}</h3>
                                <p>${pet.species}</p>
                            </div>
                            <div class="pet-photo">
                                ${pet.photo_name
                                            ? `<img src="/static/uploads/${pet.photo_name}">`
                                            : ""
                                        }
                            </div>
                        </div>
                        <div class="pet-desc">
                            ${pet.description || ""}
                        </div>
                        <div class="pet-process">
                            ${pet.process_status || ""}
                        </div>
                        <div class="pet-contact">
                            Звʼязатися з автором
                        </div>
                    </div>
                    `);
    });
}

let currentStatus = null;

const btnAll = document.getElementById("btnAll");
const btnLost = document.getElementById("btnLost");
const btnFound = document.getElementById("btnFound");

const buttons = [btnAll, btnLost, btnFound];

// Функція для підсвічування активної кнопки
function setActiveButton(activeBtn) {
    buttons.forEach(btn => {
        if (btn === activeBtn) {
            btn.classList.remove("inactive");
        } else {
            btn.classList.add("inactive");
        }
    });
}

btnAll.onclick = () => {
    currentStatus = null;
    setActiveButton(btnAll);
    loadFilteredPets();
};

btnLost.onclick = () => {
    currentStatus = "lost";
    setActiveButton(btnLost);
    loadFilteredPets();
};

btnFound.onclick = () => {
    currentStatus = "found";
    setActiveButton(btnFound);
    loadFilteredPets();
};

document.getElementById("btnFilters").onclick = () => {
    const panel = document.getElementById("filtersPanel");
    panel.style.display = panel.style.display === "none" ? "flex" : "none";
};

