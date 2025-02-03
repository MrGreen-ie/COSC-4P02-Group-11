import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

try:
    print("Testing OpenAI API inside Flask environment...")
    response = openai.OpenAI().models.list()
    print(response)
except Exception as e:
    print(f"Flask OpenAI API Error: {e}")
