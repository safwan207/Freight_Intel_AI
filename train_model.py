import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for generating plots in scripts
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
import joblib

# Set visual style for plots
sns.set_theme(style="darkgrid")
plt.rcParams.update({
    'figure.facecolor': '#111827', # Dark background (Tailwind Gray 900)
    'axes.facecolor': '#1f2937',   # Gray 800
    'text.color': '#f9fafb',       # Gray 50
    'axes.labelcolor': '#d1d5db',  # Gray 300
    'xtick.color': '#9ca3af',      # Gray 400
    'ytick.color': '#9ca3af',
    'grid.color': '#374151',       # Gray 700
})

def generate_synthetic_data(filepath, num_records=1200):
    """Generates a realistic freight inventory dataset for training."""
    print(f"Generating synthetic freight dataset at {filepath}...")
    np.random.seed(42)
    
    origins = ["Mumbai", "Delhi", "Chennai", "Kolkata", "Bengaluru", "Hyderabad", "Ahmedabad", "Kochi"]
    destinations = ["Delhi", "Mumbai", "Kolkata", "Chennai", "Hyderabad", "Bengaluru", "Kochi", "Ahmedabad"]
    carriers = ["Blue Dart", "Gati", "CONCOR", "TCI", "SCI"]
    shipment_modes = ["Air", "Ocean", "Rail", "Road"]
    weather_conds = ["Sunny", "Rainy", "Stormy", "Foggy"]
    traffic_conds = ["Low", "Moderate", "High"]
    
    data = []
    
    for i in range(num_records):
        shipment_id = f"SH{1000 + i}"
        
        # Select origin and destination ensuring they are not identical
        origin = np.random.choice(origins)
        destination = np.random.choice([d for d in destinations if d != origin])
        
        # Mode of transport influences distance and transit time
        mode = np.random.choice(shipment_modes, p=[0.2, 0.4, 0.15, 0.25])
        
        # Route distances in km (approximations)
        if mode == "Air":
            distance = np.random.randint(3000, 12000)
            planned_days = max(1, int(distance / 1200)) # Air is fast (approx 1200km/day including customs/handling)
        elif mode == "Ocean":
            distance = np.random.randint(4000, 15000)
            planned_days = max(10, int(distance / 500)) # Ocean is slower (approx 500km/day)
        elif mode == "Rail":
            distance = np.random.randint(800, 4000)
            planned_days = max(3, int(distance / 400)) # Rail is moderate
        else: # Road
            distance = np.random.randint(200, 2000)
            planned_days = max(1, int(distance / 350)) # Road is local/regional
            
        carrier = np.random.choice(carriers)
        quantity = np.random.randint(50, 10000)
        weight_kg = quantity * np.random.uniform(0.5, 12.0)
        volume_m3 = weight_kg / np.random.uniform(150.0, 500.0) # Density conversion
        
        # Value of cargo
        val_multiplier = {"Air": 10000, "Ocean": 1200, "Rail": 2500, "Road": 3800}
        value_inr = weight_kg * val_multiplier[mode] * np.random.uniform(0.8, 1.5)
        
        # Environmental conditions
        weather = np.random.choice(weather_conds, p=[0.5, 0.25, 0.15, 0.10])
        traffic = np.random.choice(traffic_conds, p=[0.4, 0.4, 0.2])
        
        # Calculate realistic Delay Days based on feature combinations
        base_delay = 0.0
        
        # Weather factor
        if weather == "Stormy":
            base_delay += np.random.uniform(2.0, 6.0) if mode in ["Air", "Ocean"] else np.random.uniform(1.0, 3.0)
        elif weather == "Rainy":
            base_delay += np.random.uniform(0.5, 1.5)
        elif weather == "Foggy":
            base_delay += np.random.uniform(1.0, 3.5) if mode == "Air" else np.random.uniform(0.5, 2.0)
            
        # Traffic factor (mostly impacts Road/Rail)
        if traffic == "High" and mode in ["Road", "Rail"]:
            base_delay += np.random.uniform(1.0, 3.0)
        elif traffic == "Moderate" and mode in ["Road", "Rail"]:
            base_delay += np.random.uniform(0.2, 1.0)
            
        # Carrier reliability factor
        carrier_delays = {"Blue Dart": -0.3, "Gati": 0.1, "CONCOR": 0.2, "TCI": 0.4, "SCI": 0.6}
        base_delay += carrier_delays[carrier]
        
        # Mode specific anomalies
        if mode == "Ocean" and np.random.rand() < 0.12: # Port congestion
            base_delay += np.random.uniform(3.0, 8.0)
        if mode == "Air" and np.random.rand() < 0.08: # Customs hold
            base_delay += np.random.uniform(1.5, 4.0)
            
        # Add random noise
        delay_days = base_delay + np.random.normal(0, 0.5)
        
        # A shipment cannot arrive earlier than planned minimum handling time
        # but let's allow slight early delivery (negative delay) up to -1 day or so
        delay_days = max(-1.5, round(delay_days, 2))
        
        actual_days = planned_days + delay_days
        actual_days = max(1.0, round(actual_days, 2))
        delay_days = round(actual_days - planned_days, 2)
        
        # Status assignment
        status = "Delayed" if delay_days > 1.0 else "On Time"
        
        data.append([
            shipment_id, origin, destination, distance, mode, carrier,
            quantity, round(weight_kg, 2), round(volume_m3, 3), round(value_inr, 2),
            weather, traffic, planned_days, actual_days, delay_days, status
        ])
        
    cols = [
        "Shipment_ID", "Origin", "Destination", "Distance_km", "Shipment_Mode", "Carrier",
        "Quantity", "Weight_kg", "Volume_m3", "Shipment_Value_INR",
        "Weather_Conditions", "Traffic_Conditions", "Planned_Duration_Days",
        "Actual_Duration_Days", "Delay_Days", "Status"
    ]
    df = pd.DataFrame(data, columns=cols)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
    print(f"Dataset generated. Shape: {df.shape}")
    return df

def generate_analytics_charts(df, output_dir):
    """Generates charts for the Flask Dashboard."""
    print("Generating Seaborn analytics plots...")
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Delay by Shipment Mode
    plt.figure(figsize=(8, 5))
    sns.barplot(data=df, x='Shipment_Mode', y='Delay_Days', errorbar=None, palette='mako')
    plt.title('Average Shipment Delay (Days) by Transport Mode', fontsize=14, pad=15)
    plt.xlabel('Shipment Mode', fontsize=12)
    plt.ylabel('Average Delay (Days)', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'delay_by_mode.png'), dpi=150, facecolor='#111827')
    plt.close()
    
    # 2. Delay Distribution by Carrier
    plt.figure(figsize=(9, 5.5))
    sns.boxplot(data=df, x='Carrier', y='Delay_Days', palette='viridis')
    plt.title('Delay Distribution (Days) by Shipping Carrier', fontsize=14, pad=15)
    plt.xlabel('Carrier', fontsize=12)
    plt.ylabel('Delay (Days)', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'delay_by_carrier.png'), dpi=150, facecolor='#111827')
    plt.close()

    # 3. Weather Conditions vs. Delay Days
    plt.figure(figsize=(8, 5))
    sns.barplot(data=df, x='Weather_Conditions', y='Delay_Days', hue='Traffic_Conditions', palette='rocket')
    plt.title('Weather & Traffic Impact on Freight Delay', fontsize=14, pad=15)
    plt.xlabel('Weather Conditions', fontsize=12)
    plt.ylabel('Average Delay (Days)', fontsize=12)
    plt.legend(title='Traffic Level', loc='upper right')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'weather_traffic_impact.png'), dpi=150, facecolor='#111827')
    plt.close()

    # 4. Shipment Volume / Value Distribution
    plt.figure(figsize=(8, 5))
    sns.scatterplot(data=df, x='Distance_km', y='Delay_Days', hue='Shipment_Mode', palette='bright', alpha=0.6)
    plt.title('Shipment Distance vs Delay (Days)', fontsize=14, pad=15)
    plt.xlabel('Distance (km)', fontsize=12)
    plt.ylabel('Delay (Days)', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'distance_vs_delay.png'), dpi=150, facecolor='#111827')
    plt.close()
    print("All dashboard charts generated successfully.")

def train_model(data_path, model_dir):
    """Loads dataset, trains pipeline and saves ML artifacts."""
    if os.path.exists(data_path):
        print(f"Loading existing dataset from {data_path}...")
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data(data_path)
        
    # Generate static charts for the frontend dashboard
    charts_dir = os.path.join(os.path.dirname(data_path), '..', 'static', 'img', 'charts')
    generate_analytics_charts(df, charts_dir)
    
    # Feature columns and Target
    # We will exclude Shipment_ID, Actual_Duration_Days, Status, and Delay_Days (target) from features.
    X = df.drop(columns=["Shipment_ID", "Actual_Duration_Days", "Delay_Days", "Status"])
    y = df["Delay_Days"]
    
    print("\nSample features structure:")
    print(X.iloc[0].to_dict())
    
    # Identify categorical and numerical columns
    categorical_cols = X.select_dtypes(include=['object']).columns.tolist()
    numeric_cols = X.select_dtypes(exclude=['object']).columns.tolist()
    
    print(f"\nCategorical columns: {categorical_cols}")
    print(f"Numerical columns: {numeric_cols}")
    
    # Create the preprocessing pipeline
    # Numerical: StandardScaler
    # Categorical: OneHotEncoder
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ]
    )
    
    # We build an pipeline containing the preprocessor and the XGBRegressor model
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', XGBRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42
        ))
    ])
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print(f"\nTraining XGBoost Regressor on {len(X_train)} samples...")
    model_pipeline.fit(X_train, y_train)
    
    # Evaluate model performance
    train_score = model_pipeline.score(X_train, y_train)
    test_score = model_pipeline.score(X_test, y_test)
    print(f"Training R^2 Score: {train_score:.4f}")
    print(f"Testing R^2 Score: {test_score:.4f}")
    
    # Mean Absolute Error (MAE) and Root Mean Squared Error (RMSE)
    predictions = model_pipeline.predict(X_test)
    mae = np.mean(np.abs(predictions - y_test))
    rmse = np.sqrt(np.mean((predictions - y_test) ** 2))
    print(f"Test MAE: {mae:.2f} days")
    print(f"Test RMSE: {rmse:.2f} days")
    
    # Generate Feature Importance Chart
    try:
        # Extract feature names from ColumnTransformer
        encoded_cats = model_pipeline.named_steps['preprocessor'].named_transformers_['cat'].get_feature_names_out(categorical_cols)
        feature_names = numeric_cols + list(encoded_cats)
        
        # Get importances from regressor
        importances = model_pipeline.named_steps['regressor'].feature_importances_
        
        # Create a dataframe
        fi_df = pd.DataFrame({'Feature': feature_names, 'Importance': importances})
        fi_df = fi_df.sort_values(by='Importance', ascending=False).head(10)
        
        plt.figure(figsize=(8, 5))
        sns.barplot(data=fi_df, x='Importance', y='Feature', palette='mako')
        plt.title('Top 10 Feature Importances (XGBoost)', fontsize=14, pad=15)
        plt.xlabel('Importance Value', fontsize=12)
        plt.ylabel('Feature', fontsize=12)
        plt.tight_layout()
        plt.savefig(os.path.join(charts_dir, 'feature_importance.png'), dpi=150, facecolor='#111827')
        plt.close()
        print("Feature importance chart generated successfully.")
    except Exception as e:
        print(f"Could not generate feature importance chart: {e}")
    
    # Save the pipeline
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'model_pipeline.pkl')
    joblib.dump(model_pipeline, model_path)
    print(f"\nModel pipeline successfully saved to {model_path}")
    
    # Save training metrics to a text file for dashboard presentation
    metrics_path = os.path.join(model_dir, 'metrics.json')
    import json
    metrics = {
        "train_r2": round(float(train_score), 4),
        "test_r2": round(float(test_score), 4),
        "mae_days": round(float(mae), 2),
        "rmse_days": round(float(rmse), 2),
        "total_records": len(df),
        "on_time_rate": round(float((df['Status'] == 'On Time').mean() * 100), 2)
    }
    with open(metrics_path, 'w') as f:
        json.dump(metrics, f, indent=4)
    print(f"Metrics saved to {metrics_path}")

if __name__ == "__main__":
    DATA_PATH = "data/freight_inventory.csv"
    MODEL_DIR = "models"
    train_model(DATA_PATH, MODEL_DIR)
