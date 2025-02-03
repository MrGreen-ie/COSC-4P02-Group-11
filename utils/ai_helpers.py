import openai
import os
import httpx

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def summarize_text(text):
    try:
        print(f"Using OpenAI Version: {openai.__version__}")  # Debugging

        # Use HTTPX Client for better connection handling
        with httpx.Client(timeout=30) as http_client:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an AI assistant that summarizes text."},
                    {"role": "user", "content": f"Summarize this: {text}"}
                ],
                timeout=30
            )

        return response.choices[0].message.content.strip()

    except openai.OpenAIError as e:
        print(f"OpenAI API Error: {e}")
        return f"Error: {str(e)}"
    except Exception as e:
        print(f"General Connection Error: {e}")
        return f"Error: {str(e)}"
