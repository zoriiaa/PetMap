document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("petsContainer");
    if (!container) return;

    const userId = container.dataset.userId;
    if (!userId) {
        console.error("USER ID missing");
        return;
    }
    
    console.log("USER ID:", userId);

    loadUserPets(userId);
});




async function loadUserPets(userId) {
    try {
        const res = await fetch(`/api/pets/user/${userId}`);

        if (!res.ok) throw new Error("HTTP " + res.status);

        const pets = await res.json();

        const container = document.getElementById("petsContainer");
        container.innerHTML = "";

        pets.forEach(pet => {
            const card = document.createElement("div");
            card.className = "pet-card";

            const firstPhoto = pet.photos && pet.photos.length > 0 ? pet.photos[0] : "";

            card.innerHTML = `
                <div class="pet-left">
                    <img src="${firstPhoto ? `/static/uploads/${firstPhoto}` : '/static/img/default-pet.png'}" class="pet-image">
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
                        <p class="bread">${pet.breed || ""}</p>
                        <p class="description">${pet.description || ""}</p>
                        <p class="date">
                            Додано: ${pet.created_at || ""}
                        </p>
                    </div>
                </div>

                <div class="pet-right">
                    <button onclick="window.location.href='/pet/edit?id=${pet.id}'">
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







