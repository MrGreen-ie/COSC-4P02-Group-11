# for home page (what features inside /(home) page)
from email.mime.text import MIMEText
import smtplib
from flask import Blueprint, render_template, request, flash, jsonify, redirect, session, current_app
from flask_login import login_required, current_user
from .models import Note, ScheduledPost
from . import db
from .cache import redis_cache
import openai
import os
import json
import uuid
import random
from datetime import datetime
from werkzeug.utils import secure_filename

# json
import requests
import markdown
from datetime import datetime
import pytz
from cryptography.fernet import Fernet
import base64

# for environment variables
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# OpenAI client initialization
openai.api_key = os.getenv('OPENAI_API_KEY')

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

# Email/Newsletter API routes
@views.route('/api/newsletter/subscribe', methods=['POST'])
def send_email():
    data = request.json
    recipient = data['recipient']
    subject = data['subject']
    body = data['body']

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = 'cosc.4p02.summit@gmail.com'
    msg['To'] = recipient

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login('cosc.4p02.summit@gmail.com', 'kght ejuo omgw oqru')
            server.sendmail('cosc.4p02.summit@gmail.com', recipient, msg.as_string())
        return jsonify({'message': 'Email sent successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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
        
        if not data or 'content' not in data:
            return jsonify({'error': 'No content provided'}), 400
            
        content = data['content']
        length = data.get('length', 50)  # Default to 50% length
        tone = data.get('tone', 'professional')  # Default to professional tone
        
        # Try to get cached summary
        cached_result = redis_cache.get_cached_summary(content, length, tone)
        if cached_result:
            return jsonify(cached_result)
        
        # Create system message based on tone and length
        system_message = f"You are an AI assistant that creates {tone} summaries. "
        system_message += f"Create a summary that is approximately {length}% of the original length. "
        system_message += "Maintain the key points while adjusting the length and tone as specified."
        
        # Make API call to OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": f"Please summarize the following text:\n\n{content}"}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        # Extract the summary from the response
        summary = response.choices[0].message['content']
        
        # Prepare response data
        response_data = {
            'summary': summary,
            'original_content': content,
            'settings': {
                'length': length,
                'tone': tone
            },
            'cached': False
        }
        
        # Cache the result
        redis_cache.cache_summary(content, length, tone, response_data)
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
