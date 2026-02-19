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
                <div class="animal-card">
            
                    <img 
                        src="${firstPhoto ? `/static/uploads/${firstPhoto}` : '/static/img/default-pet.png'}" 
                        class="animal-photo"
                    >
            
                    <div class="animal-info">
            
                        <div class="animal-header">
                            <h3>${pet.name || "Без імені"}</h3>
            
                            <div class="status-badge ${
                                pet.status === "lost" ? "status-saved" : "status-found"
                            }">
                                ${pet.status === "lost" ? "Загублена" : "Знайдена"}
                            </div>
                        </div>
            
                        <div class="animal-type">
                            ${pet.species || ""}
                        </div>
            
                        <div class="animal-desc">
                            ${pet.breed || ""} ${pet.description || ""}
                        </div>
            
                        <div class="animal-date">
                            Додано: 
                            <span>${pet.created_at || ""}</span>
                        </div>
            
                    </div>
            
                    <div class="animal-actions">
                        <button 
                            class="btn-edit"
                            onclick="window.location.href='/pet/edit?id=${pet.id}'"
                        >
                            Редагувати
                        </button>
                    </div>
            
                </div>
            `;


            container.appendChild(card);
        });

    } catch (error) {
        console.error("Помилка:", error);
    }
}








