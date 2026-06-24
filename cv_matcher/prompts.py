def build_prompt(cv_text, job_text):
    return f"""
Jesteś ekspertem HR. Przeanalizuj CV kandydata i ofertę pracy.

Zwróć odpowiedź TYLKO jako JSON w tym formacie:
{{
    "score": <liczba 0-100>,
    "gaps": ["brak 1", "brak 2", "brak 3"],
    "rewrite": {{
        "Doświadczenie": {{
            "before": "obecna treść z CV",
            "after": "ulepszona wersja pod tę ofertę"
        }}
    }}
}}

CV KANDYDATA:
{cv_text}

OFERTA PRACY:
{job_text}
"""