from flask import jsonify, request
from flask_login import login_required, current_user
from app import app, db
from app.models import Pet
import os
from werkzeug.utils import secure_filename
from app.models import User

UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_photo(file):
    """Зберігає фото у папку uploads, повертає ім'я файлу або None"""
    if not file or file.filename == '':
        return None
    if not allowed_file(file.filename):
        return None
    filename = secure_filename(file.filename)
    file.save(os.path.join(UPLOAD_FOLDER, filename))
    return filename

# GET /api/pets - отримання всіх тварин
@app.route("/api/pets", methods=['GET'])
def get_pets():
    """API для отримання геоданих всіх тварин"""
    try:
        status = request.args.get('status')

        query = Pet.query

        if status:
            query = query.filter_by(status=status)

        pets = query.all()

        return jsonify([pet.to_dict() for pet in pets]), 200

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# POST /api/pets - додавання нової тварини
@app.route("/api/pets", methods=['POST'])
@login_required
def add_pet():
    try:
        # беремо дані з форми
        name = request.form.get('name')
        species = request.form.get('species')
        breed = request.form.get('breed')
        description = request.form.get('description')
        status = request.form.get('status', 'lost')
        lat = request.form.get('lat')
        lng = request.form.get('lng')

        if not lat or not lng:
            return jsonify({
                'success': False,
                'error': 'Координати обов\'язкові'
            }), 400

        if not species:
            return jsonify({
                'success': False,
                'error': 'Вид тварини обов\'язковий'
            }), 400

        # фото
        photo_name = None
        photo = request.files.get('photo')
        if photo:
            photo_name = save_photo(photo)

        pet = Pet(
            name=name,
            species=species,
            breed=breed,
            description=description,
            lat=float(lat),
            lng=float(lng),
            photo_name=photo_name,
            status=status,
            process_status='active',
            user_id=int(current_user.get_id())
        )

        db.session.add(pet)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Тварину успішно додано на карту',
            'pet': pet.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500



# GET /api/pets/<id> - отримання конкретної тварини
@app.route("/api/pets/<int:pet_id>", methods=['GET'])
def get_pet(pet_id):
    """API для отримання інформації про конкретну тварину"""
    try:
        pet = Pet.query.get(pet_id)

        if not pet:
            return jsonify({
                'success': False,
                'error': 'Тварину не знайдено'
            }), 404

        return jsonify(pet.to_dict()), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# PUT /api/pets/<id> - оновлення інформації про тварину
@app.route("/api/pets/<int:pet_id>", methods=['PUT'])
@login_required
def update_pet(pet_id):
    try:
        pet = Pet.query.get(pet_id)

        if not pet:
            return jsonify({'success': False, 'error': 'Тварину не знайдено'}), 404

        if pet.user_id != int(current_user.get_id()):
            return jsonify({'success': False, 'error': 'Немає доступу'}), 403

        data = request.form

        pet.name = data.get('name')
        pet.species = data.get('species')
        pet.breed = data.get('breed')
        pet.description = data.get('description')
        pet.status = data.get('status')

        if data.get('lat'):
            pet.lat = float(data.get('lat'))
        if data.get('lng'):
            pet.lng = float(data.get('lng'))

        photo = request.files.get('photo')
        if photo and photo.filename != '':
            new_photo = save_photo(photo)
            if new_photo:
                pet.photo_name = new_photo

        db.session.commit()

        return jsonify({'success': True}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500


# DELETE /api/pets/<id> - видалення тварини
@app.route("/api/pets/<int:pet_id>", methods=['DELETE'])
@login_required
def delete_pet(pet_id):
    """API для видалення тварини з карти"""
    try:
        pet = Pet.query.get(pet_id)

        if not pet:
            return jsonify({
                'success': False,
                'error': 'Тварину не знайдено'
            }), 404

        # Перевірка чи користувач є власником
        if pet.user_id != int(current_user.get_id()):
            return jsonify({
                'success': False,
                'error': 'Ви не маєте права видаляти цю тварину'
            }), 403

        db.session.delete(pet)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Тварину видалено'
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# GET /api/pets/user/<user_id> - отримання тварин конкретного користувача
@app.route("/api/pets/user/<int:user_id>", methods=['GET'])
def get_user_pets(user_id):
    """API для отримання всіх тварин конкретного користувача"""
    try:
        pets = Pet.query.filter_by(user_id=user_id).all()

        return jsonify([pet.to_dict() for pet in pets]), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/user/update", methods=['PUT'])
@login_required
def update_user():
    try:
        data = request.form
        user = User.query.get(int(current_user.get_id()))

        if data.get('name'):
            user.name = data.get('name')

        if data.get('email'):
            user.email = data.get('email')

        db.session.commit()

        return jsonify({'success': True}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route("/api/user/password", methods=['PUT'])
@login_required
def update_password():
    if not current_user.is_authenticated:
        return jsonify({'success': False, 'error': 'Не авторизований'}), 401
    try:
        data = request.form
        user = User.query.get(int(current_user.get_id()))

        old_psw = data.get('old_password')
        new_psw = data.get('new_password')

        if not user.check_password(old_psw):
            return jsonify({'success': False, 'error': 'Невірний старий пароль'}), 400

        if len(new_psw) <= 4:
            return jsonify({'success': False, 'error': 'Пароль занадто короткий'}), 400

        user.set_password(new_psw)
        db.session.commit()
        return jsonify({'success': True})

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
