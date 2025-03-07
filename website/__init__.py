from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

db = SQLAlchemy()
DB_NAME = "database.db"

# Global variable to hold the scheduler instance
scheduler = None


def create_app():
    app = Flask(__name__)
    
    # Configure CORS properly with credentials support
    CORS(app, 
         resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"]}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    app.static_folder = "static"
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "super_secret_key_for_twitter_auth")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DB_NAME}"
    db.init_app(app)

    # Import blueprints here to avoid circular imports
    from .views import views
    from .auth import auth

    # you need to register blueprint from both auth and views.py
    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    # check if the db has created before running the server
    from .models import User, Note, ScheduledPost

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
    
    # Initialize the scheduler for scheduled posts
    # Import here to avoid circular imports
    from .scheduler import init_scheduler
    global scheduler
    scheduler = init_scheduler(app)

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

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
