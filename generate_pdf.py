import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Define Palette Colors
    PRIMARY = colors.HexColor("#3D52A0")      # Deep Periwinkle
    SECONDARY = colors.HexColor("#7091E6")    # Soft Cornflower Blue
    MUTED = colors.HexColor("#8697C4")        # Steel Periwinkle
    ICE = colors.HexColor("#ADBBDA")          # Ice Lavender
    TEXT_DARK = colors.HexColor("#1B254B")    # Dark Navy Periwinkle

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    story = []

    # Document Header Banner
    story.append(Paragraph("Freight Intel AI Project Documentation", title_style))
    story.append(Paragraph("Simple User Guide & Architecture Documentation", subtitle_style))
    story.append(Paragraph("<b>Author:</b> Ahmed Safwan C &nbsp;&nbsp;|&nbsp;&nbsp; <b>Repository:</b> github.com/safwan207/Freight_Intel_AI", ParagraphStyle('Meta', parent=body_style, textColor=MUTED, fontSize=9)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=8, spaceAfter=15))

    # Section 1: Project Overview
    story.append(Paragraph("1. Project Overview (In Simple Words)", h1_style))
    story.append(Paragraph(
        "<b>Freight Intel AI</b> is an intelligent logistics application built to help businesses estimate shipment transit times, predict delivery delays, and prevent inventory stockouts before they happen.",
        body_style
    ))
    story.append(Paragraph(
        "Instead of relying on rough manual guesses, Freight Intel AI uses machine learning (XGBoost) trained on historical freight records to calculate exact delay risks, estimated financial penalty costs in Indian Rupees (₹), and actionable stock cushion recommendations.",
        body_style
    ))
    story.append(Spacer(1, 6))

    # Section 2: Core Features
    story.append(Paragraph("2. Key Features & Capabilities", h1_style))
    
    features = [
        ("Smart Machine Learning Delay Predictor", "Calculates exact delay margins (in days), overall transit duration, penalty costs, and classifies risk into <b>Low, Moderate, or High Risk</b> tiers."),
        ("Interactive 3D Supply Chain Globe", "Built with Three.js. Spin, zoom, and inspect real-time animated comet trails mapping shipping routes across Indian logistics hubs (Mumbai, Delhi, Chennai, Kolkata, Bengaluru, Hyderabad, Ahmedabad, Kochi)."),
        ("Live Destination Weather Integration", "Fetches live weather conditions automatically from Open-Meteo API for real-time weather risk evaluation."),
        ("Analytics Dashboard & Retraining", "Visualizes carrier distributions, transport mode metrics, and feature importance. Allows single-click model retraining on updated logs."),
        ("Export PDF Risk Reports", "Instantly generates downloadable risk summary reports for freight managers.")
    ]

    for title, desc in features:
        story.append(Paragraph(f"<b>• {title}:</b> {desc}", bullet_style))

    story.append(Spacer(1, 10))

    # Section 3: Design & Color Theme
    story.append(Paragraph("3. Design & Theme System (Shopify Editions Style)", h1_style))
    story.append(Paragraph(
        "The web application features an elegant <b>Periwinkle & Lavender Light Theme</b> designed for modern aesthetics and high text readability:",
        body_style
    ))

    # Color Table
    color_data = [
        [Paragraph("<b>Hex Code</b>", body_style), Paragraph("<b>Color Name</b>", body_style), Paragraph("<b>UI Application</b>", body_style)],
        [Paragraph("<b>#3D52A0</b>", body_style), Paragraph("Deep Periwinkle", body_style), Paragraph("Primary titles, CTA buttons, metrics headers, dark periwinkle text.", body_style)],
        [Paragraph("<b>#7091E6</b>", body_style), Paragraph("Soft Cornflower Blue", body_style), Paragraph("Secondary buttons, active route highlights, glowing comets.", body_style)],
        [Paragraph("<b>#8697C4</b>", body_style), Paragraph("Steel Periwinkle", body_style), Paragraph("Subtle borders, 3D stars, muted text labels.", body_style)],
        [Paragraph("<b>#ADBBDA</b>", body_style), Paragraph("Ice Lavender", body_style), Paragraph("Glass card borders, input borders, diagnostic containers.", body_style)],
        [Paragraph("<b>#EDE8F5</b>", body_style), Paragraph("Soft Lavender Off-White", body_style), Paragraph("Page canvas background & 3D background fog.", body_style)]
    ]

    col_table = Table(color_data, colWidths=[1.1*inch, 1.6*inch, 4.3*inch])
    col_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ICE),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, ICE),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#FAFAFF")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(col_table)
    story.append(Spacer(1, 10))

    # Section 4: How to Run the App
    story.append(Paragraph("4. Quick Start Guide (How to Run)", h1_style))
    story.append(Paragraph("Follow these steps to run Freight Intel AI locally:", body_style))
    
    steps = [
        "1. Open your terminal in the project directory: <code>d:\\Projects\\Freight Inventory Analysis</code>",
        "2. Activate the virtual environment: <code>.\\venv\\Scripts\\Activate.ps1</code>",
        "3. Train or update machine learning model weights: <code>python train_model.py</code>",
        "4. Launch the application server: <code>python app.py</code> (or <code>.\\venv\\Scripts\\python.exe app.py</code>)",
        "5. Open your web browser at: <b>http://127.0.0.1:5000</b>"
    ]
    for s in steps:
        story.append(Paragraph(s, bullet_style))

    story.append(Spacer(1, 10))

    # Section 5: Technical Stack Summary
    story.append(Paragraph("5. Technical Stack Summary", h1_style))
    
    stack_data = [
        [Paragraph("<b>Layer</b>", body_style), Paragraph("<b>Technologies Used</b>", body_style)],
        [Paragraph("Backend Core", body_style), Paragraph("Python 3.10+, Flask Web Server, Joblib Serialization", body_style)],
        [Paragraph("Machine Learning", body_style), Paragraph("XGBoost Regressor, Scikit-learn, Pandas, NumPy", body_style)],
        [Paragraph("Frontend UI & 3D", body_style), Paragraph("HTML5, Vanilla CSS3 (Glassmorphism), Three.js (WebGL), OrbitControls, Bootstrap 5", body_style)],
        [Paragraph("Data & Persist", body_style), Paragraph("CSV Raw Log Persister (prediction_history.csv), Open-Meteo Weather API", body_style)]
    ]

    stack_table = Table(stack_data, colWidths=[1.8*inch, 5.2*inch])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, ICE),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#F5F3FA")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(stack_table)

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=0.8, color=MUTED, spaceBefore=8, spaceAfter=6))
    story.append(Paragraph("Freight Intel AI Documentation &copy; 2026. All rights reserved.", ParagraphStyle('Foot', parent=body_style, textColor=MUTED, fontSize=8, alignment=1)))

    doc.build(story)
    print(f"Documentation PDF created successfully at {filename}")

if __name__ == '__main__':
    target_path = os.path.join("docs", "Freight_Intel_AI_Documentation.pdf")
    os.makedirs("docs", exist_ok=True)
    build_pdf(target_path)
