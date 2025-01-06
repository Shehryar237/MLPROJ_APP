// modelService.js
import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:3001'; // Update if deployed elsewhere

export const getPrediction = async (file) => {
  console.log("Sending file to backend for prediction:", file);

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(`${BACKEND_URL}/predict`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log("Backend response:", response.data);

    // Transform the response to match the expected format in DiagMetrics
    const predictionMetrics = Object.entries(response.data.predictions).map(([disease, probability]) => ({
      disease,
      probability
    }));

    return {
      predictionMetrics,
      predictedClass: response.data.predicted_class,
      probability: response.data.probability
    };
  } 
  catch (error) {
    console.error("Error while making API request:", error);
    throw error;
  }
};

export const getDiseaseInfo = async (disease) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/predict/info`, 
      { params: { disease }, });
    return response.data;
  }
  catch (error) {
    console.error("Error fetching disease info:", error);
    throw error;
  }
};
