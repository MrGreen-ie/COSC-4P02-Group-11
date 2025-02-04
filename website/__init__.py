from flask import Flask

# for db
from flask_sqlalchemy import SQLAlchemy

# for create_database(app)
from os import path

# we need to tell flask how a user actually log in, how to find a user, LoginManager helps us to manage login related things
from flask_login import LoginManager
from flask_cors import CORS

db = SQLAlchemy()
DB_NAME = "database.db"


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.static_folder = "static"
    app.config["SECRET_KEY"] = "super secret key"
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
    db.init_app(app)

    from .views import views
    from .auth import auth

    # you need to register blueprint from both auth and views.py
    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    # check if the db has created before running the server
    from .models import User, Note

    # db function called
    create_database(app)

    # manage user login
    login_manager = LoginManager()
    # where should flask redirectes us if the user is not logged in, when a loggin require
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    # telling flask how we load a user, what user we looking for
    @login_manager.user_loader
    def load_user(id):
        #  work similar to filter that look for primary key id in db you don thave  to id =
        return User.query.get(int(id))

    return app


# check if the db existed, if already we dont want to overwrite it
def create_database(app):
    # using path model to check if the db model is existed
    if not path.exists("website/" + DB_NAME):
        # if not we create, app is which app we crreate db for
        # old flask version
        # db.create_all(app=app)
        with app.app_context():
            db.create_all()
        print("Created Database!")
