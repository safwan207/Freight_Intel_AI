# Freight Intel AI 🌐✈️🚚

Freight Intel AI is a cutting-edge supply chain intelligence application designed to predict freight shipment delays, assess inventory stockout risks, and optimize ordering patterns using machine learning. The project features a stunning, interactive **Shopify Editions-inspired Periwinkle & Lavender** 3D WebGL holographic globe that visually maps route paths and transit hubs in real-time.

**Developed by:** [Ahmed Safwan C](https://github.com/safwan207)  
**GitHub Repository:** [Freight_Intel_AI](https://github.com/safwan207/Freight_Intel_AI)  
**📄 Project Documentation (PDF):** [docs/Freight_Intel_AI_Documentation.pdf](docs/Freight_Intel_AI_Documentation.pdf)

---

## 🎨 Theme & Color System (Shopify Editions Inspired)

The application features a clean, light-mode **Periwinkle & Lavender** design system configured with the exact 5-color palette:

| Hex Code | Color Name | Role & UI Application |
| :--- | :--- | :--- |
| **`#3D52A0`** | Deep Periwinkle | Primary titles, CTA buttons, metrics headers, dark periwinkle text. |
| **`#7091E6`** | Soft Cornflower Blue | Secondary buttons, active route highlights, glowing comets. |
| **`#8697C4`** | Steel Periwinkle | Subtle borders, 3D stars, muted text labels. |
| **`#ADBBDA`** | Ice Lavender | Glass card borders, input borders, diagnostic containers. |
| **`#EDE8F5`** | Soft Lavender Off-White | Page canvas background & 3D background fog. |

---

## 🌟 Key Features

1. **Interactive 3D Supply Chain Globe (Three.js & OrbitControls)**:
   * A digital-hologram style interactive globe built with Three.js.
   * Full drag-to-rotate, pinch/scroll-to-zoom, and pan camera controls (via `OrbitControls`).
   * Undulating ambient wave particles, floating supply chain wireframe cubes, pulsing city hub markers, and animated route comets.

2. **Smart Freight Predictor (XGBoost ML Pipeline)**:
   * Predicts shipment transit duration, delays, and financial delay penalties in Indian Rupees (₹).
   * Classifies delay risks (Low, Moderate, High) using a Gradient Boosted Decision Trees model.
   * Generates dynamic inventory suggestions (safety stock, order buffers) based on predictions.

3. **Live Weather Integration (Open-Meteo API)**:
   * Dynamically fetches current weather conditions at the destination coordinates in real-time.
   * Maps weather parameters directly into the ML inference pipeline.

4. **Multi-Mode Distance Matrix & Transit Hub Routing**:
   * Auto-calculates shipment distances across four modes (Air Cargo, Over the Road, Rail Intermodal, Ocean Freight) between major Indian cities: *Mumbai, Delhi, Chennai, Kolkata, Bengaluru, Hyderabad, Ahmedabad, and Kochi*.
   * Supports custom single-leg or dual-leg routes passing through a transit hub.

5. **Analytics Dashboard & Single-Click Model Retraining**:
   * Visualizes delay metrics by mode, carrier distributions, weather/traffic impact, and XGBoost feature importance.
   * **On-Demand Retraining**: Allows retraining the machine learning model on historical logs with a single click, regenerating charts and updating metrics dynamically.

6. **Recent Simulations Log (Raw Data Table)**:
   * Automatically persists prediction queries to a raw history log (`prediction_history.csv`) and displays recent simulation records in an interactive dashboard table.

7. **PDF Report Generator & Project Documentation**:
   * Instantly converts prediction results into a downloadable PDF report.
   * Includes complete project documentation PDF at `docs/Freight_Intel_AI_Documentation.pdf`.

---

## 🛠️ Tech Stack

* **Backend Core**: Python 3, Flask (Web Server), Joblib
* **Machine Learning**: XGBoost, Scikit-learn, Pandas, NumPy
* **Data Visualization**: Matplotlib, Seaborn
* **Frontend Web Stack**: HTML5, Vanilla CSS3 (Periwinkle Glassmorphism), Bootstrap 5, Three.js (WebGL), OrbitControls, GSAP, ReportLab PDF Generator

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Python 3.10+ installed on your local machine.

### Installation & Run Steps
1. **Clone the repository**:
   ```bash
   git clone https://github.com/safwan207/Freight_Intel_AI.git
   cd Freight_Intel_AI
   ```

2. **Create & activate virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Train the XGBoost Model**:
   ```bash
   python train_model.py
   ```

5. **Launch the Application**:
   ```bash
   python app.py
   ```

6. **Open in Browser**:
   Navigate to `http://127.0.0.1:5000/` in your web browser.

---

*Freight Intel AI © 2026. Designed and built with ❤️ by Ahmed Safwan C.*
