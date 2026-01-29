from app import db
from datetime import datetime
from sqlalchemy import  func


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False, index=True)
    email = db.Column(db.String, unique=True, nullable=False, index=True)
    psw = db.Column(db.String(128), nullable=False)

    pets = db.relationship('Pet', backref='author', lazy='dynamic')

class Pet(db.Model):
    __tablename__ = 'pets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20))
    species = db.Column(db.String(30), nullable=False)  # 'cat', 'dog' тощо
    breed = db.Column(db.String(50)) # порода
    description = db.Column(db.Text)

    lat = db.Column(db.Float, nullable=False) # latitude - широта
    lng = db.Column(db.Float, nullable=False) # longitude - довгота

    photo_name = db.Column(db.String(100))  # Тільки ім'я файлу
    status = db.Column(db.String(20), default='lost')  # 'lost' або 'found'
    process_status = db.Column(db.String(30), nullable=False, default='active')  # що з нею зараз (активно, вирішено, тимчасово забрали до себе, веземо у притулок, веземо у ветклініку)
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow) # Дата створення оголошення

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'species': self.species,
            'breed': self.breed,
            'lat': self.lat,
            'lng': self.lng,
            'photo': self.photo_name,
            'status': self.status,
            'process_status':self.process_status,
            'date': self.timestamp.strftime('%Y-%m-%d')
        }
