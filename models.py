from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Model for storing AI-generated summaries
class AIGeneratedSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text, nullable=False)  # Original text
    summary = db.Column(db.Text, nullable=False)  # AI-generated summary

# Model for storing templates
class Template(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)  # Template text

# Function to initialize the database
def init_app(app):
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"  # SQLite database file
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
