loadUserPets();

async function loadUserPets() {

    try {
        const res = await fetch(`/api/pets/user/${userId}`);
        const pets = await res.json();

        const container = document.getElementById("petsContainer");
        container.innerHTML = "";

        pets.forEach(pet => {

            const card = document.createElement("div");
            card.className = "pet-card";

            card.innerHTML = `
                <div class="pet-left">
                    <img src="/static/uploads/${pet.photo_name}" class="pet-image">
                </div>

                <div class="pet-middle">
                    <div class="pet-title">
                        <h3>${pet.name || "Без імені"}</h3>
                        <span class="status ${pet.status}">
                            ${pet.status === "lost" ? "Загублена" : "Знайдена"}
                        </span>
                        <p class="species">${pet.species}</p>
                    </div>
                    <div class="pet-info">
                        <p class="bread">${pet.bread}</p>
                        <p class="description">${pet.description || ""}</p>
                        <p class="date">
                            Додано: ${pet.created_at || ""}
                        </p>
                    </div>
                </div>
                <div class="pet-right">
                    <button onclick="window.location.href='/pet_form?id=${pet.id}'">
                        Редагувати
                    </button>
                </div>
            `;

            container.appendChild(card);

        });

    } catch (error) {
        console.error("Помилка:", error);
    }
}

function editPet(id) {
    window.location.href = `/pet/edit/${id}`;
}

