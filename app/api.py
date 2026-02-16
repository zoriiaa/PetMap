from flask import jsonify, request
from flask_login import login_required, current_user
from app import app, db
from app.models import Pet
import os
from werkzeug.utils import secure_filename

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
    """API для додавання нової тварини на карту"""
    try:
        data = request.get_json()

        if not data.get('lat') or not data.get('lng'):
            return jsonify({
                'success': False,
                'error': 'Координати обов\'язкові'
            }), 400

        if not data.get('species'):
            return jsonify({
                'success': False,
                'error': 'Вид тварини обов\'язковий'
            }), 400

        photo_name = None
        if 'photo' in request.files:
            photo_name = save_photo(request.files['photo'])

        # Створення тварини
        pet = Pet(
            name=data.get('name'),
            species=data.get('species'),
            breed=data.get('breed'),
            description=data.get('description'),
            lat=float(data['lat']),
            lng=float(data['lng']),
            photo_name=photo_name,
            status=data.get('status', 'lost'),
            process_status='active',
            user_id=current_user.get_id()
        )

        db.session.add(pet)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Тварину успішно додано на карту',
            'pet': pet.to_dict()
        }), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': 'Невірний формат координат'
        }), 400
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
    """API для оновлення інформації про тварину"""
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
                'error': 'Ви не маєте права редагувати цю тварину'
            }), 403

        data = request.get_json()

        # Оновлення полів
        if 'name' in data:
            pet.name = data['name']
        if 'species' in data:
            pet.species = data['species']
        if 'breed' in data:
            pet.breed = data['breed']
        if 'description' in data:
            pet.description = data['description']
        if 'status' in data:
            pet.status = data['status']
        if 'process_status' in data:
            pet.process_status = data['process_status']
        if 'lat' in data:
            pet.lat = float(data['lat'])
        if 'lng' in data:
            pet.lng = float(data['lng'])

            # Оновлення фото якщо передали нове
        if 'photo' in request.files and request.files['photo'].filename != '':
            new_photo = save_photo(request.files['photo'])
            if new_photo:
                pet.photo_name = new_photo

        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Інформацію оновлено',
            'pet': pet.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


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
