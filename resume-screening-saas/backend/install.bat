@echo off
cd /d "%~dp0"
call venv\Scripts\activate.bat
pip install fastapi uvicorn python-multipart pypdf2 spacy sentence-transformers scikit-learn
python -m spacy download en_core_web_sm
