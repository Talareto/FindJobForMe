import json
import os

def analyze(cv_text, job_text):
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        return mock_response()
    
    return call_claude(cv_text, job_text)

def call_claude(cv_text, job_text):

    import anthropic
    from cv_matcher.prompts import build_prompt


    client = anthropic.Anthropic()

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[
            {"role": "user", "content": build_prompt(cv_text, job_text)}
        ]
    )

    response_text = message.content[0].text
    return json.loads(response_text)


def mock_response():
    return {
        "score": 72,
        "gaps": [
            "Docker i Kubernetes",
            "Doświadczenie z CI/CD",
            "Język angielski C1+"
        ],
        "rewrite": {
            "Doświadczenie": {
                "before": "Pisałem kod w Pythonie",
                "after": "Projektowałem mikroserwisy w Pythonie obsługujące 50k req/dzień"
            },
            "Umiejętności": {
                "before": "Python, SQL",
                "after": "Python, FastAPI, PostgreSQL, Docker — zgodnie z wymaganiami oferty"
            }
        }
    }
