import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

def scrape_job(url):
    
    response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    if response.status_code == 403:
        return scrape_with_playwright(url)
    
    soup = BeautifulSoup(response.text, 'html.parser')
    for tag in soup(['script', 'style', 'nav', 'footer']):
        tag.decompose()
    return soup.get_text(separator=' ', strip=True)

def scrape_with_playwright(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()
        page.goto(url)
        page.wait_for_timeout(5000)
        html = page.content()
        browser.close()
    
    print(f"DEBUG playwright pierwsze 500: {html[:500]}")  # ← dodaj
    
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(['script', 'style', 'nav', 'footer']):
        tag.decompose()
    return soup.get_text(separator=' ', strip=True)