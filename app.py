import os
import json
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify
import joblib

app = Flask(__name__)

# Paths
MODEL_PATH = "models/model_pipeline.pkl"
METRICS_PATH = "models/metrics.json"

# Global model container
model_pipeline = None
model_metrics = {}

def load_ml_resources():
    """Attempts to load the model pipeline and performance metrics."""
    global model_pipeline, model_metrics
    
    if os.path.exists(MODEL_PATH):
        try:
            model_pipeline = joblib.load(MODEL_PATH)
            print("Successfully loaded machine learning model pipeline.")
        except Exception as e:
            print(f"Error loading model pipeline: {e}")
            model_pipeline = None
    else:
        print(f"Warning: Model file not found at {MODEL_PATH}. Please run train_model.py first.")
        model_pipeline = None

    if os.path.exists(METRICS_PATH):
        try:
            with open(METRICS_PATH, 'r') as f:
                model_metrics = json.load(f)
            print("Successfully loaded model training metrics.")
        except Exception as e:
            print(f"Error loading metrics: {e}")
            model_metrics = {}
    else:
        # Default fallback values
        model_metrics = {
            "train_r2": 0.0,
            "test_r2": 0.0,
            "mae_days": 0.0,
            "rmse_days": 0.0,
            "total_records": 0,
            "on_time_rate": 0.0
        }

# Initial loading of models
load_ml_resources()

@app.route('/')
def index():
    """Renders the main prediction application page."""
    # If model is not loaded, reload in case it was trained after startup
    if model_pipeline is None:
        load_ml_resources()
        
    model_loaded = model_pipeline is not None
    return render_template('index.html', model_loaded=model_loaded, metrics=model_metrics)

@app.route('/dashboard')
def dashboard():
    """Renders the analytics visualization dashboard."""
    if model_pipeline is None:
        load_ml_resources()
        
    return render_template('dashboard.html', metrics=model_metrics)

@app.route('/predict', methods=['POST'])
def predict():
    """Runs predictions on the input freight parameters."""
    global model_pipeline
    
    if model_pipeline is None:
        # Retry loading
        load_ml_resources()
        if model_pipeline is None:
            return jsonify({
                "success": False,
                "error": "ML Model is not loaded on the server. Please run training first."
            }), 503
            
    try:
        # Parse inputs from AJAX request
        data = request.json
        
        # Build pandas DataFrame for pipeline ingestion
        input_data = {
            'Origin': [data.get('Origin', 'Mumbai')],
            'Destination': [data.get('Destination', 'Delhi')],
            'Distance_km': [float(data.get('Distance_km', 1000))],
            'Shipment_Mode': [data.get('Shipment_Mode', 'Road')],
            'Carrier': [data.get('Carrier', 'Blue Dart')],
            'Quantity': [int(data.get('Quantity', 100))],
            'Weight_kg': [float(data.get('Weight_kg', 1000))],
            'Volume_m3': [float(data.get('Volume_m3', 5.0))],
            'Shipment_Value_INR': [float(data.get('Shipment_Value_INR', 500000))],
            'Weather_Conditions': [data.get('Weather_Conditions', 'Sunny')],
            'Traffic_Conditions': [data.get('Traffic_Conditions', 'Low')],
            'Planned_Duration_Days': [int(data.get('Planned_Duration_Days', 5))]
        }
        
        df_input = pd.DataFrame(input_data)
        
        # Run prediction
        # The model predicts standard 'Delay_Days'
        predicted_delay = float(model_pipeline.predict(df_input)[0])
        
        # Calculate predicted actual duration
        planned_days = int(data.get('Planned_Duration_Days', 5))
        predicted_actual_duration = max(1.0, planned_days + predicted_delay)
        
        # Adjust delay in case of ceiling
        final_predicted_delay = predicted_actual_duration - planned_days
        
        # Risk assessment mapping
        if final_predicted_delay <= 0.5:
            risk_level = "Low Risk"
            risk_indicator = "success"
            bg_color = "rgba(40, 167, 69, 0.2)"
            border_color = "#28a745"
            reorder_suggestion = "Optimal schedule. Standard reorder triggers apply. No safety stock buffer required."
        elif final_predicted_delay <= 2.0:
            risk_level = "Medium Risk"
            risk_indicator = "warning"
            bg_color = "rgba(255, 193, 7, 0.2)"
            border_color = "#ffc107"
            reorder_suggestion = f"Moderate delay expected. We recommend maintaining an extra {max(1, round(final_predicted_delay))} days of average demand as safety buffer."
        else:
            risk_level = "High Risk"
            risk_indicator = "danger"
            bg_color = "rgba(220, 53, 69, 0.2)"
            border_color = "#dc3545"
            reorder_suggestion = f"Significant delay risk detected. Increase inventory target level by {max(3, round(final_predicted_delay))} days immediately, or consider switching transport modes."

        # Financial Impact Calculator (0.2% penalty per delayed day)
        financial_impact = 0.0
        if final_predicted_delay > 0:
            shipment_value = float(data.get('Shipment_Value_INR', 0))
            financial_impact = round(final_predicted_delay * 0.002 * shipment_value, 2)
            
        # Append to raw CSV data file
        import csv
        import os
        from datetime import datetime

        csv_file = 'data/prediction_history.csv'
        file_exists = os.path.isfile(csv_file)
        
        with open(csv_file, mode='a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            if not file_exists:
                writer.writerow(['Timestamp', 'Origin', 'Destination', 'Mode', 'Distance_km', 'Carrier', 'Shipment_Value_INR', 'Predicted_Delay_Days', 'Financial_Impact_INR', 'Risk_Level'])
            writer.writerow([
                datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                data.get('Origin', ''), data.get('Destination', ''), data.get('Shipment_Mode', ''),
                data.get('Distance_km', 0), data.get('Carrier', ''), data.get('Shipment_Value_INR', 0),
                round(final_predicted_delay, 2), financial_impact, risk_level
            ])

        return jsonify({
            "success": True,
            "predicted_delay_days": round(final_predicted_delay, 2),
            "predicted_actual_duration": round(predicted_actual_duration, 2),
            "risk_level": risk_level,
            "risk_indicator": risk_indicator,
            "bg_color": bg_color,
            "border_color": border_color,
            "reorder_suggestion": reorder_suggestion,
            "financial_impact_inr": financial_impact
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to perform prediction: {str(e)}"
        }), 400

@app.route('/api/retrain', methods=['POST'])
def retrain():
    """Runs the training pipeline to regenerate charts and update the model weights."""
    try:
        from train_model import train_model
        # Execute model retraining
        train_model("data/freight_inventory.csv", "models")
        # Reload the saved pipeline and metrics in memory
        load_ml_resources()
        return jsonify({
            "success": True,
            "metrics": model_metrics
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrain model: {str(e)}"
        }), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Returns the raw prediction history from the CSV file."""
    import csv
    import os
    history = []
    csv_file = 'data/prediction_history.csv'
    if os.path.exists(csv_file):
        with open(csv_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            history = list(reader)
    # Return last 15 elements reversed (most recent first)
    return jsonify({"success": True, "history": list(reversed(history))[:15]})

if __name__ == '__main__':
    # Running Flask app on port 5000 in debug/dev mode
    app.run(host='0.0.0.0', port=5000, debug=True)
