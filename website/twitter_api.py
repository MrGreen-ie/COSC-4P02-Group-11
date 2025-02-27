import os
import tweepy
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import json
from flask import session
import base64

# Load environment variables
load_dotenv()

# Twitter API credentials - Using a different approach with direct authentication
# For development purposes only - in production, these should be securely stored
TWITTER_API_KEY = "uyEH7WsRjEvx2zfKqWpPZNe8J"
TWITTER_API_SECRET = "ZUNAJpqHcjlLt5q6RKSr6LWdcyZJeeYkEeZMkWGemwheXCAZZw"
TWITTER_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAANYqzgEAAAAAo7B8grAhuBgSF5Xf2Xd2Yev1nSE%3DBeRFbPH2d7KmQ5uwRZXEWBbEgiU3b1EgiU3b1EgqHkzM1MdTEpuytYAz2"
TWITTER_ACCESS_TOKEN = "846222756781834240-ToTHFa3UBKdbvU5n04ikwbjMzKktvh5"
TWITTER_ACCESS_SECRET = "m77LO6GMlcCMAKQo0PNgbgSidfPUQul18AvFtWstZNX7S"

# Generate a proper Fernet key
def generate_key():
    return Fernet.generate_key()

# Encryption key for storing tokens securely
ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
if not ENCRYPTION_KEY:
    ENCRYPTION_KEY = generate_key()
    print("Generated new encryption key")
else:
    try:
        # Verify the key is valid
        Fernet(ENCRYPTION_KEY.encode())
    except Exception:
        print("Invalid encryption key in environment, generating new one")
        ENCRYPTION_KEY = generate_key()

# Create cipher suite with the key
cipher_suite = Fernet(ENCRYPTION_KEY)

# Module-level functions for direct import
def verify_credentials(access_token, access_token_secret):
    """
    Verify Twitter credentials by making a test API call
    
    Args:
        access_token (str): Twitter access token
        access_token_secret (str): Twitter access token secret
        
    Returns:
        dict: Result of the verification with user info if successful
    """
    try:
        # Create Twitter API client with user credentials
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=access_token,
            access_token_secret=access_token_secret
        )
        
        # Get the authenticated user's information
        user_info = client.get_me(user_fields=['name', 'username', 'profile_image_url'])
        
        if user_info.data:
            return {
                'success': True,
                'user_info': {
                    'id': user_info.data.id,
                    'name': user_info.data.name,
                    'username': user_info.data.username,
                    'profile_image_url': getattr(user_info.data, 'profile_image_url', None)
                }
            }
        else:
            return {
                'success': False,
                'error': 'Could not retrieve user information'
            }
    
    except Exception as e:
        # Handle any exceptions that might occur
        return {
            'success': False,
            'error': str(e)
        }

def post_tweet(content, credentials):
    """
    Post a tweet using the provided credentials
    
    Args:
        content (str): The content of the tweet
        credentials (dict): Twitter credentials with access_token and access_token_secret
        
    Returns:
        dict: Result of the tweet operation
    """
    try:
        if not credentials:
            return {
                'success': False,
                'error': 'Twitter credentials not provided'
            }
        
        access_token = credentials.get('access_token')
        access_token_secret = credentials.get('access_token_secret')
        
        if not access_token or not access_token_secret:
            return {
                'success': False,
                'error': 'Invalid Twitter credentials'
            }
        
        # Create Twitter API client with user credentials
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=access_token,
            access_token_secret=access_token_secret
        )
        
        # Post the tweet
        response = client.create_tweet(text=content)
        
        # Extract the tweet ID from the response
        tweet_id = response.data['id']
        
        return {
            'success': True,
            'tweet_id': tweet_id
        }
    
    except Exception as e:
        # Handle any exceptions that might occur
        return {
            'success': False,
            'error': str(e)
        }

def complete_oauth(oauth_token, oauth_verifier):
    """
    Complete the OAuth flow with the token and verifier
    
    Args:
        oauth_token (str): OAuth token from the callback
        oauth_verifier (str): OAuth verifier from the callback
        
    Returns:
        dict: Result with access tokens if successful
    """
    try:
        # Get the request token from the session
        request_token = session.get('request_token', {})
        
        print(f"Retrieved request token from session: {request_token}")
        
        if not request_token:
            print("No request token found in session. Creating new OAuth handler...")
            # If no request token in session, try to proceed with just the oauth_token
            auth = tweepy.OAuth1UserHandler(
                TWITTER_API_KEY,
                TWITTER_API_SECRET,
                callback="http://localhost:3000"
            )
            
            # Set the request token with just what we have
            auth.request_token = {
                'oauth_token': oauth_token,
                'oauth_token_secret': ''  # We don't have this, but try anyway
            }
        else:
            # Create OAuth1 handler
            auth = tweepy.OAuth1UserHandler(
                TWITTER_API_KEY,
                TWITTER_API_SECRET,
                callback="http://localhost:3000"
            )
            
            # Set the request token
            auth.request_token = {
                'oauth_token': oauth_token,
                'oauth_token_secret': request_token.get('oauth_token_secret', '')
            }
        
        try:
            # Get the access token
            access_token, access_token_secret = auth.get_access_token(oauth_verifier)
            
            print(f"Successfully obtained access token: {access_token}")
            
            # Create a client with the access token to get user info
            client = tweepy.Client(
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=access_token,
                access_token_secret=access_token_secret
            )
            
            # Get the user information
            user_info = client.get_me(user_fields=['name', 'username'])
            
            if user_info.data:
                return {
                    'success': True,
                    'username': user_info.data.username,
                    'name': user_info.data.name,
                    'access_token': access_token,
                    'access_token_secret': access_token_secret
                }
            else:
                return {
                    'success': False,
                    'error': 'Could not retrieve user information'
                }
        except Exception as e:
            print(f"Error getting access token: {str(e)}")
            return {
                'success': False,
                'error': f"Error getting access token: {str(e)}"
            }
    
    except Exception as e:
        # Handle any exceptions that might occur
        print(f"Error in complete_oauth: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def direct_auth(username, password):
    """
    Directly authenticate with Twitter using username and password
    This is a simplified version for development - in production, OAuth is required
    
    Args:
        username (str): Twitter username
        password (str): Twitter password
        
    Returns:
        dict: Result with access tokens if successful
    """
    try:
        print(f"Direct auth attempt for user: {username}")
        
        # For development, we'll use the app's tokens directly
        # In production, this would use the OAuth flow
        
        # Create a client with the app's tokens
        client = tweepy.Client(
            consumer_key=TWITTER_API_KEY,
            consumer_secret=TWITTER_API_SECRET,
            access_token=TWITTER_ACCESS_TOKEN,
            access_token_secret=TWITTER_ACCESS_SECRET
        )
        
        # Try to verify the credentials
        try:
            # Get the authenticated user's information
            user_info = client.get_me(user_fields=['name', 'username'])
            
            if user_info.data:
                return {
                    'success': True,
                    'username': user_info.data.username,
                    'name': user_info.data.name,
                    'access_token': TWITTER_ACCESS_TOKEN,
                    'access_token_secret': TWITTER_ACCESS_SECRET
                }
            else:
                return {
                    'success': False,
                    'error': 'Could not retrieve user information'
                }
        except Exception as e:
            print(f"Error verifying credentials: {str(e)}")
            return {
                'success': False,
                'error': f"Error verifying credentials: {str(e)}"
            }
            
    except Exception as e:
        print(f"Error in direct auth: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

class TwitterAPI:
    @staticmethod
    def get_oauth_handler():
        """Create and return an OAuth1UserHandler for Twitter authentication"""
        auth = tweepy.OAuth1UserHandler(
            TWITTER_API_KEY, 
            TWITTER_API_SECRET
        )
        return auth
    
    @staticmethod
    def get_auth_url():
        """Get the Twitter authentication URL for the OAuth flow"""
        try:
            # Create OAuth handler
            auth = tweepy.OAuth1UserHandler(
                TWITTER_API_KEY, 
                TWITTER_API_SECRET,
                callback="http://localhost:3000"  # Use frontend URL as callback
            )
            
            # Get the authorization URL
            redirect_url = auth.get_authorization_url()
            
            # Store the request token in the session for later use
            session['request_token'] = auth.request_token
            print(f"Stored request token in session: {session['request_token']}")
            
            return {
                "success": True,
                "auth_url": redirect_url
            }
        except Exception as e:
            print(f"Error getting Twitter auth URL: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def complete_authentication(oauth_verifier):
        """Complete the Twitter OAuth flow with the verifier from the callback"""
        try:
            # Get the request token from the session
            request_token = session.get('request_token')
            
            if not request_token:
                return {
                    "success": False,
                    "error": "No request token found in session"
                }
            
            # Create OAuth handler and set the request token
            auth = TwitterAPI.get_oauth_handler()
            auth.request_token = request_token
            
            # Get the access token using the verifier
            access_token = auth.get_access_token(oauth_verifier)
            
            # Create a client with the access token
            client = tweepy.Client(
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=access_token[0],
                access_token_secret=access_token[1]
            )
            
            # Get the user information
            user = client.get_me()
            
            # Encrypt the tokens for storage
            encrypted_access_token = cipher_suite.encrypt(access_token[0].encode()).decode()
            encrypted_access_secret = cipher_suite.encrypt(access_token[1].encode()).decode()
            
            return {
                "success": True,
                "user_id": user.data.id,
                "username": user.data.username,
                "name": user.data.name,
                "access_token": encrypted_access_token,
                "access_token_secret": encrypted_access_secret
            }
        except Exception as e:
            print(f"Error completing Twitter authentication: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def post_tweet(content, credentials):
        """
        Post a tweet using the provided credentials
        
        Args:
            content (str): The content of the tweet
            credentials (dict): Twitter credentials with access_token and access_token_secret
            
        Returns:
            dict: Result of the tweet operation
        """
        try:
            if not credentials:
                return {
                    'success': False,
                    'error': 'Twitter credentials not provided'
                }
            
            access_token = credentials.get('access_token')
            access_token_secret = credentials.get('access_token_secret')
            
            if not access_token or not access_token_secret:
                return {
                    'success': False,
                    'error': 'Invalid Twitter credentials'
                }
            
            # Create Twitter API client with user credentials
            client = tweepy.Client(
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=access_token,
                access_token_secret=access_token_secret
            )
            
            # Post the tweet
            response = client.create_tweet(text=content)
            
            # Extract the tweet ID from the response
            tweet_id = response.data['id']
            
            return {
                'success': True,
                'tweet_id': tweet_id
            }
        
        except Exception as e:
            # Handle any exceptions that might occur
            return {
                'success': False,
                'error': str(e)
            }
    
    @staticmethod
    def verify_credentials(access_token, access_token_secret):
        """
        Verify Twitter credentials by making a test API call
        
        Args:
            access_token (str): Twitter access token
            access_token_secret (str): Twitter access token secret
            
        Returns:
            dict: Result of the verification with user info if successful
        """
        try:
            # Create Twitter API client with user credentials
            client = tweepy.Client(
                consumer_key=TWITTER_API_KEY,
                consumer_secret=TWITTER_API_SECRET,
                access_token=access_token,
                access_token_secret=access_token_secret
            )
            
            # Get the authenticated user's information
            user_info = client.get_me(user_fields=['name', 'username', 'profile_image_url'])
            
            if user_info.data:
                return {
                    'success': True,
                    'user_info': {
                        'id': user_info.data.id,
                        'name': user_info.data.name,
                        'username': user_info.data.username,
                        'profile_image_url': getattr(user_info.data, 'profile_image_url', None)
                    }
                }
            else:
                return {
                    'success': False,
                    'error': 'Could not retrieve user information'
                }
        
        except Exception as e:
            # Handle any exceptions that might occur
            return {
                'success': False,
                'error': str(e)
            }
