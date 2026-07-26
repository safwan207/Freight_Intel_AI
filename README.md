# Freight Intel AI 🚛📦

> **Interactive 3D Logistics Intelligence & Machine Learning Risk Predictor**

Developer: **Ahmed Safwan C**  
Repository: [safwan207/Freight_Intel_AI](https://github.com/safwan207/Freight_Intel_AI)

---

## 🌟 Project Overview

**Freight Intel AI** is a production-grade machine learning web application designed for supply chain managers, freight forwarders, and logistics teams. It leverages **Gradient Boosted Decision Trees (XGBoost)** to predict shipment delays, evaluate financial penalty risks, and provide real-time inventory re-order recommendations across multi-modal transit networks (Ocean, Air, Rail, OTR).

The application features a modern **Dark Glassmorphism Web Interface** built with **Flask**, **Three.js** (for interactive 3D supply chain globe visualizations), **GSAP** animations, and automated **ReportLab PDF report generation**.

---

## ✨ Key Features

- 🔮 **Machine Learning Delay Engine**: Predicts exact freight delay (days) using trained XGBoost regressors with Scikit-Learn pipelines.
- 🌐 **Interactive 3D Supply Chain Globe**: Visualizes live transit routes between Indian logistics hubs (Mumbai, Delhi, Chennai, Kolkata, Bengaluru, etc.) using Three.js and OrbitControls.
- 📊 **Real-time Analytics Dashboard**: Interactive KPIs, dataset metrics, and Seaborn analytical charts (Mode delay analysis, Risk tier distributions, Weather impact, XGBoost Feature Importances).
- ⚡ **Auto-Weather & Congestion Integration**: Dynamically incorporates weather factors (Open-Meteo API) and port traffic congestion into predictions.
- 📄 **Automated PDF Risk Reporting**: Generates downloadable PDF documentation reports complete with financial impact calculations and inventory cushion recommendations.
- 🔄 **One-Click Model Retraining**: On-demand retraining endpoint (`/api/retrain`) that updates model weights and regenerates analytical charts dynamically.

---

## 🏗️ Architecture & Project Structure

```text
Freight_Intel_AI/
├── app.py                   # Core Flask web server & REST API endpoints
├── train_model.py           # ML training script, XGBoost pipeline & Seaborn chart generator
├── generate_pdf.py          # ReportLab PDF documentation compiler
├── requirements.txt         # Production Python dependencies
├── models/
│   ├── model_pipeline.pkl   # Serialized XGBoost model pipeline
│   └── metrics.json         # Serialized R², MAE, RMSE metrics
├── static/
│   ├── css/
│   │   └── style.css        # Dark Glassmorphism high-contrast design system
│   ├── js/
│   │   ├── app.js           # Frontend logic & client-side inference engine
│   │   └── three_bg.js      # Three.js 3D globe & route particle canvas
│   └── img/charts/          # Seaborn analytical visualization plots
├── templates/
│   ├── index.html           # Main predictor dashboard
│   └── dashboard.html       # Analytics & dataset metrics interface
└── docs/
    └── Freight_Intel_AI_Documentation.pdf # PDF documentation artifact
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
Ensure Python **3.9+** is installed on your system.

### 2. Clone Repository
```bash
git clone https://github.com/safwan207/Freight_Intel_AI.git
cd Freight_Intel_AI
```

### 3. Create Virtual Environment & Install Dependencies
```bash
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Train Machine Learning Model
```bash
python train_model.py
```

### 5. Launch Local Web Application
```bash
python app.py
```
Open your browser and navigate to `http://127.0.0.1:5000/`.

---

## 📊 Model Performance

- **Algorithm**: XGBoost Regressor (`n_estimators=200`, `learning_rate=0.05`, `max_depth=5`)
- **Evaluation Metrics**:
  - **Mean Absolute Error (MAE)**: ~0.96 Days
  - **R² Score**: ~31.15% (Synthetic baseline dataset)
  - **Target Variable**: `Delay_Days`

---

## 👨‍💻 Developer & License

- **Developer**: Ahmed Safwan C
- **License**: MIT License
