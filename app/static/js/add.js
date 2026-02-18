document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const lat = params.get("lat");
    const lng = params.get("lng");
    const petId = params.get("id");

    const isEdit = !!petId;

    const form = document.getElementById("pet-form");
    const btnSubmit = document.getElementById("btn-submit");
    const btnCancel = document.getElementById("btn-cancel");
    const btnDelete = document.getElementById("btn-delete");
    const dangerZone = document.getElementById("danger-zone");

    const nameInput = document.getElementById("name");
    const speciesInput = document.getElementById("species");
    const breedInput = document.getElementById("breed");
    const statusInput = document.getElementById("status");
    const descriptionInput = document.getElementById("description");
    const dateInput = document.getElementById("date");

    const photoInput = document.getElementById("photo-input");
    const uploadArea = document.getElementById("upload-area");
    const photoPreview = document.getElementById("photo-preview");

    const foundRadio = document.getElementById("found");
    const lostRadio = document.getElementById("lost");


    function updatePlaceholder() {
        if (foundRadio.checked) {
            descriptionInput.placeholder =
                "Опишіть де і за яких обставин ви знайшли тварину";
        } else {
            descriptionInput.placeholder =
                "Детальний опис зовнішності тварини, особливі прикмети";
        }
    }

    foundRadio.addEventListener("change", updatePlaceholder);
    lostRadio.addEventListener("change", updatePlaceholder);
    updatePlaceholder();


    if (uploadArea && photoInput) {
        uploadArea.addEventListener("click", () => {
            photoInput.click();
        });
    }

    if (photoInput && photoPreview) {
        photoInput.addEventListener("change", () => {
            const file = photoInput.files[0];
            if (file) {
                photoPreview.src = URL.createObjectURL(file);
                photoPreview.style.display = "block";
            }
        });
    }


    if (isEdit) {
        btnSubmit.textContent = "Зберегти";
        dangerZone.style.display = "block";
        loadPet();
    }

    async function loadPet() {
        try {
            const res = await fetch(`/api/pets/${petId}`, {
                credentials: "include"
            });

            const pet = await res.json();

            nameInput.value = pet.name || "";
            speciesInput.value = pet.species || "";
            breedInput.value = pet.breed || "";
            statusInput.value = pet.status || "";
            descriptionInput.value = pet.description || "";
            dateInput.value = pet.date || "";

            if (pet.type === "lost") {
                lostRadio.checked = true;
            } else {
                foundRadio.checked = true;
            }

            updatePlaceholder();

            if (pet.photo_name) {
                photoPreview.src = `/static/uploads/${pet.photo_name}`;
                photoPreview.style.display = "block";
            }

        } catch (err) {
            alert("Не вдалося завантажити дані");
            console.error(err);
        }
    }


    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!lat || !lng) {
                alert("Координати не передані з карти");
                return;
            }

            const formData = new FormData();

            formData.append("name", nameInput.value);
            formData.append("species", speciesInput.value);
            formData.append("breed", breedInput.value);
            formData.append("status", statusInput.value);
            formData.append("description", descriptionInput.value);
            formData.append("date", dateInput.value);
            formData.append("lat", lat);
            formData.append("lng", lng);
            formData.append("type", foundRadio.checked ? "found" : "lost");

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
                    method: method,
                    body: formData,
                    credentials: "include"
                });

                const result = await res.json();

                if (result.success) {
                    window.location.href = "/profile";
                } else {
                    alert(result.error || "Помилка збереження");
                }

            } catch (err) {
                console.error(err);
                alert("Помилка сервера");
            }
        });
    }


    if (btnDelete) {
        btnDelete.addEventListener("click", async () => {

            if (!confirm("Ви впевнені, що хочете видалити?")) return;

            try {
                const res = await fetch(`/api/pets/${petId}`, {
                    method: "DELETE",
                    credentials: "include"
                });

                const result = await res.json();

                if (result.success) {
                    window.location.href = "/profile";
                } else {
                    alert(result.error || "Помилка видалення");
                }

            } catch (err) {
                alert("Помилка сервера");
            }
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener("click", () => {
            window.location.href = "/profile";
        });
    }

});
