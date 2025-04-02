# Standard Library Imports
# for home page (what features inside /(home) page)
from email.mime.text import MIMEText
import random
import smtplib
import uuid
from flask import Blueprint, current_app, render_template, request, flash, jsonify, redirect, session, url_for
from flask_login import login_required, current_user
from .models import Note, User, ScheduledPost, SavedSummary, FavoriteSummary
from . import db
from .cache import redis_cache
from .content_processor import process_content, preprocess_for_gemini
from .content_filter import filter_content
from .async_processor import async_processor, compress_content, decompress_content, chunk_content
import json
import requests
import markdown
from datetime import datetime
import pytz
from cryptography.fernet import Fernet
import base64
import os
from os import environ
import google.generativeai as genai
import time
import hmac
import hashlib
from werkzeug.utils import secure_filename
from flask import request, jsonify
from .models import db, SavedContent
from flask_login import login_required, current_user
from datetime import datetime, timedelta
from functools import wraps


# for environment variables
from dotenv import load_dotenv
# Load environment variables
load_dotenv()

# Gemini API initialization
try:
    # Initialize Gemini API client
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    # Set up the model
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("Gemini API initialized successfully")
except Exception as e:
    print(f"Error initializing Gemini API: {str(e)}")
    model = None

# For API key encryption (in production, use a proper key management system)
# This is a simple implementation for demonstration purposes
def get_encryption_key():
    # In production, this should be stored securely and not hardcoded
    key = os.environ.get('ENCRYPTION_KEY', 'YourSecretKeyForEncryption1234567890123456')
    # Ensure the key is the correct length for Fernet (32 bytes)
    return base64.urlsafe_b64encode(key.encode()[:32].ljust(32, b'\0'))

def encrypt_api_key(api_key):
    f = Fernet(get_encryption_key())
    return f.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key):
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_key.encode()).decode()

# views blueprint
views = Blueprint("views", __name__)

# Email configuration
EMAIL_ADDRESS = os.getenv('EMAIL_ADDRESS')
EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD')

# Email/Newsletter API routes
@views.route('/api/newsletter/subscribe', methods=['POST'])
@login_required
def send_email():
    data = request.json
    recipient = data['recipient']
    subject = data['subject']
    body = data['body']
    newsletter_id = data['newsletter_id']

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = 'cosc.4p02.summit@gmail.com'
    msg['To'] = recipient

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login('cosc.4p02.summit@gmail.com', 'kght ejuo omgw oqru')
            server.sendmail('cosc.4p02.summit@gmail.com', recipient, msg.as_string())

        # Update the sent_at field
        newsletter = SavedSummary.query.get(newsletter_id)
        newsletter.sent_at = datetime.utcnow()
        db.session.commit()
        print(f"Newsletter {newsletter_id} sent at {newsletter.sent_at}")

        return jsonify({'message': 'Email sent successfully'}), 200
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': str(e)}), 500

@views.route('/newsletter', methods=['GET'])
@login_required
def newsletter():
    try:
        # Fetch all saved summaries for the current user
        summaries = SavedSummary.query.filter_by(user_id=current_user.id).order_by(SavedSummary.created_at.desc()).all()
        
        # Render the newsletter template with the summaries
        return render_template('newsletter.html', summaries=summaries)
    except Exception as e:
        print(f"Error fetching summaries for newsletter: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while fetching summaries.'}), 500

@views.route('/api/newsletter', methods=['GET'])
@login_required
def get_newsletters():
    try:
        # Fetch all saved summaries for the current user
        summaries = SavedSummary.query.filter_by(user_id=current_user.id).order_by(SavedSummary.created_at.desc()).all()
        
        # Convert summaries to a list of dictionaries
        summaries_list = [{
            'id': summary.id,
            'headline': summary.headline,
            'summary': summary.summary,
            'tags': summary.tags,
            'tone': summary.tone,
            'length': summary.length,
            'created_at': summary.created_at.isoformat()
        } for summary in summaries]
        
        return jsonify({'summaries': summaries_list})
    except Exception as e:
        print(f"Error fetching summaries for newsletter: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while fetching summaries.'}), 500
    
@views.route('/api/save-content', methods=['POST'])
@login_required
def save_content():
    try:
        data = request.get_json()
        content = data.get('content')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        new_content = SavedContent(
            content=content,
            user_id=current_user.id
        )
        
        db.session.add(new_content)
        db.session.commit()
        
        return jsonify({'success': 'Content saved successfully', 'content_id': new_content.id})
    except Exception as e:
        print(f"Error saving content: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while saving the content.'}), 500

@views.route('/api/newsletter/<int:id>', methods=['PUT'])
@login_required
def update_newsletter(id):
    try:
        data = request.get_json()
        newsletter = SavedSummary.query.get_or_404(id)
        if newsletter.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized access'}), 403

        newsletter.headline = data.get('headline', newsletter.headline)
        newsletter.summary = data.get('summary', newsletter.summary)
        db.session.commit()
        return jsonify({
            'id': newsletter.id,
            'headline': newsletter.headline,
            'summary': newsletter.summary,
            'tags': newsletter.tags,
            'tone': newsletter.tone,
            'length': newsletter.length,
            'created_at': newsletter.created_at.isoformat()
        })
    except Exception as e:
        print(f"Error updating newsletter: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while updating the newsletter.'}), 500
    
@views.route('/api/newsletter/<int:id>', methods=['DELETE'])
@login_required
def delete_newsletter(id):
    try:
        newsletter = SavedSummary.query.get_or_404(id)
        if newsletter.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized access'}), 403

        db.session.delete(newsletter)
        db.session.commit()
        return jsonify({'success': 'Newsletter deleted successfully'})
    except Exception as e:
        print(f"Error deleting newsletter: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while deleting the newsletter.'}), 500

@views.route('/api/newsletter/sent-this-month', methods=['GET'])
@login_required
def get_newsletters_sent_this_month():
    try:
        now = datetime.utcnow()
        start_of_month = datetime(now.year, now.month, 1)
        end_of_month = datetime(now.year, now.month + 1, 1) if now.month < 12 else datetime(now.year + 1, 1, 1)

        sent_count = SavedSummary.query.filter(
            SavedSummary.user_id == current_user.id,
            SavedSummary.sent_at >= start_of_month,
            SavedSummary.sent_at < end_of_month
        ).count()

        print(f"Sent newsletters this month: {sent_count}")

        return jsonify({'sent_this_month': sent_count})
    except Exception as e:
        print(f"Error fetching sent newsletters: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while fetching sent newsletters.'}), 500

@views.route('/api/newsletter', methods=['POST'])
@login_required
def add_to_newsletter():
    try:
        # Get the user's role (defaulting to 'free' if not set) and make it case-insensitive
        user_role = current_user.role.lower() if current_user.role else 'free'
        data = request.get_json()
        headline = data.get('headline')
        summary = data.get('summary')

        if not headline or not summary:
            return jsonify({'error': 'Headline and summary are required'}), 400

        # If user is free, enforce a limit (10 newsletters in this case)
        if user_role == 'free':
            newsletters = SavedSummary.query.filter_by(user_id=current_user.id)\
                            .order_by(SavedSummary.created_at).all()
            if len(newsletters) >= 5:
                oldest_newsletter = newsletters[0]
                db.session.delete(oldest_newsletter)
                db.session.commit()

        # Pro and admin users have unlimited storage (no removal)

        # Create and add the new newsletter
        new_newsletter = SavedSummary(
            user_id=current_user.id,
            headline=headline,
            summary=summary,
            created_at=datetime.utcnow()
        )
        db.session.add(new_newsletter)
        db.session.commit()

        return jsonify({'success': 'Newsletter added successfully', 'newsletter': {
            'id': new_newsletter.id,
            'headline': new_newsletter.headline,
            'summary': new_newsletter.summary,
            'created_at': new_newsletter.created_at.isoformat()
        }}), 201
    except Exception as e:
        print(f"Error adding to newsletter: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while adding to the newsletter.'}), 500

# Twitter API routes
@views.route('/api/twitter/auth', methods=['GET'])
def twitter_auth():
    """Get Twitter authentication URL and redirect to it"""
    from .twitter_api import TwitterAPI
    
    print("Twitter auth route called")
    result = TwitterAPI.get_auth_url()
    
    print("Auth URL result:", result)
    
    if result["success"]:
        return redirect(result["auth_url"])
    else:
        return jsonify(result), 400

@views.route('/api/twitter/callback', methods=['GET', 'POST'])
def twitter_callback():
    """Handle Twitter OAuth callback"""
    # Handle both GET (from Twitter redirect) and POST (from frontend)
    if request.method == 'GET':
        # This is a redirect from Twitter - but we should never get here
        # since Twitter redirects to the frontend directly
        oauth_token = request.args.get('oauth_token')
        oauth_verifier = request.args.get('oauth_verifier')
        
        if not oauth_token or not oauth_verifier:
            return jsonify({
                'success': False,
                'error': 'Missing OAuth parameters'
            }), 400
        
        # Store in session for the frontend to use
        session['oauth_token'] = oauth_token
        session['oauth_verifier'] = oauth_verifier
        
        # Return success JSON
        return jsonify({
            'success': True,
            'message': 'OAuth parameters stored in session'
        })
    
    # Handle POST request from frontend
    data = request.json
    oauth_token = data.get('oauth_token') or session.get('oauth_token')
    oauth_verifier = data.get('oauth_verifier') or session.get('oauth_verifier')
    
    if not oauth_token or not oauth_verifier:
        return jsonify({
            'success': False,
            'error': 'Missing OAuth parameters'
        }), 400
    
    try:
        # Complete the OAuth flow
        from .twitter_api import complete_oauth
        result = complete_oauth(oauth_token, oauth_verifier)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'username': result.get('username'),
                'name': result.get('name'),
                'access_token': result.get('access_token'),
                'access_token_secret': result.get('access_token_secret')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to complete OAuth flow')
            })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@views.route('/api/twitter/verify', methods=['POST'])
def twitter_verify_credentials():
    """Verify if stored Twitter credentials are still valid"""
    from .twitter_api import TwitterAPI
    
    data = request.json
    access_token = data.get('access_token')
    access_token_secret = data.get('access_token_secret')
    
    if not access_token or not access_token_secret:
        return jsonify({
            "success": False,
            "error": "Missing access token or secret"
        }), 400
    
    result = TwitterAPI.verify_credentials(access_token, access_token_secret)
    
    return jsonify(result)

@views.route('/api/twitter/verify_credentials', methods=['POST'])
def verify_twitter_credentials():
    """Verify Twitter credentials"""
    data = request.json
    credentials = data.get('credentials')
    
    if not credentials:
        return jsonify({
            'verified': False,
            'error': 'No credentials provided'
        }), 400
    
    try:
        # Extract credentials
        access_token = credentials.get('access_token')
        access_token_secret = credentials.get('access_token_secret')
        
        if not access_token or not access_token_secret:
            return jsonify({
                'verified': False,
                'error': 'Invalid credentials format'
            }), 400
        
        # Use the Twitter API to verify credentials
        from .twitter_api import verify_credentials
        result = verify_credentials(access_token, access_token_secret)
        
        if result.get('success'):
            return jsonify({
                'verified': True,
                'user_info': result.get('user_info')
            })
        else:
            return jsonify({
                'verified': False,
                'error': result.get('error', 'Failed to verify credentials')
            })
    
    except Exception as e:
        return jsonify({
            'verified': False,
            'error': str(e)
        }), 500

@views.route("/api/twitter/share-summary", methods=['POST'])
@login_required
def share_summary_to_twitter():
    """
    Share a summary to Twitter using the user's credentials
    
    Request body:
    {
        "summary": "Summary text to share",
        "headline": "Optional headline",
        "source": "Optional source URL"
    }
    
    Returns:
        JSON response with tweet status
    """
    try:
        data = request.json
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Get the summary text and optional headline
        summary = data.get('summary', '')
        headline = data.get('headline', '')
        source = data.get('source', '')
        
        if not summary:
            return jsonify({
                'success': False,
                'error': 'No summary provided'
            }), 400
        
        # Construct the tweet content
        tweet_text = headline + "\n\n" if headline else ""
        tweet_text += summary
        
        # Add source if provided
        if source:
            source_text = source
            if len(source_text) > 30:
                source_text = source_text[:27] + "..."
            tweet_text += f"\n\nSource: {source_text}"
        
        # Add hashtags
        tweet_text += "\n\n#MrGreen #AISummary"
        
        # Truncate if too long (Twitter limit is 280 characters)
        if len(tweet_text) > 280:
            tweet_text = tweet_text[:277] + "..."
        
        # Use the Twitter API credentials directly from twitter_api.py
        from .twitter_api import TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET, post_tweet
        
        # Create credentials dict
        credentials = {
            'access_token': TWITTER_ACCESS_TOKEN,
            'access_token_secret': TWITTER_ACCESS_SECRET
        }
        
        # Post the tweet
        result = post_tweet(tweet_text, credentials)
        
        if result['success']:
            return jsonify({
                'success': True,
                'tweet_id': result['tweet_id'],
                'message': 'Summary shared to Twitter successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 500
    
    except Exception as e:
        print(f"Error sharing to Twitter: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@views.route("/", methods=["GET", "POST"])
# basically you cannot get to the homepage unless youre logged in
@login_required
def home():
    # Default values for weather
    weather_description = None
    temp = None
    feels_like = None
    city_name = None
    error = None

    # We'll store any AI answer here
    ai_answer = None
    ai_answer_html = None

    # Basically when user hitting add(for Note) or getWeather (for Weather checking ) for askAI( for openai) buttons. That is when you create a POST request to the server
    if request.method == "POST":
        # ---------------------------------------
        # 1) HANDLE note FORM
        # ---------------------------------------
        note = request.form.get("note")
        if note is not None:
            # Means the note form was submitted
            if len(note) < 1:
                flash("Note is too short!", category="error")
            else:
                new_note = Note(data=note, user_id=current_user.id)
                db.session.add(new_note)
                db.session.commit()
                flash("Note added!", category="succeess")

        # ---------------------------------------
        # 2) HANDLE WEATHER FORM
        # ---------------------------------------
        city = request.form.get("city")
        if city is not None:
            # Means the weather form was submitted
            api_key = "for api key refers to our discord discussion"  # example key
            base_url = "http://api.openweathermap.org/data/2.5/weather"

            # define query params
            params = {"q": city, "appid": api_key, "units": "metric"}
            response = requests.get(base_url, params=params)

            # Check if the request is successful
            if response.status_code == 200:
                # response data as json
                data = response.json()
                # Extract relevant information from the JSON
                # Check that the keys exist in the JSON to avoid KeyErrors
                weather_description = (
                    data["weather"][0]["description"]
                    if "weather" in data and data["weather"]
                    else "N/A"
                )
                temp = data["main"]["temp"] if "main" in data else "N/A"
                feels_like = data["main"]["feels_like"] if "main" in data else "N/A"
                city_name = data["name"] if "name" in data else "Unknown"
            else:
                error = "Could not retrieve weather data."
                city_name = city

        # ---------------------------------------
        # 3) HANDLE AI QUESTION FORM
        # ---------------------------------------

        question = request.form.get("question")
        if question:
            try:
                # For now, just provide a placeholder response
                ai_answer = "The OpenAI integration is currently disabled. This is a placeholder response."

                # Convert the AI response from Markdown to HTML
                ai_answer_html = markdown.markdown(ai_answer)
            except Exception as e:
                ai_answer_html = (
                    f"<p style='color:red;'>Error calling OpenAI API: {str(e)}</p>"
                )

    # Render the template for both GET and POST
    return render_template(
        "home.html",
        user=current_user,
        city=city_name,
        weather_description=weather_description,
        temp=temp,
        feels_like=feels_like,
        error=error,
        ai_answer_html=ai_answer_html,
    )


@views.route("/delete-note", methods=["POST"])
# look for the note id that was sent to us, not as a form, load it as json
def delete_note():
    # request.data to  body: JSON.stringify({ noteId: noteId }), turn it into python dictionary object, then we can access noteID
    # load loads from a file-like object, loads from a string. So you could just as well omit the .read() call instead.)
    note = json.loads(request.data)
    noteId = note["noteId"]
    # then look fore note that has that id
    note = Note.query.get(noteId)
    # if it does exist
    if note:
        # if the siged in user own the note
        if note.user_id == current_user.id:
            db.session.delete(note)
            db.session.commit()
            # return an empty response, basically turne it into a json object and then return
    return jsonify({})


@views.route("/api/posts/publish", methods=["POST"])
@login_required
def publish_post():
    # Extract form data
    content = request.form.get('content', '')
    platforms_json = request.form.get('platforms', '[]')
    twitter_credentials_json = request.form.get('twitter_credentials')
    
    try:
        platforms = json.loads(platforms_json)
        twitter_credentials = json.loads(twitter_credentials_json) if twitter_credentials_json else None
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON data'}), 400
    
    if not content and not request.files:
        return jsonify({'error': 'No content or media provided'}), 400
    
    if not platforms:
        return jsonify({'error': 'No platforms selected'}), 400
    
    # Save uploaded media files
    media_paths = save_media_files(request.files)
    
    results = {}
    
    for platform in platforms:
        try:
            if platform == 'twitter':
                if not twitter_credentials:
                    results[platform] = {
                        'success': False,
                        'error': 'Twitter credentials not provided'
                    }
                    continue
                
                # Use the Twitter API to post
                from .twitter_api import post_tweet
                tweet_result = post_tweet(content, twitter_credentials, media_paths)
                
                if tweet_result.get('success'):
                    results[platform] = {
                        'success': True,
                        'post_id': tweet_result.get('tweet_id'),
                        'url': f"https://twitter.com/user/status/{tweet_result.get('tweet_id')}"
                    }
                else:
                    results[platform] = {
                        'success': False,
                        'error': tweet_result.get('error', 'Unknown error')
                    }
            
            elif platform == 'facebook':
                # Simulate Facebook posting
                results[platform] = {
                    'success': True,
                    'post_id': f"fb_{random.randint(1000000, 9999999)}",
                    'url': 'https://facebook.com/post/example'
                }
            
            elif platform == 'linkedin':
                # Simulate LinkedIn posting
                results[platform] = {
                    'success': True,
                    'post_id': f"li_{random.randint(1000000, 9999999)}",
                    'url': 'https://linkedin.com/post/example'
                }
            
        except Exception as e:
            results[platform] = {
                'success': False,
                'error': str(e)
            }
    
    # Clean up temporary media files after posting
    for file_path in media_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error removing temporary file {file_path}: {str(e)}")
    
    return jsonify({
        'message': 'Post processed',
        'results': results
    })

@views.route("/api/posts/schedule", methods=["POST"])
@login_required
def schedule_post():
    # Extract form data
    content = request.form.get('content', '')
    platforms_json = request.form.get('platforms', '[]')
    scheduled_time = request.form.get('scheduled_time')
    twitter_credentials_json = request.form.get('twitter_credentials')
    
    try:
        platforms = json.loads(platforms_json)
        twitter_credentials = json.loads(twitter_credentials_json) if twitter_credentials_json else None
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON data'}), 400
    
    if not content and not request.files:
        return jsonify({'error': 'No content or media provided'}), 400
    
    if not platforms:
        return jsonify({'error': 'No platforms selected'}), 400
    
    if not scheduled_time:
        return jsonify({'error': 'No scheduled time provided'}), 400
    
    # Save uploaded media files
    media_paths = save_media_files(request.files)
    
    # Generate a unique ID for the scheduled post
    post_id = str(uuid.uuid4())
    
    # Store the scheduled post (in a real app, this would go to a database)
    scheduled_posts[post_id] = {
        'id': post_id,
        'content': content,
        'platforms': platforms,
        'scheduled_time': scheduled_time,
        'status': 'scheduled',
        'twitter_credentials': twitter_credentials,
        'media_paths': media_paths
    }
    
    return jsonify({
        'message': 'Post scheduled successfully',
        'post_id': post_id
    })

@views.route("/api/posts/execute/<post_id>", methods=["POST"])
@login_required
def execute_scheduled_post(post_id):
    if post_id not in scheduled_posts:
        return jsonify({'error': 'Scheduled post not found'}), 404
    
    post = scheduled_posts[post_id]
    
    # Mark the post as in progress
    post['status'] = 'in_progress'
    
    results = {}
    
    for platform in post['platforms']:
        try:
            if platform == 'twitter':
                twitter_credentials = post.get('twitter_credentials')
                if not twitter_credentials:
                    results[platform] = {
                        'success': False,
                        'error': 'Twitter credentials not provided'
                    }
                    continue
                
                # Use the Twitter API to post
                from .twitter_api import post_tweet
                tweet_result = post_tweet(post['content'], twitter_credentials, post.get('media_paths', []))
                
                if tweet_result.get('success'):
                    results[platform] = {
                        'success': True,
                        'post_id': tweet_result.get('tweet_id'),
                        'url': f"https://twitter.com/user/status/{tweet_result.get('tweet_id')}"
                    }
                else:
                    results[platform] = {
                        'success': False,
                        'error': tweet_result.get('error', 'Unknown error')
                    }
            
            elif platform == 'facebook':
                # Simulate Facebook posting
                results[platform] = {
                    'success': True,
                    'post_id': f"fb_{random.randint(1000000, 9999999)}",
                    'url': 'https://facebook.com/post/example'
                }
            
            elif platform == 'linkedin':
                # Simulate LinkedIn posting
                results[platform] = {
                    'success': True,
                    'post_id': f"li_{random.randint(1000000, 9999999)}",
                    'url': 'https://linkedin.com/post/example'
                }
            
        except Exception as e:
            results[platform] = {
                'success': False,
                'error': str(e)
            }
    
    # Clean up temporary media files after posting
    media_paths = post.get('media_paths', [])
    for file_path in media_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error removing temporary file {file_path}: {str(e)}")
    
    # Mark the post as completed
    post['status'] = 'completed'
    post['results'] = results
    post['executed_at'] = datetime.now().isoformat()
    
    return jsonify({
        'message': 'Scheduled post executed',
        'results': results
    })

@views.route("/api/posts/scheduled", methods=["GET"])
@login_required
def get_scheduled_posts():
    try:
        posts_data = []
        
        # Get in-memory scheduled posts
        for post_id, post in scheduled_posts.items():
            post_data = {
                "id": post_id,
                "content": post.get('content', ''),
                "platforms": post.get('platforms', []),
                "scheduled_time": post.get('scheduled_time', ''),
                "status": post.get('status', 'scheduled'),
                "media_paths": post.get('media_paths', []),
                "created_at": post.get('created_at', datetime.now().isoformat())
            }
            posts_data.append(post_data)
        
        # Get database scheduled posts
        db_posts = ScheduledPost.query.filter_by(user_id=current_user.id).order_by(ScheduledPost.scheduled_time).all()
        
        for post in db_posts:
            posts_data.append({
                "id": str(post.id),
                "content": post.content,
                "platforms": post.platforms.split(','),
                "scheduled_time": post.scheduled_time.isoformat(),
                "status": post.status,
                "error_message": post.error_message,
                "created_at": post.created_at.isoformat()
            })
        
        # Sort posts by scheduled time
        posts_data.sort(key=lambda x: x.get('scheduled_time', ''))
        
        return jsonify({"posts": posts_data}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@views.route("/api/posts/scheduled/<post_id>", methods=["DELETE"])
@login_required
def delete_scheduled_post(post_id):
    try:
        # Check if this is an in-memory post
        if post_id in scheduled_posts:
            # Remove the post from memory
            post = scheduled_posts.pop(post_id)
            
            # Clean up any media files
            for file_path in post.get('media_paths', []):
                try:
                    if os.path.exists(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error removing file {file_path}: {str(e)}")
            
            return jsonify({"message": "Scheduled post deleted"}), 200
        
        # If not in memory, try to find in database
        try:
            # Convert to int if it's a database ID
            db_post_id = int(post_id)
            post = ScheduledPost.query.get(db_post_id)
            
            if not post:
                return jsonify({"error": "Post not found"}), 404
            
            if post.user_id != current_user.id:
                return jsonify({"error": "Unauthorized"}), 403
            
            db.session.delete(post)
            db.session.commit()
            
            return jsonify({"message": "Scheduled post deleted"}), 200
        except ValueError:
            # If post_id is not a valid integer, it's not a database post
            return jsonify({"error": "Post not found"}), 404
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Helper functions for social media API integration
def validate_post_content(content, platforms):
    errors = []
    
    for platform in platforms:
        if platform == 'twitter':
            # Twitter has a 280 character limit
            if len(content) > 280:
                errors.append(f"Twitter posts cannot exceed 280 characters (current: {len(content)})")
        
        elif platform == 'facebook':
            # Facebook has a much higher limit, but let's set a reasonable one
            if len(content) > 5000:
                errors.append(f"Facebook posts cannot exceed 5000 characters (current: {len(content)})")
        
        elif platform == 'linkedin':
            # LinkedIn has a character limit for posts
            if len(content) > 3000:
                errors.append(f"LinkedIn posts cannot exceed 3000 characters (current: {len(content)})")
    
    return '; '.join(errors) if errors else None


def publish_to_platform(platform, content, user_id):
    # In a real implementation, this would use the platform's API
    # For demonstration purposes, we'll simulate the API calls
    
    try:
        if platform == 'twitter':
            # Simulate Twitter API call
            # In a real app, you would use the Twitter API client
            return {
                "success": True,
                "post_id": "twitter_123456789",
                "url": "https://twitter.com/user/status/123456789"
            }
        
        elif platform == 'facebook':
            # Simulate Facebook API call
            return {
                "success": True,
                "post_id": "facebook_123456789",
                "url": "https://facebook.com/posts/123456789"
            }
        
        elif platform == 'linkedin':
            # Simulate LinkedIn API call
            return {
                "success": True,
                "post_id": "linkedin_123456789",
                "url": "https://linkedin.com/feed/update/123456789"
            }
        
        else:
            return {
                "success": False,
                "error": f"Unsupported platform: {platform}"
            }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# In-memory storage for scheduled posts (in a real app, this would be a database)
scheduled_posts = {}

# Create a directory for temporary media storage
def ensure_media_dir():
    media_dir = os.path.join(current_app.root_path, 'temp_media')
    if not os.path.exists(media_dir):
        os.makedirs(media_dir)
    return media_dir

# Save uploaded media files
def save_media_files(request_files):
    media_paths = []
    
    if not request_files:
        return media_paths
    
    media_dir = ensure_media_dir()
    
    # Process each uploaded file
    for key in request_files:
        if key.startswith('media_'):
            file = request_files[key]
            if file:
                filename = secure_filename(file.filename)
                # Generate a unique filename to avoid collisions
                unique_filename = f"{uuid.uuid4()}_{filename}"
                file_path = os.path.join(media_dir, unique_filename)
                file.save(file_path)
                media_paths.append(file_path)
    
    return media_paths

@views.route('/api/summarize', methods=['POST'])
@login_required
def summarize():
    try:
        data = request.get_json()
        
        # Validate request data
        if not data:
            return jsonify({'error': 'Invalid request format. JSON body required.'}), 400
        
        # Check if we have content or URL
        has_content = 'content' in data and data['content'].strip()
        has_url = 'url' in data and data['url'].strip()
        
        if not has_content and not has_url:
            return jsonify({'error': 'No content or URL provided.'}), 400
            
        # Validate and sanitize parameters
        try:
            length = int(data.get('length', 50))
            if length < 10 or length > 90:
                return jsonify({'error': 'Length must be between 10 and 90 percent.'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Length must be a valid number.'}), 400
            
        # Validate tone parameter
        valid_tones = ['professional', 'casual', 'academic', 'friendly', 'promotional', 'informative']
        tone = data.get('tone', 'professional').lower()
        if tone not in valid_tones:
            return jsonify({'error': f'Invalid tone. Must be one of: {", ".join(valid_tones)}'}), 400
        
        # Check if this is a batch request
        is_batch = data.get('is_batch', False)
        
        # Process the content using our content processor
        processing_input = {
            'content': data.get('content', ''),
            'url': data.get('url', ''),
            'is_html': data.get('is_html', False)
        }
        
        processing_result = process_content(processing_input)
        
        if not processing_result['success']:
            return jsonify({'error': processing_result['error']}), 400
        
        content = processing_result['content']
        metadata = processing_result['metadata']
        
        # Check content length after processing
        if len(content) > 10000:
            # For very large content, use chunking
            if len(content) > 20000:
                # Use chunking for extremely large content
                return handle_chunked_content(content, length, tone, metadata, data)
            else:
                # For moderately large content, use compression
                compressed = compress_content(content)
                if compressed:
                    metadata['compressed'] = True
                    metadata['original_size'] = len(content)
                    content = compressed
        elif len(content) < 50:
            return jsonify({'error': 'Content must be at least 50 characters.'}), 400
        
        # Apply content filtering
        # All users have 'user' role now
        user_role = 'user'
        strict_mode = data.get('strict_filtering', False)
        
        filtering_result = filter_content(content, user_role=user_role, strict_mode=strict_mode)
        
        # Add filtering results to metadata
        metadata['categories'] = filtering_result['categories']
        
        # Check if content is allowed
        if not filtering_result['allowed']:
            return jsonify({
                'error': 'Content contains inappropriate material and cannot be processed.',
                'filtering_result': filtering_result
            }), 400
        
        # Add warnings to response if present
        warnings = filtering_result.get('warnings', [])
        
        # Log the request (without the full content for privacy)
        print(f"Summary request: length={length}, tone={tone}, content_length={len(content)}")
        
        # For batch requests or long content, use async processing
        if is_batch or len(content) > 5000:
            # Submit task to async processor
            task_id = async_processor.submit_task(
                generate_summary_task,
                content=content,
                length=length,
                tone=tone,
                metadata=metadata,
                warnings=warnings
            )
            
            # Return task ID for client to poll
            return jsonify({
                'task_id': task_id,
                'status': 'processing',
                'message': 'Summary generation in progress. Please poll for results.'
            })
        
        # For regular requests, process synchronously
        # Try to get cached summary
        if metadata.get('compressed'):
            # Decompress content for cache lookup
            decompressed = decompress_content(content)
            cached_result = redis_cache.get_cached_summary(decompressed, length, tone)
        else:
            cached_result = redis_cache.get_cached_summary(content, length, tone)
            
        if cached_result:
            print("Returning cached summary")
            # Add metadata and filtering results to cached result
            cached_result['metadata'] = metadata
            cached_result['warnings'] = warnings
            return jsonify(cached_result)
        
        # Check if Gemini model is available
        if model is None:
            return jsonify({'error': 'AI service is currently unavailable. Please try again later.'}), 503
        
        # If content is compressed, decompress it
        if metadata.get('compressed'):
            content = decompress_content(content)
            if not content:
                return jsonify({'error': 'Failed to decompress content.'}), 500
        
        # Create prompt for Gemini that includes headline generation
        prompt = f"""You are an AI assistant that creates {tone} summaries with headlines and categories.
Create a summary that is approximately {length}% of the original length.
Maintain the key points while adjusting the length and tone as specified.

Also create a compelling headline in the {tone} tone that captures the essence of the content.

Additionally, identify the primary and secondary categories that best describe this content.
Choose from these categories: technology, business, news, health, science, politics, entertainment, sports, general.

Format your response exactly like this:
HEADLINE: [Your headline here]

CATEGORIES: [Primary Category], [Secondary Category]

SUMMARY:
[Your summary here]

Please summarize the following text:

{content}"""
        
        # Make API call to Gemini with error handling
        try:
            # Gemini API call
            response = model.generate_content(
                contents=prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 1500,
                }
            )
            
            # Extract the headline and summary from the response
            response_text = response.text
            
            # Parse the response to extract headline and summary
            headline = ""
            summary = response_text
            categories = {}
            
            if "HEADLINE:" in response_text:
                # Split by sections
                sections = response_text.split("\n\n")
                
                # Extract headline
                for section in sections:
                    if section.startswith("HEADLINE:"):
                        headline = section.replace("HEADLINE:", "").strip()
                    elif section.startswith("CATEGORIES:"):
                        # Extract categories
                        categories_text = section.replace("CATEGORIES:", "").strip()
                        category_list = [cat.strip() for cat in categories_text.split(",")]
                        
                        if len(category_list) >= 2:
                            categories = {
                                'primary_category': category_list[0],
                                'secondary_category': category_list[1],
                                'confidence': 90  # High confidence since it's AI-generated
                            }
                        elif len(category_list) == 1:
                            categories = {
                                'primary_category': category_list[0],
                                'secondary_category': 'general',
                                'confidence': 90
                            }
                    elif section.startswith("SUMMARY:"):
                        summary = section.replace("SUMMARY:", "").strip()
            
            # If no categories were extracted, use default
            if not categories:
                categories = {
                    'primary_category': 'general',
                    'secondary_category': 'informational',
                    'confidence': 50
                }
            
            # Update metadata with AI-generated categories
            metadata['categories'] = categories
            
            # Prepare response data
            response_data = {
                'headline': headline,
                'summary': summary,
                'original_content': content,
                'settings': {
                    'length': length,
                    'tone': tone
                },
                'metadata': metadata,
                'warnings': warnings,
                'cached': False
            }
            
            # Cache the result
            if not metadata.get('compressed'):
                redis_cache.cache_summary(content, length, tone, response_data)
            
            return jsonify(response_data)
            
        except Exception as api_error:
            print(f"Gemini API error: {str(api_error)}")
            return jsonify({'error': 'Failed to generate summary. API service unavailable.'}), 503
        
    except Exception as e:
        print(f"Summarization error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while processing your request.'}), 500

@views.route('/api/summarize/status/<task_id>', methods=['GET'])
@login_required
def summarize_status(task_id):
    """
    Check the status of an asynchronous summarization task
    
    Args:
        task_id (str): Task ID to check
        
    Returns:
        JSON response with task status
    """
    try:
        # Get task status from async processor
        status = async_processor.get_task_status(task_id)
        
        if status['status'] == 'unknown':
            return jsonify({
                'status': 'unknown',
                'message': 'Task not found'
            }), 404
        
        if status['status'] == 'pending':
            return jsonify({
                'status': 'processing',
                'message': 'Summary generation in progress'
            })
        
        if status['status'] == 'timeout':
            return jsonify({
                'status': 'error',
                'error': 'Summary generation timed out'
            }), 500
        
        if status['status'] == 'error':
            return jsonify({
                'status': 'error',
                'error': status.get('error', 'An error occurred during summary generation')
            }), 500
        
        if status['status'] == 'completed':
            # Return the completed result
            return jsonify(status['result'])
        
        # Default response for unknown status
        return jsonify({
            'status': status['status'],
            'message': 'Task is in an unknown state'
        })
        
    except Exception as e:
        print(f"Error checking task status: {str(e)}")
        return jsonify({
            'status': 'error',
            'error': 'Failed to check task status'
        }), 500

@views.route('/api/summarize/batch', methods=['POST'])
@login_required
def summarize_batch():
    """
    Process a batch of content for summarization
    
    Returns:
        JSON response with task IDs for each content item
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or 'items' not in data or not isinstance(data['items'], list):
            return jsonify({'error': 'Invalid request format. JSON body with items array required.'}), 400
        
        # Get common parameters
        length = data.get('length', 50)
        tone = data.get('tone', 'professional')
        
        # Process each item
        task_ids = []
        for item in data['items']:
            # Set batch flag
            item['is_batch'] = True
            
            # Submit to regular summarize endpoint
            try:
                # Create a mock request object
                class MockRequest:
                    def get_json(self):
                        return item
                
                # Call the summarize function directly
                request._mock = MockRequest()
                response = summarize()
                request._mock = None
                
                # Extract task ID from response
                if isinstance(response, tuple):
                    response_data = json.loads(response[0].data)
                else:
                    response_data = json.loads(response.data)
                
                task_ids.append({
                    'item_id': item.get('id'),
                    'task_id': response_data.get('task_id'),
                    'status': response_data.get('status')
                })
            except Exception as item_error:
                task_ids.append({
                    'item_id': item.get('id'),
                    'error': str(item_error),
                    'status': 'error'
                })
        
        return jsonify({
            'tasks': task_ids,
            'message': f'Batch processing started for {len(task_ids)} items'
        })
        
    except Exception as e:
        print(f"Batch summarization error: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while processing your batch request.'}), 500

def handle_chunked_content(content, length, tone, metadata, data):
    """
    Handle very large content by chunking it into smaller pieces
    
    Args:
        content (str): Content to summarize
        length (int): Summary length percentage
        tone (str): Summary tone
        metadata (dict): Content metadata
        data (dict): Request data
        
    Returns:
        JSON response with task ID for polling
    """
    try:
        # Add chunking info to metadata
        metadata['chunked'] = True
        
        # Get user role and strict mode
        user_role = 'user'  # All users have 'user' role for now
        strict_mode = data.get('strict_filtering', False)
        
        # Create chunks
        chunks = chunk_content(content)
        if not chunks:
            return jsonify({'error': 'Failed to chunk content.'}), 500
            
        # Add chunk count to metadata
        metadata['chunk_count'] = len(chunks)
        
        # Submit task to async processor
        task_id = async_processor.submit_task(
            process_chunked_content,
            chunks=chunks,
            length=length,
            tone=tone,
            metadata=metadata,
            user_role=user_role,
            strict_mode=strict_mode
        )
        
        # Return task ID for client to poll
        return jsonify({
            'task_id': task_id,
            'status': 'processing',
            'message': f'Processing large content in {len(chunks)} chunks. Please poll for results.'
        })
        
    except Exception as e:
        print(f"Error handling chunked content: {str(e)}")
        return jsonify({'error': 'Failed to process large content.'}), 500

def process_chunked_content(chunks, length, tone, metadata, user_role, strict_mode):
    """
    Process chunked content asynchronously
    
    Args:
        chunks (list): List of content chunks
        length (int): Summary length percentage
        tone (str): Summary tone
        metadata (dict): Content metadata
        user_role (str): User role for filtering
        strict_mode (bool): Whether to use strict filtering
        
    Returns:
        dict: Summary result
    """
    try:
        print(f"Processing {len(chunks)} chunks for summary")
        
        # Process each chunk to get individual summaries
        chunk_summaries = []
        
        for i, chunk in enumerate(chunks):
            print(f"Processing chunk {i+1}/{len(chunks)}")
            
            # Apply content filtering to each chunk
            filtering_result = filter_content(chunk, user_role=user_role, strict_mode=strict_mode)
            
            # Skip chunks that don't pass filtering
            if not filtering_result['allowed']:
                print(f"Chunk {i+1} filtered out due to inappropriate content")
                continue
                
            # Create prompt for this chunk
            prompt = f"""You are an AI assistant that creates concise summaries.
Summarize the following text in a {tone} tone, capturing the key points:

{chunk}"""
            
            try:
                # Gemini API call for this chunk
                response = model.generate_content(
                    contents=prompt,
                    generation_config={
                        "temperature": 0.5,
                        "max_output_tokens": 800,
                    }
                )
                
                # Add chunk summary to list
                chunk_summaries.append(response.text)
                
            except Exception as chunk_error:
                print(f"Error processing chunk {i+1}: {str(chunk_error)}")
                # Continue with other chunks even if one fails
        
        # If we have no summaries, return error
        if not chunk_summaries:
            return {
                'status': 'error',
                'error': 'Failed to generate summaries for any content chunks.'
            }
            
        # Combine chunk summaries
        combined_summary = "\n\n".join(chunk_summaries)
        
        # Generate final summary with headline from the combined chunk summaries
        final_prompt = f"""You are an AI assistant that creates {tone} summaries with headlines and categories.
The following text contains summaries of different sections of a larger document.
Create a cohesive final summary in a {tone} tone that is approximately {length}% of the original length.

Also create a compelling headline in the {tone} tone that captures the essence of the content.

Additionally, identify the primary and secondary categories that best describe this content.
Choose from these categories: technology, business, news, health, science, politics, entertainment, sports, general.

Format your response exactly like this:
HEADLINE: [Your headline here]

CATEGORIES: [Primary Category], [Secondary Category]

SUMMARY:
[Your summary here]

Here are the section summaries to combine:

{combined_summary}"""
        
        try:
            # Gemini API call for final summary
            final_response = model.generate_content(
                contents=final_prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 1500,
                }
            )
            
            # Extract the headline and summary from the response
            response_text = final_response.text
            
            # Parse the response to extract headline and summary
            headline = ""
            summary = response_text
            categories = {}
            
            if "HEADLINE:" in response_text:
                # Split by sections
                sections = response_text.split("\n\n")
                
                # Extract headline
                for section in sections:
                    if section.startswith("HEADLINE:"):
                        headline = section.replace("HEADLINE:", "").strip()
                    elif section.startswith("CATEGORIES:"):
                        # Extract categories
                        categories_text = section.replace("CATEGORIES:", "").strip()
                        category_list = [cat.strip() for cat in categories_text.split(",")]
                        
                        if len(category_list) >= 2:
                            categories = {
                                'primary_category': category_list[0],
                                'secondary_category': category_list[1],
                                'confidence': 90  # High confidence since it's AI-generated
                            }
                        elif len(category_list) == 1:
                            categories = {
                                'primary_category': category_list[0],
                                'secondary_category': 'general',
                                'confidence': 90
                            }
                    elif section.startswith("SUMMARY:"):
                        summary = section.replace("SUMMARY:", "").strip()
            
            # If no categories were extracted, use default
            if not categories:
                categories = {
                    'primary_category': 'general',
                    'secondary_category': 'informational',
                    'confidence': 50
                }
            
            # Update metadata with AI-generated categories
            metadata['categories'] = categories
            
            # Prepare response data
            return {
                'headline': headline,
                'summary': summary,
                'settings': {
                    'length': length,
                    'tone': tone
                },
                'metadata': metadata,
                'warnings': [],  # We've already filtered each chunk
                'cached': False,
                'status': 'completed'
            }
            
        except Exception as final_error:
            print(f"Error generating final summary: {str(final_error)}")
            return {
                'status': 'error',
                'error': 'Failed to generate final summary from chunks.'
            }
        
    except Exception as e:
        print(f"Error processing chunked content: {str(e)}")
        return {
            'status': 'error',
            'error': 'An unexpected error occurred while processing chunked content.'
        }

def generate_summary_task(content, length, tone, metadata, warnings):
    """
    Task function for generating summaries asynchronously
    
    Args:
        content (str): Content to summarize
        length (int): Summary length percentage
        tone (str): Summary tone
        metadata (dict): Content metadata
        warnings (list): Content warnings
        
    Returns:
        dict: Summary result
    """
    try:
        print(f"Starting async summary generation: length={length}, tone={tone}")
        
        # Check if content is compressed
        if metadata.get('compressed'):
            content = decompress_content(content)
            if not content:
                return {
                    'status': 'error',
                    'error': 'Failed to decompress content.'
                }
        
        # Try to get cached summary
        cached_result = redis_cache.get_cached_summary(content, length, tone)
        if cached_result:
            print("Returning cached summary for async task")
            # Add metadata and warnings to cached result
            cached_result['metadata'] = metadata
            cached_result['warnings'] = warnings
            cached_result['status'] = 'completed'
            return cached_result
        
        # Check if Gemini model is available
        if model is None:
            return {
                'status': 'error',
                'error': 'AI service is currently unavailable. Please try again later.'
            }
        
        # Create prompt for Gemini that includes headline generation
        prompt = f"""You are an AI assistant that creates {tone} summaries with headlines and categories.
Create a summary that is approximately {length}% of the original length.
Maintain the key points while adjusting the length and tone as specified.

Also create a compelling headline in the {tone} tone that captures the essence of the content.

Additionally, identify the primary and secondary categories that best describe this content.
Choose from these categories: technology, business, news, health, science, politics, entertainment, sports, general.

Format your response exactly like this:
HEADLINE: [Your headline here]

CATEGORIES: [Primary Category], [Secondary Category]

SUMMARY:
[Your summary here]

Please summarize the following text:

{content}"""
        
        # Make API call to Gemini with error handling
        try:
            # Gemini API call
            response = model.generate_content(
                contents=prompt,
                generation_config={
                    "temperature": 0.7,
                    "max_output_tokens": 1500,
                }
            )
            
            # Extract the headline and summary from the response
            response_text = response.text
            
            # Parse the response to extract headline and summary
            headline = ""
            summary = response_text
            categories = {}
            
            if "HEADLINE:" in response_text:
                # Split by sections
                sections = response_text.split("\n\n")
                
                # Extract headline
                for section in sections:
                    if section.startswith("HEADLINE:"):
                        headline = section.replace("HEADLINE:", "").strip()
                    elif section.startswith("CATEGORIES:"):
                        # Extract categories
                        categories_text = section.replace("CATEGORIES:", "").strip()
                        category_list = [cat.strip() for cat in categories_text.split(",")]
                        
                        if len(category_list) >= 2:
                            categories = {
                                'primary_category': category_list[0],
                                'secondary_category': category_list[1],
                                'confidence': 90  # High confidence since it's AI-generated
                            }
                        elif len(category_list) == 1:
                            categories = {
                                'primary_category': category_list[0],
                                'secondary_category': 'general',
                                'confidence': 90
                            }
                    elif section.startswith("SUMMARY:"):
                        summary = section.replace("SUMMARY:", "").strip()
            
            # If no categories were extracted, use default
            if not categories:
                categories = {
                    'primary_category': 'general',
                    'secondary_category': 'informational',
                    'confidence': 50
                }
            
            # Update metadata with AI-generated categories
            metadata['categories'] = categories
            
            # Prepare response data
            response_data = {
                'headline': headline,
                'summary': summary,
                'original_content': content,
                'settings': {
                    'length': length,
                    'tone': tone
                },
                'metadata': metadata,
                'warnings': warnings,
                'cached': False,
                'status': 'completed'
            }
            
            # Cache the result
            if not metadata.get('compressed'):
                redis_cache.cache_summary(content, length, tone, response_data)
            
            return response_data
            
        except Exception as api_error:
            print(f"Gemini API error in async task: {str(api_error)}")
            return {
                'status': 'error',
                'error': 'Failed to generate summary. API service unavailable.'
            }
        
    except Exception as e:
        print(f"Async summarization error: {str(e)}")
        return {
            'status': 'error',
            'error': 'An unexpected error occurred while processing your request.'
        }

@views.route('/api/summary/save', methods=['POST'])
@login_required
def save_summary():
    """
    Save a generated summary to the database
    
    Request body:
    {
        "headline": "Summary headline",
        "summary": "Generated summary content",
        "tags": "tag1,tag2,tag3",
        "tone": "professional",
        "length": 50
    }
    
    Returns:
        JSON response with saved summary ID
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data:
            return jsonify({'error': 'Invalid request format. JSON body required.'}), 400
        
        # Check required fields
        required_fields = ['headline', 'summary']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create new SavedSummary object
        new_summary = SavedSummary(
            headline=data['headline'],
            summary=data['summary'],
            tags=data.get('tags', ''),
            tone=data.get('tone', 'professional'),
            length=data.get('length', 50),
            user_id=current_user.id
        )
        
        # Add to database
        db.session.add(new_summary)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Summary saved successfully',
            'summary_id': new_summary.id
        })
        
    except Exception as e:
        print(f"Error saving summary: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'An unexpected error occurred while saving the summary.'}), 500

@views.route('/api/summary/saved', methods=['GET'])
@login_required
def get_saved_summaries():
    """
    Get all saved summaries for the current user
    
    Returns:
        JSON response with list of saved summaries
    """
    try:
        # Get all summaries for current user
        summaries = SavedSummary.query.filter_by(user_id=current_user.id).order_by(SavedSummary.created_at.desc()).all()
        
        # Convert to JSON
        summaries_list = []
        for summary in summaries:
            summaries_list.append({
                'id': summary.id,
                'headline': summary.headline,
                'summary': summary.summary,
                'tags': summary.tags,
                'tone': summary.tone,
                'length': summary.length,
                'created_at': summary.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'summaries': summaries_list
        })
        
    except Exception as e:
        print(f"Error retrieving saved summaries: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while retrieving saved summaries.'}), 500

@views.route('/api/summary/toggle-favorite', methods=['POST'])
@login_required
def toggle_favorite():
    """
    Toggle favorite status for a summary
    
    Request body:
    {
        "summary_id": 123  // ID of the summary to toggle favorite status
    }
    
    Returns:
        JSON response with updated favorite status
    """
    try:
        data = request.get_json()
        
        # Validate request data
        if not data or 'summary_id' not in data:
            return jsonify({'error': 'Missing summary_id in request'}), 400
        
        summary_id = data['summary_id']
        
        # Check if summary exists
        summary = SavedSummary.query.get(summary_id)
        if not summary:
            return jsonify({'error': 'Summary not found'}), 404
        
        # Check if already favorited
        existing_favorite = FavoriteSummary.query.filter_by(
            user_id=current_user.id,
            summary_id=summary_id
        ).first()
        
        if existing_favorite:
            # Remove from favorites
            db.session.delete(existing_favorite)
            db.session.commit()
            return jsonify({
                'success': True,
                'is_favorite': False,
                'message': 'Summary removed from favorites'
            })
        else:
            # Add to favorites
            new_favorite = FavoriteSummary(
                user_id=current_user.id,
                summary_id=summary_id
            )
            db.session.add(new_favorite)
            db.session.commit()
            return jsonify({
                'success': True,
                'is_favorite': True,
                'message': 'Summary added to favorites'
            })
            
    except Exception as e:
        print(f"Error toggling favorite: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'An unexpected error occurred while toggling favorite status.'}), 500

@views.route('/api/summary/favorites', methods=['GET'])
@login_required
def get_favorite_summaries():
    """
    Get all favorite summaries for the current user
    
    Returns:
        JSON response with list of favorite summaries
    """
    try:
        # Get all favorite summary IDs for current user
        favorites = FavoriteSummary.query.filter_by(user_id=current_user.id).all()
        favorite_ids = [fav.summary_id for fav in favorites]
        
        # Get the actual summary objects
        summaries = SavedSummary.query.filter(SavedSummary.id.in_(favorite_ids)).all()
        
        # Convert to JSON
        summaries_list = []
        for summary in summaries:
            summaries_list.append({
                'id': summary.id,
                'headline': summary.headline,
                'summary': summary.summary,
                'tags': summary.tags,
                'tone': summary.tone,
                'length': summary.length,
                'created_at': summary.created_at.isoformat(),
                'is_favorite': True
            })
        
        return jsonify({
            'success': True,
            'favorites': summaries_list
        })
        
    except Exception as e:
        print(f"Error retrieving favorite summaries: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while retrieving favorite summaries.'}), 500

@views.route('/api/summary/check-favorite/<int:summary_id>', methods=['GET'])
@login_required
def check_favorite_status(summary_id):
    """
    Check if a summary is favorited by the current user
    
    Parameters:
        summary_id (int): ID of the summary to check
    
    Returns:
        JSON response with favorite status
    """
    try:
        # Check if the summary is favorited
        is_favorite = FavoriteSummary.query.filter_by(
            user_id=current_user.id,
            summary_id=summary_id
        ).first() is not None
        
        return jsonify({
            'success': True,
            'is_favorite': is_favorite
        })
        
    except Exception as e:
        print(f"Error checking favorite status: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred while checking favorite status.'}), 500


from flask import render_template, session

@views.route('/dashboard')
@login_required
def dashboard():
    user_plan = session.get('role', 'Free')  # Default to 'Free' if not set
    user_role = current_user.role  # Get the user's role
    return render_template('dashboard.html', plan=user_plan, role=user_role)

from flask import request, jsonify, session

# @views.route('/ai-summary-limited', methods=['POST'])
# @login_required
# def ai_summary_limited():
#     # Get the user's role directly from current_user and normalize to lowercase
#     user_role = current_user.role.lower()  # e.g., "free", "pro", "admin"
#     text = request.json.get('text', '')
#     length = request.json.get('length', 50)
#     tone = request.json.get('tone', 'Professional')

#     if user_role == 'free':
#         # Apply restrictions only for Free users
#         if len(text.split()) > 500:
#             return jsonify({
#                 'error': 'Access limited, FREE users can only summarize up to 500 words. Upgrade to Pro for longer text.'
#             }), 403

#         if length != 50:
#             return jsonify({
#                 'error': 'Access limited, FREE users cannot adjust summary length. Upgrade to Pro for that feature.'
#             }), 403

#         if tone.lower() != 'professional':
#             return jsonify({
#                 'error': 'Access limited, FREE users can only use Professional tone. Upgrade to Pro for additional tones.'
#             }), 403

#     # Process AI summary (existing logic)
#     summary = process_ai_summary(text, length, tone)
#     return jsonify({'summary': summary})

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'error': 'Access denied. Admins only.'}), 403
        return f(*args, **kwargs)
    return decorated_function

@views.route('/admin', methods=['GET'])
@login_required
@admin_required
def admin_dashboard():
    return jsonify({'message': 'Welcome to the admin dashboard!'})

@views.route('/api/user-info', methods=['GET'])
@login_required
def get_user_info():
    """
    API endpoint to fetch the current user's plan and role.
    """
    try:
        #user_plan = current_user.role  # Assuming `plan` is a field in your User model
        user_role = current_user.role  # Assuming `role` is a field in your User model
        return jsonify({
            #'plan': user_plan,
            'role': user_role
        }), 200
    except Exception as e:
        print(f"Error fetching user info: {str(e)}")
        return jsonify({'error': 'Failed to fetch user info'}), 500


@views.route('/api/admin/stats', methods=['GET'])
@login_required
def get_admin_stats():
    if current_user.role != 'admin':
        return jsonify({'error': 'Unauthorized'}), 403

    try:
        # Gather statistics
        total_users = User.query.count()
        free_users = User.query.filter_by(role='free').count()
        pro_users = User.query.filter_by(role='pro').count()
        admin_users = User.query.filter_by(role='admin').count()

        ai_summary_count = SavedSummary.query.count()
        scheduled_post_count = ScheduledPost.query.count()
        email_usage_count = SavedSummary.query.filter(SavedSummary.sent_at != None).count()

        return jsonify({
            'user_counts': {
                'total': total_users,
                'free': free_users,
                'pro': pro_users,
                'admin': admin_users
            },
            'ai_summary_count': ai_summary_count,
            'scheduled_post_count': scheduled_post_count,
            'email_usage_count': email_usage_count
        }), 200

    except Exception as e:
        print(f"Error fetching admin stats: {e}")
        return jsonify({'error': 'Failed to load admin stats'}), 500
