import json
import os
from dotenv import load_dotenv
from cv_matcher.prompts import build_prompt

load_dotenv()

def analyze_cv(cv_text, job_text):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        return mock_response()

    return call_claude(cv_text, job_text)

def call_claude(cv_text, job_text):
    import anthropic
    client = anthropic.Anthropic()

    message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1000,
        messages=[
            {"role": "user", "content": build_prompt(cv_text, job_text)}
        ]
    )

    response_text = message.content[0].text
    clean = response_text.replace("```json", "").replace("```", "").strip()
    start = clean.find('{')
    end = clean.rfind('}') + 1
    json_only = clean[start:end]
    print(f"DEBUG json_only: {json_only}")
    return json.loads(json_only)
    
def mock_response():
    return {
        "score": 72,
        "gaps": ["Docker i Kubernetes", "CI/CD", "Angielski C1+"],
        "rewrite": {
            "Doświadczenie": {
                "before": "Pisałem kod w Pythonie",
                "after": "Projektowałem mikroserwisy w Pythonie"
            }
        }
    }