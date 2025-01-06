from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
from skimage.feature import hog, local_binary_pattern
import cv2
from PIL import Image
import numpy as np
import os
from werkzeug.utils import secure_filename
import json
import warnings
from sklearn.ensemble import RandomForestClassifier

warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

TEMP_IMGS = 'uploads'
os.makedirs(TEMP_IMGS, exist_ok=True)
app.config['TEMP_IMGS'] = TEMP_IMGS

CLASS_LABELS = ["Healthy", "Moderate", "Severe"]

def load_model():
    global rf_model, scaler
    model_path = './model/svm_model_and_scaler/svm_model_C10_rbf.joblib'  
    scaler_path = './model/svm_model_and_scaler/scaler.joblib'          

    try:
        if not os.path.exists(model_path):
            print(f"model file does not exist at the specified path: {model_path}")
            rf_model = None
            return
        if not os.path.exists(scaler_path):
            print(f"Scaler file does not exist at the specified path: {scaler_path}")
            scaler = None
            return

        print(f"Loading model from {os.path.abspath(model_path)}")
        rf_model = joblib.load(model_path)
        print("model loaded successfully.")

        print(f"Loading scaler from {os.path.abspath(scaler_path)}")
        scaler = joblib.load(scaler_path)
        print("Scaler loaded successfully.")

    except Exception as e:
        print(f"Error loading model or scaler: {e}")
        rf_model = None
        scaler = None

load_model()

def preprocess_image_rf(image_path, image_size=(128, 128)):
    """
    Apply image pre-processing steps:
    - Convert to grayscale
    - Resize
    - Denoising using Gaussian Blur
    - Contrast Enhancement using Histogram Equalization
    """
    try:
        if not os.path.exists(image_path):
            print(f"Image file does not exist at the specified path: {image_path}")
            return None

        image = Image.open(image_path).convert('L')  # Convert to grayscale
        image = image.resize(image_size)  # Resize the image
        image = np.array(image)

        denoised = cv2.GaussianBlur(image, (5, 5), 0)
        enhanced = cv2.equalizeHist(denoised)

        return enhanced

    except Exception as e:
        print(f"Error in Random Forest image preprocessing: {e}")
        return None

def extract_features_rf(image):
    """
    Extract combined HOG and LBP features from an image.
    """
    try:
        # HOG Features
        hog_feat = hog(image,
                        orientations=9,
                        pixels_per_cell=(8, 8),
                        cells_per_block=(2, 2),
                        block_norm='L2-Hys',
                        visualize=False,
                        transform_sqrt=True)

        # LBP Features
        lbp = local_binary_pattern(image, P=8, R=1, method='uniform')
        # Compute the histogram of the LBP
        (hist, _) = np.histogram(lbp.ravel(),
                                    bins=np.arange(0, 10),
                                    range=(0, 9))
        # Normalize the histogram
        hist = hist.astype("float")
        hist /= (hist.sum() + 1e-7)

        # Combine HOG and LBP features
        combined_features = np.hstack([hog_feat, hist])

        return combined_features

    except Exception as e:
        print(f"Error in Random Forest feature extraction: {e}")
        return None

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        print("No image uploaded in the request")
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        print("No file selected in the upload")
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(image_file.filename):
        print("Uploaded file has an invalid extension")
        return jsonify({'error': 'Invalid file type'}), 400

    try:
        filename = secure_filename(image_file.filename)
        file_path = os.path.join(app.config['TEMP_IMGS'], filename)
        image_file.save(file_path)
        print(f"Image saved to {file_path}")

        # Preprocess 
        preprocessed_image = preprocess_image_rf(file_path)
        if preprocessed_image is None:
            print("Error processing the image during preprocessing")
            return jsonify({'error': 'Error processing image'}), 500

        features = extract_features_rf(preprocessed_image)
        if features is None:
            print("Error extracting features from the image")
            return jsonify({'error': 'Error extracting features'}), 500

        if scaler is None:
            print("Scaler not loaded")
            return jsonify({'error': 'Scaler not loaded'}), 500

        features_scaled = scaler.transform([features])
        print(f"Scaled features shape: {features_scaled.shape}")

        if rf_model is None:
            print("Random Forest model not loaded")
            return jsonify({'error': 'Model not loaded'}), 500

        prediction = rf_model.predict(features_scaled)
        prediction_proba = rf_model.predict_proba(features_scaled)

        print(f"Raw Prediction: {prediction}")
        print(f"Prediction Probabilities: {prediction_proba}")

        # Assuming predict_proba returns probabilities for each class
        predictions_list = prediction_proba[0].tolist()
        print(f"Predictions list: {predictions_list}")

        predictions_dict = {label: prob for label, prob in zip(CLASS_LABELS, predictions_list)}
        print(f"Predictions as dictionary: {predictions_dict}")

        #class with the highest probability
        predicted_class = CLASS_LABELS[np.argmax(predictions_list)]
        predicted_probability = np.max(predictions_list)
        print(f"Predicted Class: {predicted_class} with probability {predicted_probability:.4f}")

        # delete the uploaded file
        os.remove(file_path)
        print(f"Temporary file {file_path} removed")

        return jsonify({
            'predictions': predictions_dict,
            'predicted_class': predicted_class,
            'probability': predicted_probability
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Error during prediction'}), 500

# Health Check 
@app.route('/health', methods=['GET'])
def health():
    if rf_model is not None and scaler is not None:
        return jsonify({'status': 'Random Forest model and scaler loaded successfully and service is healthy'}), 200
    else:
        return jsonify({'status': 'Model or scaler not loaded'}), 500

@app.route('/predict/info', methods=['GET'])
def get_disease_info():
    # disease name was sent by frontend as a URL parameter, we will extract it
    disease_name = request.args.get('disease')
    try:
        with open('disease-data.json', 'r') as file:
            disease_data = json.load(file)

        if disease_name in disease_data:
            return jsonify({disease_name: disease_data[disease_name]}), 200
        else:
            return jsonify({'error': f'Disease "{disease_name}" not found'}), 404  # handle unknown diseases
    except Exception as e:
        print(f"Error loading disease data: {e}")
        return jsonify({'error': 'Could not load disease data'}), 500

if __name__ == '__main__':
    if rf_model is not None and scaler is not None:
        app.run(port=3001, debug=True)
    else:
        print("Failed to load the Random Forest model or scaler. Exiting.")
