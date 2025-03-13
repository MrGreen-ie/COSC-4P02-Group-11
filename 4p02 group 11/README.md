# 4P02-G11

### Setup & Installation
- Basic flask extension
  pip3 install flask
  pip3 install flask-login
  pip3 install flask-sqlalchemy
  pip3 install flask-cors
```

- OpenAi
```
  pip3 install --upgrade openai
```
- For formatting the AI reponse in markdown
```
  pip3 install markdown
```

React:
- Cd into templates/ where the react project is located
```
  npm install
```


## Running the tests
Backend (running on http://127.0.0.1:5000/):
- Open one terminal, cd into project folder and run:
```
    python3 main.py
```

Frontend (running on http://127.0.0.1:3000/):
- Open a 2nd terminal, cd into templates/ where the react project is located
```
    npm run dev
```


## Running the tests

- Homepage

```
  http://127.0.0.1:3000/
  http://127.0.0.1:3000/dashboard
```

- Login page

```
  http://127.0.0.1:3000/login
```

- Sign-up Page

```
  http://127.0.0.1:3000/sign-up
```

- Checking database
Use 

```
  https://sqliteviewer.app/
```

Drag and drop database.db located in the 'instance' folder onto the site to view it.
You will have to upload the file again to see any databasechanges, as 
it doesn't update automatically.


## Social Media Post System

The Social Media Post System allows users to create, schedule, and manage posts across multiple social media platforms from a single interface.

### Features

- **Multi-Platform Integration**: Post to Twitter, Facebook, and LinkedIn simultaneously
- **Post Scheduling**: Schedule posts for future publication
- **Content Validation**: Automatically validates content against platform-specific rules (e.g., character limits)
- **Real-time Status Updates**: Get immediate feedback on post success or failure
- **Secure API Key Management**: All social media API keys are encrypted using AES-256

### Technical Implementation

- **Backend**: Flask with SQLAlchemy for database management
- **Frontend**: React with Material-UI for a modern, responsive interface
- **Scheduling**: APScheduler for handling scheduled posts
- **Security**: Cryptography library for API key encryption

### Setup Instructions

1. Install backend dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Install frontend dependencies:
   ```
   cd website/templates
   npm install
   ```

3. Set up environment variables in `.env` file:
   ```
   ENCRYPTION_KEY=your_secure_encryption_key
   ```

4. Run the application:
   ```
   python main.py
   ```

5. Access the application at http://localhost:5000

### API Endpoints

- `POST /api/posts/publish`: Publish content to selected platforms immediately
- `POST /api/posts/schedule`: Schedule a post for future publication
- `GET /api/posts/scheduled`: Get all scheduled posts for the current user
- `DELETE /api/posts/scheduled/<post_id>`: Delete a scheduled post

### Social Media Platform Integration

In a production environment, you would need to:

1. Register developer accounts on each social media platform
2. Create applications to obtain API keys
3. Implement OAuth2 flows for user authentication
4. Store encrypted API keys securely

The current implementation includes simulation of these APIs for demonstration purposes.


## Updating Database:

- Run this command to make sure you have the necessary dependencies:
,,  pip install flask-migrate flask-sqlalchemy

- If it's already installed, you can upgrade it:
,,  pip install --upgrade flask-migrate flask-sqlalchemy

- Make sure you're in the correct directory
,, ..\COSC-4P02-Group-11\4p02 group 11

- Run
,, $env:FLASK_APP="website:create_app"

,, flask db init

,, flask db migrate -m "WHAT YOU UPDATE"

,, flask db upgrade


