import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")

try:
    response = openai.OpenAI().models.list()
    print(response)
except Exception as e:
    print(f"Error: {e}")
