import PyPDF2
import docx
import os

def parse_cv(filepath):
    extension = os.path.splitext(filepath)[1].lower()

    if extension == '.pdf':
        return parse_pdf(filepath)
    elif extension == '.docx':
        return parse_docx(filepath)
    else:
        return ValueError(f'Nieobsługiwalny forat pliku: {extension}')
    


def parse_pdf(filepath):
    text = ""
    
    with open(filepath, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()


def parse_docx(filepath):
    doc = docx.Document(filepath)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text.strip()

