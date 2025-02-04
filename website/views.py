# for home page (what features inside /(home) page)
from flask import Blueprint, render_template, request, flash, jsonify

# current_user if the current user is logged this will give all the infos regarding the user
from flask_login import login_required, current_user

# import Note from db models, db from init
from .models import Note
from . import db

# json
import json

# for python request (dealing API fetching)
import requests

# for openai API
from openai import OpenAI

# for markdown formatting, basically formatting the reponse we get back from calling OpenAI API as markdown
import markdown

# OpenAI key
client = OpenAI(api_key="for api key refers to our discord discussion")

# views blueprint
views = Blueprint("views", __name__)


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
                completion = client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "developer",
                            "content": "You are a helpful assistant that can output Markdown.",
                        },
                        {"role": "user", "content": question},
                    ],
                )
                ai_answer = completion.choices[0].message.content

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
