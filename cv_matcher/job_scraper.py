import requests
from bs4 import BeautifulSoup



def scrape_job(url):
    # 1. Pobierz stronę
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0'
    })

    soup = BeautifulSoup(response.text, 'html-parser')

    for tag in soup(['script', 'style', 'nav', 'footer']):
        tag.decompse()

    return soup.get_text(separator=' ', strip=True)
