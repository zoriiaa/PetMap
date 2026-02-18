const urlParams = new URLSearchParams(window.location.search);
const lat = urlParams.get('lat');
const lng = urlParams.get('lng');

const petId = document.getElementById('btn-delete')?.dataset.petId;
const isEdit = !!petId;

const nameInput = document.getElementById('name');
const speciesInput = document.getElementById('species');
const breedInput = document.getElementById('breed');
const statusInput = document.getElementById('status');
const descriptionInput = document.getElementById('description');

const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview'); // img для preview
const form = document.getElementById('pet-form');
const btnSubmit = document.querySelector('.btn-submit');
const btnCancel = document.getElementById('btn-cancel');
const btnDelete = document.getElementById('btn-delete');

if (photoInput && photoPreview) {
    photoInput.addEventListener('change', () => {
        const file = photoInput.files[0];
        if (file) {
            photoPreview.src = URL.createObjectURL(file);
            photoPreview.style.display = 'block';
        }
    });
}

if (isEdit) {
    btnSubmit.textContent = "Зберегти";
    if (btnDelete) btnDelete.hidden = false;

    async function loadPet() {
        try {
            const res = await fetch(`/api/pets/${petId}`);
            const pet = await res.json();

            nameInput.value = pet.name || '';
            speciesInput.value = pet.species || '';
            breedInput.value = pet.breed || '';
            statusInput.value = pet.status || '';
            descriptionInput.value = pet.description || '';

            // Встановимо фото якщо є
            if (pet.photo_name && photoPreview) {
                photoPreview.src = `/static/uploads/${pet.photo_name}`;
                photoPreview.style.display = 'block';
            }

        } catch (err) {
            alert('Не вдалося завантажити дані тварини');
            console.error(err);
        }
    }

    loadPet();
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!lat || !lng) {
            alert('Координати не вказані. Поверніться на карту і оберіть місце.');
            return;
        }

        const formData = new FormData();
        formData.append('name', nameInput.value);
        formData.append('species', speciesInput.value);
        formData.append('breed', breedInput.value);
        formData.append('status', statusInput.value);
        formData.append('description', descriptionInput.value);
        formData.append('lat', lat);
        formData.append('lng', lng);

        if (photoInput.files[0]) {
            formData.append('photo', photoInput.files[0]);
        }

        let url = '/api/pets';
        let method = 'POST';
        if (isEdit) {
            url = `/api/pets/${petId}`;
            method = 'PUT';
        }

        try {
            const res = await fetch(url, { method, body: formData, credentials: 'include' });
            const result = await res.json();

            if (result.success) {
                window.location.href = '/profile';
            } else {
                alert('Помилка: ' + (result.error || 'невідома помилка'));
            }

        } catch (err) {
            console.error(err);
            alert('Помилка підключення до сервера');
        }
    });
}

if (btnCancel) {
    btnCancel.addEventListener('click', () => {
        window.location.href = '/profile';
    });
}

if (btnDelete) {
    btnDelete.addEventListener('click', async () => {
        if (!confirm('Ви впевнені, що хочете видалити цю тварину?')) return;

        try {
            const res = await fetch(`/api/pets/${petId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const result = await res.json();

            if (result.success) {
                window.location.href = '/profile';
            } else {
                alert('Помилка: ' + (result.error || 'невідома помилка'));
            }

        } catch (err) {
            console.error(err);
            alert('Помилка підключення до сервера');
        }
    });
}
;




