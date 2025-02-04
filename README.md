# 4p02-flask-app

### Setup & Installation
- Basic flask extension
```
  pip3 install flask

  pip3 install flask-login

  pip3 install flask-sqlalchemy
```

- OpenAi
```
  pip3 install --upgrade openai
```

- For formatting the AI reponse in markdown

```
  pip3 install markdown
```

- React
Cd into templates/ where the react project is located
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


## Built on top of this tutorial with some minor tweaks/additions

- [Python Website Full Tutorial - Flask, Authentication, Databases & More](https://www.youtube.com/watch?v=dam0GPOAvVI&t=2317s)
