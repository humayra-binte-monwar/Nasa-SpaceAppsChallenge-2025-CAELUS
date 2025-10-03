# A World Away: Hunting for Exoplanets with AI

## Overview

*A World Away* is an engaging web application developed for the "A World Away: Hunting for Exoplanets with AI" challenge. It transforms complex exoplanet science into an interactive, curiosity-driven experience. Users can explore 3D visualizations of our Solar System, Kepler K2, and TESS missions, learn about planetary details and habitability, and upload flux data CSVs for AI-powered exoplanet detection.

The app bridges education and technology: immersive 3D models make astronomy fun and approachable, while a custom CNN model analyzes light curves with confidence scores and SHAP explainability. Ideal for students, educators, and space enthusiasts eager to hunt for worlds beyond our own.

## Key Features

- **3D System Explorations**:
  - Interactive 3D views of the Solar System, Kepler K2, and TESS missions.
  - Click planets for facts, orbital stats, and habitability assessments.

- **AI Exoplanet Detection**:
  - Upload CSV flux data (time-series light curves).
  - Binary classification via CNN: detects potential exoplanets with probability scores.
  - SHAP visualizations explain model decisions (e.g., key transit features).

- **Educational Elements**:
  - Quick facts on planets and missions.
  - Habitability checklists to evaluate life potential.

- **Seamless Interface**:
  - Homepage routes to "Identify an Exoplanet" (3D views) and "Find an Exoplanet" (AI upload).
  - Responsive design with modern JS and CSS.

## Tech Stack

- **Backend**: Flask (Python) for API and model serving.
- **Machine Learning**: TensorFlow/Keras (CNN for flux analysis), SHAP (interpretability).
- **Frontend**: HTML5, CSS3, JavaScript (Three.js for 3D rendering).
- **Data Processing**: Pandas, NumPy (in Jupyter notebooks for development).
- **Model Storage**: Keras (.keras format for the trained CNN).
- **Deployment**: Local Flask server; deployable to Heroku/Vercel.

## Model Architecture

The AI backbone is a 1D CNN tailored for flux time-series data, detecting transit signals from exoplanets. It uses progressive convolutions, pooling, and regularization for robust performance.

```python
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPool1D, BatchNormalization, Flatten, Dropout, Dense

model = Sequential()
model.add(Conv1D(filters=8, kernel_size=11, activation='relu', input_shape=(x_train.shape[1], x_train.shape[2])))
model.add(MaxPool1D(strides=4))
model.add(BatchNormalization())
model.add(Conv1D(filters=16, kernel_size=11, activation='relu'))
model.add(MaxPool1D(strides=4))
model.add(BatchNormalization())
model.add(Conv1D(filters=32, kernel_size=11, activation='relu'))
model.add(MaxPool1D(strides=4))
model.add(BatchNormalization())
model.add(Conv1D(filters=64, kernel_size=11, activation='relu'))
model.add(MaxPool1D(strides=4))
model.add(Flatten())
model.add(Dropout(0.5))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.25))
model.add(Dense(64, activation='relu'))
model.add(Dense(1, activation='sigmoid'))  # Sigmoid for exoplanet probability
```

- **Pre-trained Model**: `best_model.keras` (loaded in `app.py`).
- **Development Notebooks**: `Exoplanet Identification.ipynb` and `trial-run.ipynb` detail training and testing.

## Quick Start

### Prerequisites
- Python 3.8+
- Git
- Web browser (Chrome/Firefox recommended for 3D).

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/humayra-bin-monwar/A-World-Away.git
   cd A-World-Away
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. Install dependencies (create `requirements.txt` first—see below):
   ```
   pip install -r requirements.txt
   ```

4. (Optional) Explore/Retrain Model:
   - Run `jupyter notebook` and open `Exoplanet Identification.ipynb` for model insights.

### Running the App

1. Start the Flask server:
   ```
   python app.py
   ```
   (Or `flask run` if using Flask CLI.)

2. Visit `http://localhost:5000` in your browser.

- **Identify**: Launch 3D explorations (via `index.html`, `index2.html`, etc.).
- **Find**: Upload CSV for AI detection—expect outputs like "92% confidence: Exoplanet likely (SHAP: Strong dip at t=1500s)."

## Requirements.txt

Add this file to your repo root for easy setup:

```
tensorflow>=2.10.0
pandas>=1.5.0
numpy>=1.21.0
scikit-learn>=1.2.0
shap>=0.41.0
matplotlib>=3.6.0
flask>=2.3.0
jupyter  # For notebooks
```

## Acknowledgments

- NASA Exoplanet Archive for data inspiration.
- Space Apps Challenge for the spark.
- Open-source heroes: TensorFlow, Three.js, SHAP.
- Kepler Labelled Time Series Data dataset from Kaggle for training the model.

---

*Embark on the hunt—exoplanets are calling.* 🌟 *Updated: October 03, 2025*
