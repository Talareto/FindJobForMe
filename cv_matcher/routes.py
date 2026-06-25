from flask import Blueprint, render_template, request, jsonify
import os
from cv_matcher.analyzer import analyze_cv
from cv_matcher.cv_parser import parse_cv
from cv_matcher.job_scraper import scrape_job

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    return render_template("index.html")

@main_bp.route('/results')
def restults():
    return render_template('results.html')

@main_bp.route('/analyze', methods = ['POST'])
def analyze():

    cv_file =  request.files['cv']
    job_url = request.form['job_url']

    filepath = os.path.join('uploads', cv_file.filename)
    cv_file.save(filepath)

    cv_text = parse_cv(filepath)

    job_text = scrape_job(job_url)

    result = analyze_cv(cv_text, job_text)
    return jsonify(result)
