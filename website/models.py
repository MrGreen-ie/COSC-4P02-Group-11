# set up db models, for user and note, db model -> blueprint for objects that is stored in db
# import db from __init__py.
from . import db

# Usermixin for inheret user object
from flask_login import UserMixin

from sqlalchemy.sql import func


# for user note
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data = db.Column(db.String(10000))
    # whenever a note is created, func is called, get whatever time it is the stored inside db.DateTime(timezone=true)
    date = db.Column(db.DateTime(timezone=True), default=func.now())
    # basically a foreign key that point a particular  user, user can create multiple notes, 1 to many relationship, 1 user has many notes
    # for user.id, python class name must create capitalized name , db is lower case
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))


# user db chema
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))
    first_name = db.Column(db.String(150))
    # tell flask and sql do the magic, list store diff notes, uppercase 'Note'
    notes = db.relationship("Note")
    # Relationship with scheduled posts
    scheduled_posts = db.relationship("ScheduledPost")


# Social media post scheduling model
class ScheduledPost(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(1000))
    platforms = db.Column(db.String(200))  # Comma-separated list of platforms
    scheduled_time = db.Column(db.DateTime(timezone=True))
    status = db.Column(db.String(50), default="scheduled")  # scheduled, posted, failed
    error_message = db.Column(db.String(500))
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    
    # Store encrypted API keys - these would be set up per user in a production app
    # In a real app, these would be in a separate table with proper encryption
    twitter_token = db.Column(db.String(500))
    facebook_token = db.Column(db.String(500))
    linkedin_token = db.Column(db.String(500))
