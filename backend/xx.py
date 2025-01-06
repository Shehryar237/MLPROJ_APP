import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input
from PIL import Image
import numpy as np
import os

# Define the class labels in the order your model outputs them
CLASS_LABELS = ["AK", "Acne", "BCC", "DF", "MEL", "NV", "SCC", "SEK", "VASC"]

def focal_loss_fixed(y_true, y_pred):
    """
    Focal Loss for multi-class classification.
    """
    gamma = 2.0
    alpha = 0.25
    num_classes = 9

    # Clip the predictions to prevent log(0) error
    y_pred = tf.clip_by_value(y_pred, tf.keras.backend.epsilon(), 1 - tf.keras.backend.epsilon())

    if len(y_true.shape) == 2 and y_true.shape[-1] == num_classes:
        y_true_one_hot = y_true
    else:
        y_true_one_hot = tf.keras.backend.one_hot(tf.cast(y_true, 'int32'), num_classes)

    # Compute cross-entropy loss
    cross_entropy_loss = -y_true_one_hot * tf.keras.backend.log(y_pred)

    # Compute focal loss
    focal_loss = alpha * tf.keras.backend.pow((1 - y_pred), gamma) * cross_entropy_loss

    # Sum the losses over the classes and take the mean over the batch
    return tf.keras.backend.mean(tf.keras.backend.sum(focal_loss, axis=1))

def load_model(model_path):
    """
    Loads the trained Keras model with the custom focal loss function.

    Parameters:
    - model_path: Path to the saved Keras model.

    Returns:
    - Loaded Keras model.
    """
    try:
        if not os.path.exists(model_path):
            print(f"Model file does not exist at the specified path: {model_path}")
            return None

        print(f"Loading model from {os.path.abspath(model_path)}")
        model = tf.keras.models.load_model(
            model_path,
            custom_objects={'focal_loss_fixed': focal_loss_fixed},
            compile=False  # Set to True if you need to compile the model for further training
        )
        print("Model loaded successfully.")
        model.summary()  # Display the model architecture
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

def preprocess_image(image_path):
    """
    Loads and preprocesses the image for prediction.

    Parameters:
    - image_path: Path to the image file.

    Returns:
    - Preprocessed image array ready for prediction.
    """
    try:
        if not os.path.exists(image_path):
            print(f"Image file does not exist at the specified path: {image_path}")
            return None

        image = Image.open(image_path).convert('RGB')
        image = image.resize((300, 300))
        image_array = np.array(image)
        image_array = np.expand_dims(image_array, axis=0)  # Add batch dimension
        image_array = preprocess_input(image_array)  # Apply EfficientNet preprocessing

        print(f"Preprocessed image shape: {image_array.shape}")
        print(f"Preprocessed image stats - min: {image_array.min()}, max: {image_array.max()}, mean: {image_array.mean():.4f}")
        return image_array
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def predict_image(model, image_array):
    """
    Makes a prediction on the preprocessed image.

    Parameters:
    - model: Loaded Keras model.
    - image_array: Preprocessed image array.

    Returns:
    - Dictionary mapping each class label to its predicted probability.
    """
    try:
        predictions = model.predict(image_array)
        print(f"Raw Predictions: {predictions}")

        # Check if the model's last layer uses softmax
        last_layer = model.layers[-1]
        if not hasattr(last_layer, 'activation') or last_layer.activation.__name__ != 'softmax':
            print("Applying softmax to the model's output...")
            predictions = tf.nn.softmax(predictions, axis=-1).numpy()
            print(f"Softmax Applied Predictions: {predictions}")
        else:
            predictions = predictions  # Already softmaxed
            print("Model output already uses softmax activation.")

        # Convert predictions to a 1D list
        predictions_list = predictions[0].tolist()

        # Map predictions to class labels
        predictions_dict = {label: prob for label, prob in zip(CLASS_LABELS, predictions_list)}
        print(f"Predictions as dictionary: {predictions_dict}")

        # Identify the class with the highest probability
        predicted_class = CLASS_LABELS[np.argmax(predictions_list)]
        predicted_probability = np.max(predictions_list)
        print(f"Predicted Class: {predicted_class} with probability {predicted_probability:.4f}")

        return predictions_dict, predicted_class, predicted_probability

    except Exception as e:
        print(f"Error during prediction: {e}")
        return None, None, None

def main():
    # Path to your trained model
    model_path = 'model/best_model_EfficientNetB3.keras'  # Update this path as needed

    # Path to the test image
    image_path = 'model/BCN_0000000822.jpg'  # Replace with the actual image path

    # Load the model
    model = load_model(model_path)
    if model is None:
        print("Failed to load the model. Exiting.")
        return

    # Preprocess the image
    image_array = preprocess_image(image_path)
    if image_array is None:
        print("Failed to preprocess the image. Exiting.")
        return

    # Make a prediction
    predictions_dict, predicted_class, predicted_probability = predict_image(model, image_array)
    if predictions_dict is not None:
        print("\n=== Prediction Results ===")
        for disease, prob in predictions_dict.items():
            print(f"{disease}: {prob:.4f}")
        print(f"\nFinal Prediction: {predicted_class} ({predicted_probability:.2%})")

if __name__ == "__main__":
    main()
