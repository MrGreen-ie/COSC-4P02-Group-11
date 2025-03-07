# Current Project Structure

## Project Structure

### Root Level
```
.
├── .gitignore                # Git ignore file
├── email-login.txt           # Email login credentials
├── main.py                   # Main application entry point
├── pytest.ini                # PyTest configuration
├── README.md                 # Project documentation
└── requirements.txt          # Python dependencies
```

### Backend (Flask)
```
website/
├── __init__.py               # Flask application factory
├── async_processor.py        # Asynchronous task processing
├── auth.py                   # Authentication routes and logic
├── cache.py                  # Redis caching implementation
├── content_filter.py         # Content filtering functionality
├── content_processor.py      # Content processing logic
├── filter_lists/             # Content filtering lists
│   ├── inappropriate.json    # Inappropriate content filters
│   ├── sensitive.json        # Sensitive content filters
│   └── spam.json             # Spam content filters
├── models.py                 # Database models
├── scheduler.py              # Task scheduling functionality
├── twitter_api.py            # Twitter API integration
└── views.py                  # Application routes
```

### Static Assets
```
website/static/
├── index.js                  # Legacy JavaScript
└── style.css                 # Global styles
```

### Tests
```
website/tests/
├── conftest.py               # PyTest fixtures and configuration
├── test_async_processor.py   # Tests for async processing
├── test_content_filter.py    # Tests for content filtering
├── test_content_processor.py # Tests for content processing
└── test_redis.py             # Redis connection tests
```

### Frontend (React + Vite)
```
website/templates/
├── .env.local                # Local environment variables
├── index.html                # Main HTML template
├── package.json              # Dependencies and scripts
├── TWITTER_AUTH_README.md    # Twitter authentication documentation
├── vite.config.js            # Vite configuration
└── src/
    ├── App.jsx               # Root component and routing
    ├── index.jsx             # React DOM rendering
    ├── main.jsx              # Application entry point
    ├── components/           # Reusable components
    │   ├── NavBar.jsx        # Navigation sidebar
    │   ├── SocialMediaConnect.jsx # Social media connection component
    │   └── TwitterAuth.jsx   # Twitter authentication component
    ├── pages/                # Page components
    │   ├── _app.jsx          # Next.js app container
    │   ├── AboutUs.jsx       # About us page
    │   ├── AISummary.jsx     # AI content summary
    │   ├── api/auth/[...nextauth].js # Next Auth routes
    │   ├── Contact.jsx       # Contact page
    │   ├── Editor.jsx        # Content editor
    │   ├── Favourites.jsx    # Saved content
    │   ├── History.jsx       # Content history tracking
    │   ├── Home.jsx          # Dashboard page
    │   ├── Login.jsx         # User authentication
    │   ├── Newsletters.jsx   # Newsletter management
    │   ├── PostSystem.jsx    # Social media posting
    │   ├── PostSystemWithTwitterAuth.jsx # Social posting with Twitter auth
    │   ├── Register.jsx      # User registration
    │   └── Template.jsx      # Template management
    ├── services/             # API services
    │   └── api.js            # API client
    └── utils/                # Utility functions
        └── draft-polyfill.js # Draft.js helpers
```