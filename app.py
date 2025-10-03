import os
from flask import Flask, request, render_template, send_from_directory
from werkzeug.utils import secure_filename
import pandas as pd
import numpy as np
from tensorflow.keras.models import load_model
from scipy.ndimage import uniform_filter1d

app = Flask(__name__, template_folder='.')

# Serve all CSS files
@app.route('/<filename>.css')
def serve_css(filename):
    return send_from_directory('.', f'{filename}.css')

# Serve JavaScript files
@app.route('/<filename>.js')
def serve_js(filename):
    return send_from_directory('.', f'{filename}.js')

# Serve image files from assets folder
@app.route('/assets/<filename>')
def serve_assets(filename):
    return send_from_directory('assets', filename)

# Serve image files from img folder
@app.route('/img/<filename>')
def serve_img(filename):
    return send_from_directory('img', filename)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'best_model.keras')

try:
    model = load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ ERROR loading model: {e}")
    model = None

def preprocess_csv(filepath):
    df = pd.read_csv(filepath)
    flux_data = df.values
    flux_data = ((flux_data - np.mean(flux_data, axis=1).reshape(-1,1)) / 
                 np.std(flux_data, axis=1).reshape(-1,1))
    flux_data = np.stack([flux_data, uniform_filter1d(flux_data, axis=1, size=200)], axis=2)
    return flux_data

# Route for main homepage (index.html)
@app.route('/')
def home():
    return render_template('index.html')

# Route for index2.html
@app.route('/find')
def find():
    return render_template('index2.html')

# Route for analysis tool (index3.html)
@app.route('/analyze', methods=['GET', 'POST'])
def analyze():
    if request.method == 'POST':
        return handle_prediction()
    return render_template('index3.html')

def handle_prediction():
    if model is None:
        return render_template('index3.html', error_message="Model not loaded.")
    if 'file' not in request.files or not request.files['file'].filename:
        return render_template('index3.html', error_message="No file selected.")
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        data = preprocess_csv(filepath)
        predictions = model.predict(data)
        results = []
        for i, p in enumerate(predictions):
            result_text = "Exoplanet Detected" if p[0] > 0.5 else "No Exoplanet Detected"
            results.append(f"Star {i+1}: {result_text} (Confidence: {p[0]:.2%})")
        return render_template('index3.html', results=results)
    except Exception as e:
        return render_template('index3.html', error_message=f"Processing error: {e}")

if __name__ == '__main__':
    app.run(debug=True)