from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from os import path
from flask_login import LoginManager
from flask_cors import CORS
from flask import Flask
import os
from dotenv import load_dotenv
from flask_mail import Mail

# Load environment variables from .env file
load_dotenv()

# Also load from .env.local if it exists (overrides .env)
if os.path.exists('.env.local'):
    load_dotenv('.env.local', override=True)
    print("Loaded environment variables from .env.local")

db = SQLAlchemy()
DB_NAME = "database.db"

# Global variable to hold the scheduler instance
scheduler = None

migrate = Migrate()
login_manager = LoginManager()
mail = Mail()

def create_app():
    global scheduler
    app = Flask(__name__, static_folder='static', template_folder='templates')
    
    # Load configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', f'sqlite:///{DB_NAME}'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        OPENAI_API_KEY=os.environ.get('OPENAI_API_KEY', ''),
        NEWS_API_KEY=os.environ.get('NEWS_API_KEY', ''),
        # Mail settings
        MAIL_SERVER=os.environ.get('MAIL_SERVER', 'smtp.gmail.com'),
        MAIL_PORT=int(os.environ.get('MAIL_PORT', 587)),
        MAIL_USE_TLS=os.environ.get('MAIL_USE_TLS', 'True') == 'True',
        MAIL_USERNAME=os.environ.get('MAIL_USERNAME', ''),
        MAIL_PASSWORD=os.environ.get('MAIL_PASSWORD', ''),
        MAIL_DEFAULT_SENDER=os.environ.get('MAIL_DEFAULT_SENDER', 'noreply@example.com'),
    )
    
    # Configure CORS properly with credentials support
    CORS(app, 
         resources={r"/*": {"origins": "http://localhost:3000"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    db.init_app(app)
    migrate.init_app(app, db)  # Important: Initialize Flask-Migrate here

    from .views import views
    from .auth import auth

    # you need to register blueprint from both auth and views.py
    app.register_blueprint(views, url_prefix="/")
    app.register_blueprint(auth, url_prefix="/")

    # check if the db has created before running the server
    from .models import User, Note, ScheduledPost, Article, FavoriteArticle

    # db function called
    with app.app_context():
        db.create_all()
        
        # Create temp_media directory for file uploads
        media_dir = os.path.join(app.root_path, 'temp_media')
        if not os.path.exists(media_dir):
            os.makedirs(media_dir)

    # manage user login
    login_manager.login_view = "auth.login"
    login_manager.init_app(app)

    # telling flask how we load a user, what user we looking for
    @login_manager.user_loader
    def load_user(id):
        #  work similar to filter that look for primary key id in db you don thave  to id =
        return User.query.get(int(id))
    
    # Initialize the scheduler for scheduled posts
    from .scheduler import init_scheduler
    global scheduler
    scheduler = init_scheduler(app)

    # Initialize Flask-Mail
    mail.init_app(app)

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
