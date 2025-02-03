from flask import Flask
from routes.ai import ai_bp
from routes.templates import templates_bp
from models import db, init_app  # Import database setup

app = Flask(__name__)

# Initialize the database
init_app(app)

@app.route('/')
def home():
    return "xxxxx"

@app.route('/test')
def test():
    return "Test route is working!"

app.register_blueprint(ai_bp, url_prefix='/api/ai')
app.register_blueprint(templates_bp, url_prefix='/api/templates')

if __name__ == '__main__':
    with app.app_context():  
        db.create_all()  # This ensures tables are created
    app.run(debug=True)
