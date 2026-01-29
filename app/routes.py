from app import app, db, login_manager
from app.models import User, Pet
from flask_login import login_required, login_user, logout_user, current_user
from flask import render_template, request, redirect, url_for, flash, make_response, session, jsonify
from email_validator import validate_email, EmailNotValidError
from app.UserLogin import UserLogin


@login_manager.user_loader
def load_user(user_id):
    user = User.query.get(int(user_id))
    if user:
        return UserLogin(user)
    return None


@app.route("/")
def index():
    return render_template("golovna.html")


@app.route("/profile")
@login_required
def profile():
    return "Профіль"


@app.route("/settings")
@login_required
def settings():
    return "Налаштування"


@app.route("/register", methods=["POST", "GET"])
def register():
    if request.method == "POST":
        name = request.form['name']
        email = request.form['email']
        psw = request.form['psw']

        if len(name) <= 4:
            flash("Ім'я занадто коротке", "error")
        elif len(psw) <= 4:
            flash("Пароль занадто короткий", "error")
        else:
            try:
                valid = validate_email(email)
                email = valid.email
            except EmailNotValidError as e:
                flash(f"Не вірний email: {str(e)}", "error")
                return redirect('/register')

            if User.query.filter_by(email=email).first():
                flash("Користувач з таким email вже існує!", "error")
                return redirect("/register")
            user = User(
                email=email,
                name=name
            )
            user.set_password(psw)

            db.session.add(user)
            db.session.commit()
            session["email"] = email
            flash("Реєстрація успішна!", "success")
            return redirect("/login")
    return render_template('registration.html')


@app.route("/login", methods=["POST", "GET"])
def login():
    if request.method == "POST":
        email = request.form['email']
        psw = request.form['psw']

        user = User.query.filter_by(email=email).first()
        if user and user.check_password(psw):
            remember = True if request.form.get("remember") else False
            login_user(UserLogin(user), remember=remember)
            flash("Вхід успішний!", "success")
            res = make_response(redirect(url_for('profile', name=user.name)))
            res.set_cookie("logged", "yes", max_age=30 * 24 * 3600)  # 30 днів
            return res
        else:
            flash("Невірний email або пароль", "error")
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash("Ви вийшли з профілю", "success")
    res = make_response(redirect(url_for('login')))
    res.set_cookie("logged", "", 0)
    return res


@app.route("/map_mark")
@login_required
def map_mark():
    return render_template("map2.html")


@app.route("/marks")
@login_required
def marks():
    return "Відмітки"


@app.route("/map")
@login_required
def map():
    return render_template("map.html")
