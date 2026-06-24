import os
from flask import Flask
from dotenv import load_dotenv
 
load_dotenv()
 
def create_app():
    app = Flask(__name__)
 
    # --- Konfiguracja ---
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me")
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads")
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # max 5 MB na plik CV
    app.config["ALLOWED_EXTENSIONS"] = {"pdf", "docx"}
    app.config["ANTHROPIC_API_KEY"] = os.getenv("ANTHROPIC_API_KEY")
 
    # Utwórz folder na uploady jeśli nie istnieje
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
 
    # Sprawdź czy klucz API jest ustawiony
    if not app.config["ANTHROPIC_API_KEY"]:
        import warnings
        warnings.warn(
            "ANTHROPIC_API_KEY nie jest ustawiony! "
            "Dodaj go do pliku .env przed uruchomieniem analizy.",
            stacklevel=2,
        )
 
    # --- Rejestracja blueprintów ---
    from cv_matcher.routes import main_bp
    app.register_blueprint(main_bp)
 
    return app
 
 
if __name__ == "__main__":
    app = create_app()
    debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    print(f"CV Matcher uruchomiony na http://localhost:{port}")
    app.run(debug=debug, port=port)
 