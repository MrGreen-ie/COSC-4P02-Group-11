# For Login page, signup page and sign out function
from flask import Blueprint, render_template, request, flash, redirect, url_for, request

# for db
from .models import User
from . import db  ##means from __init__.py import db

# import from flash_login to hash password, securely storing password intead of storing them in  in plain text
# converting password  to something more secure (hash -> does not have an inverse )
# hash password, basically can only check the entered password == to the hash(password) not the way around
from werkzeug.security import generate_password_hash, check_password_hash

# you can not access the home page unless yourre logged in
# these import are the reeason why for UserMixer in the models.py so that we can use the current_user object to access the current user
from flask_login import login_user, login_required, logout_user, current_user

auth = Blueprint("auth", __name__)


# route to /login
@auth.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        user = User.query.filter_by(email=email).first()
        if user:
            if check_password_hash(user.password, password):
                login_user(user, remember=True)
                return {
                    "message": "Logged in successfully!",
                    "user": {
                        "email": user.email,
                        "firstName": user.first_name
                    }
                }, 200
            else:
                return {"error": "Incorrect password"}, 401
        else:
            return {"error": "Email does not exist"}, 404

    return {"error": "Invalid request method"}, 405


# route to sign up page
@auth.route("/sign-up", methods=["GET", "POST"])
def sign_up():
    if request.method == "POST":
        data = request.get_json()
        email = data.get("email")
        first_name = data.get("firstName")
        password = data.get("password")

        # check if the user has already existed
        user = User.query.filter_by(email=email).first()
        if user:
            return {"error": "Email already exists"}, 400

        # some conditions
        if not email or len(email) < 4:
            return {"error": "Email must be greater than 3 characters."}, 400
        elif not first_name or len(first_name) < 2:
            return {"error": "First name must be greater than 1 character."}, 400
        elif not password or len(password) < 7:
            return {"error": "Password must be at least 7 characters"}, 400
        else:
            # add user to db
            new_user = User(
                email=email,
                first_name=first_name,
                password=generate_password_hash(password, method="pbkdf2:sha256"),
            )
            # add newly created user to database
            db.session.add(new_user)
            # add and then commit(update)
            db.session.commit()
            # remember=true for flask is to remember user login
            login_user(new_user, remember=True)
            return {"message": "Account created successfully!"}, 201

    return {"error": "Invalid request method"}, 405


@auth.route("/logout")
# decorator -> make sure that we cannot acces the  def logout() or root /logout unless the user is logged_in, basically we not be able to logout if we not login
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
