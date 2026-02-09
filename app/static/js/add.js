const params = new URLSearchParams(location.search);
const petId = params.get("id"); 
const isEdit = !!petId;

const nameInput = document.getElementById("name");
const speciesInput = document.getElementById("species");
const breedInput = document.getElementById("breed");
const statusInput = document.getElementById("status");
const descriptionInput = document.getElementById("description");
const photoInput = document.getElementById("photo-input");

const form = document.querySelector(".animal-form");
const submitBtn = document.querySelector(".btn-submit");
const deleteBtn = document.querySelector(".btn-delete");

let currentLat = params.get("lat");
let currentLng = params.get("lng");

if (currentLat) currentLat = parseFloat(currentLat);
if (currentLng) currentLng = parseFloat(currentLng);


if (isEdit) {
    submitBtn.textContent = "Зберегти";
    deleteBtn.hidden = false;

    loadPet();
}

async function loadPet() {
    try {
        const res = await fetch(`/api/pets/${petId}`);
        const pet = await res.json();

        nameInput.value = pet.name || "";
        speciesInput.value = pet.species || "";
        breedInput.value = pet.breed || "";
        statusInput.value = pet.status || "";
        descriptionInput.value = pet.description || "";

        currentLat = pet.lat;
        currentLng = pet.lng;

        if (pet.photo_name) {
            const preview = document.querySelector(".photo-upload img");
            preview.src = `/static/uploads/${pet.photo_name}`; 
        }

    } catch (err) {
        alert("Не вдалося завантажити дані тварини");
        console.error(err);
    }
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", nameInput.value);
    formData.append("species", speciesInput.value);
    formData.append("breed", breedInput.value);
    formData.append("status", statusInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("lat", currentLat);
    formData.append("lng", currentLng);

    if (photoInput.files[0]) {
        formData.append("photo", photoInput.files[0]);
    }

    let url = "/api/pets";
    let method = "POST";

    if (isEdit) {
        url = `/api/pets/${petId}`;
        method = "PUT";
    }

    try {
        const res = await fetch(url, {
            method,
            credentials: "include",
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            alert("Тварину збережено");
            window.location.href = "/profile";
        } else {
            alert(result.error);
        }

    } catch (err) {
        console.error(err);
        alert("Помилка з'єднання з сервером");
    }
});


deleteBtn.addEventListener("click", async () => {
    if (!confirm("Видалити тварину?")) return;

    try {
        const res = await fetch(`/api/pets/${petId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const result = await res.json();

        if (result.success) {
            alert("Тварину видалено");
            window.location.href = "/profile";
        } else {
            alert(result.error);
        }

    } catch (err) {
        console.error(err);
        alert("Помилка видалення");
    }
});
