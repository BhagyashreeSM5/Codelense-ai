import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

print("API KEY:", os.getenv("GEMINI_API_KEY"))