// Редагування профілю
const btnEdit = document.getElementById('btn-edit-profile');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel-edit');
const infoView = document.getElementById('info-view');
const infoEdit = document.getElementById('info-edit');

btnEdit.addEventListener('click', () => {
    infoView.style.display = 'none';
    infoEdit.style.display = 'flex';
    btnEdit.style.display = 'none';
});

btnCancel.addEventListener('click', () => {
    infoView.style.display = 'flex';
    infoEdit.style.display = 'none';
    btnEdit.style.display = 'flex';
});

btnSave.addEventListener('click', async () => {
    const name = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();

    if (!name || !email) {
        alert('Заповніть всі поля');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);

    try {
        const response = await fetch('/api/user/update', {
            method: 'PUT',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            document.getElementById('display-name').textContent = name;
            document.getElementById('display-email').textContent = email;
            infoView.style.display = 'flex';
            infoEdit.style.display = 'none';
            btnEdit.style.display = 'flex';
        } else {
            alert('Помилка: ' + result.error);
        }
    } catch (err) {
        alert('Помилка підключення до сервера');
    }
});

// Вийти з акаунту
document.getElementById('btn-logout').addEventListener('click', () => {
    window.location.href = '/logout';
});

// Змінити пароль
document.getElementById('btn-change-password').addEventListener('click', () => {
    const old_password = prompt('Введіть старий пароль:');
    if (!old_password) return;

    const new_password = prompt('Введіть новий пароль:');
    if (!new_password) return;

    const formData = new FormData();
    formData.append('old_password', old_password);
    formData.append('new_password', new_password);

    fetch('/api/user/password', { method: 'PUT', body: formData })
        .then(r => r.json())
        .then(result => {
            if (result.success) {
                alert('Пароль змінено успішно!');
            } else {
                alert('Помилка: ' + result.error);
            }
        })
        .catch(() => alert('Помилка підключення до сервера'));
});