// Freight Inventory Prediction - Client Side Controller (GSAP + Ajax)

const DISTANCE_MATRIX = {
    "Mumbai": {
        "Mumbai": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Delhi": { "Air": 1153, "Road": 1442, "Rail": 1326, "Ocean": 2306 },
        "Chennai": { "Air": 1033, "Road": 1291, "Rail": 1188, "Ocean": 2066 },
        "Kolkata": { "Air": 1655, "Road": 2069, "Rail": 1903, "Ocean": 3310 },
        "Bengaluru": { "Air": 845, "Road": 1057, "Rail": 972, "Ocean": 1691 },
        "Hyderabad": { "Air": 621, "Road": 777, "Rail": 715, "Ocean": 1243 },
        "Ahmedabad": { "Air": 440, "Road": 550, "Rail": 506, "Ocean": 880 },
        "Kochi": { "Air": 1080, "Road": 1350, "Rail": 1242, "Ocean": 2160 }
    },
    "Delhi": {
        "Mumbai": { "Air": 1153, "Road": 1442, "Rail": 1326, "Ocean": 2306 },
        "Delhi": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Chennai": { "Air": 1768, "Road": 2210, "Rail": 2033, "Ocean": 3535 },
        "Kolkata": { "Air": 1318, "Road": 1647, "Rail": 1515, "Ocean": 2636 },
        "Bengaluru": { "Air": 1750, "Road": 2188, "Rail": 2013, "Ocean": 3500 },
        "Hyderabad": { "Air": 1267, "Road": 1583, "Rail": 1457, "Ocean": 2533 },
        "Ahmedabad": { "Air": 777, "Road": 972, "Rail": 894, "Ocean": 1555 },
        "Kochi": { "Air": 2089, "Road": 2612, "Rail": 2403, "Ocean": 4179 }
    },
    "Chennai": {
        "Mumbai": { "Air": 1033, "Road": 1291, "Rail": 1188, "Ocean": 2066 },
        "Delhi": { "Air": 1768, "Road": 2210, "Rail": 2033, "Ocean": 3535 },
        "Chennai": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Kolkata": { "Air": 1358, "Road": 1698, "Rail": 1562, "Ocean": 2717 },
        "Bengaluru": { "Air": 290, "Road": 363, "Rail": 334, "Ocean": 580 },
        "Hyderabad": { "Air": 515, "Road": 644, "Rail": 593, "Ocean": 1030 },
        "Ahmedabad": { "Air": 1372, "Road": 1715, "Rail": 1578, "Ocean": 2744 },
        "Kochi": { "Air": 559, "Road": 699, "Rail": 643, "Ocean": 1119 }
    },
    "Kolkata": {
        "Mumbai": { "Air": 1655, "Road": 2069, "Rail": 1903, "Ocean": 3310 },
        "Delhi": { "Air": 1318, "Road": 1647, "Rail": 1515, "Ocean": 2636 },
        "Chennai": { "Air": 1358, "Road": 1698, "Rail": 1562, "Ocean": 2717 },
        "Kolkata": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Bengaluru": { "Air": 1561, "Road": 1951, "Rail": 1795, "Ocean": 3121 },
        "Hyderabad": { "Air": 1182, "Road": 1477, "Rail": 1359, "Ocean": 2364 },
        "Ahmedabad": { "Air": 1619, "Road": 2024, "Rail": 1862, "Ocean": 3238 },
        "Kochi": { "Air": 1906, "Road": 2383, "Rail": 2192, "Ocean": 3813 }
    },
    "Bengaluru": {
        "Mumbai": { "Air": 845, "Road": 1057, "Rail": 972, "Ocean": 1691 },
        "Delhi": { "Air": 1750, "Road": 2188, "Rail": 2013, "Ocean": 3500 },
        "Chennai": { "Air": 290, "Road": 363, "Rail": 334, "Ocean": 580 },
        "Kolkata": { "Air": 1561, "Road": 1951, "Rail": 1795, "Ocean": 3121 },
        "Bengaluru": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Hyderabad": { "Air": 500, "Road": 625, "Rail": 575, "Ocean": 1000 },
        "Ahmedabad": { "Air": 1237, "Road": 1546, "Rail": 1423, "Ocean": 2474 },
        "Kochi": { "Air": 368, "Road": 460, "Rail": 423, "Ocean": 735 }
    },
    "Hyderabad": {
        "Mumbai": { "Air": 621, "Road": 777, "Rail": 715, "Ocean": 1243 },
        "Delhi": { "Air": 1267, "Road": 1583, "Rail": 1457, "Ocean": 2533 },
        "Chennai": { "Air": 515, "Road": 644, "Rail": 593, "Ocean": 1030 },
        "Kolkata": { "Air": 1182, "Road": 1477, "Rail": 1359, "Ocean": 2364 },
        "Bengaluru": { "Air": 500, "Road": 625, "Rail": 575, "Ocean": 1000 },
        "Hyderabad": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Ahmedabad": { "Air": 879, "Road": 1099, "Rail": 1011, "Ocean": 1759 },
        "Kochi": { "Air": 863, "Road": 1078, "Rail": 992, "Ocean": 1726 }
    },
    "Ahmedabad": {
        "Mumbai": { "Air": 440, "Road": 550, "Rail": 506, "Ocean": 880 },
        "Delhi": { "Air": 777, "Road": 972, "Rail": 894, "Ocean": 1555 },
        "Chennai": { "Air": 1372, "Road": 1715, "Rail": 1578, "Ocean": 2744 },
        "Kolkata": { "Air": 1619, "Road": 2024, "Rail": 1862, "Ocean": 3238 },
        "Bengaluru": { "Air": 1237, "Road": 1546, "Rail": 1423, "Ocean": 2474 },
        "Hyderabad": { "Air": 879, "Road": 1099, "Rail": 1011, "Ocean": 1759 },
        "Ahmedabad": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 },
        "Kochi": { "Air": 1508, "Road": 1885, "Rail": 1734, "Ocean": 3016 }
    },
    "Kochi": {
        "Mumbai": { "Air": 1080, "Road": 1350, "Rail": 1242, "Ocean": 2160 },
        "Delhi": { "Air": 2089, "Road": 2612, "Rail": 2403, "Ocean": 4179 },
        "Chennai": { "Air": 559, "Road": 699, "Rail": 643, "Ocean": 1119 },
        "Kolkata": { "Air": 1906, "Road": 2383, "Rail": 2192, "Ocean": 3813 },
        "Bengaluru": { "Air": 368, "Road": 460, "Rail": 423, "Ocean": 735 },
        "Hyderabad": { "Air": 863, "Road": 1078, "Rail": 992, "Ocean": 1726 },
        "Ahmedabad": { "Air": 1508, "Road": 1885, "Rail": 1734, "Ocean": 3016 },
        "Kochi": { "Air": 0, "Road": 0, "Rail": 0, "Ocean": 0 }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Animations using GSAP
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
        
        tl.fromTo('.navbar', { y: -50, opacity: 0 }, { y: 0, opacity: 1 })
          .fromTo('.anim-fade-up', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15 }, '-=0.4')
          .fromTo('.anim-fade-in', { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.6');
    }

    // 2. Handle Prediction Form Submission
    const predictionForm = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = document.getElementById('loading-spinner');
    const resultBox = document.getElementById('result-box');

    // Distance Auto-Fill & Hub Logic
    const originSelect = document.getElementById('origin');
    const destinationSelect = document.getElementById('destination');
    const hubSelect = document.getElementById('hub');
    const modeSelect = document.getElementById('mode');
    const distanceInput = document.getElementById('distance');
    const weatherInput = document.getElementById('weather');

    function updateDistance() {
        const origin = originSelect.value;
        const dest = destinationSelect.value;
        const hub = hubSelect ? hubSelect.value : "";
        const mode = modeSelect.value; 
        
        let modeKey = mode;
        if (mode === "Ocean") modeKey = "Ocean";
        else if (mode === "Air") modeKey = "Air";
        else if (mode === "Rail") modeKey = "Rail";
        else if (mode === "Road") modeKey = "Road";

        if (origin && dest && modeKey) {
            let calculatedDistance = 0;
            // If valid transit hub selected, calculate two legs
            if (hub && hub !== origin && hub !== dest) {
                calculatedDistance = DISTANCE_MATRIX[origin][hub][modeKey] + DISTANCE_MATRIX[hub][dest][modeKey];
            } else {
                calculatedDistance = DISTANCE_MATRIX[origin][dest][modeKey];
            }
            
            if (distanceInput.value !== String(calculatedDistance)) {
                distanceInput.value = calculatedDistance;
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(distanceInput, 
                        { backgroundColor: 'rgba(6, 182, 212, 0.4)' },
                        { backgroundColor: 'rgba(255, 255, 255, 0.05)', duration: 1 }
                    );
                }
            }
        }
    }

    if (originSelect && destinationSelect && modeSelect && distanceInput) {
        originSelect.addEventListener('change', updateDistance);
        destinationSelect.addEventListener('change', updateDistance);
        if (hubSelect) hubSelect.addEventListener('change', updateDistance);
        modeSelect.addEventListener('change', updateDistance);
        
        updateDistance();
    }

    // Live Weather API Logic (Open-Meteo)
    const CITY_COORDS = {
        "Mumbai": {lat: 19.0760, lng: 72.8777},
        "Delhi": {lat: 28.7041, lng: 77.1025},
        "Chennai": {lat: 13.0827, lng: 80.2707},
        "Kolkata": {lat: 22.5726, lng: 88.3639},
        "Bengaluru": {lat: 12.9716, lng: 77.5946},
        "Hyderabad": {lat: 17.3850, lng: 78.4867},
        "Ahmedabad": {lat: 23.0225, lng: 72.5714},
        "Kochi": {lat: 9.9312, lng: 76.2673}
    };

    async function fetchWeather(city) {
        if (!CITY_COORDS[city] || !weatherInput) return;
        const coords = CITY_COORDS[city];
        try {
            weatherInput.value = "Fetching...";
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true`);
            const data = await res.json();
            const code = data.current_weather.weathercode;
            
            // Map standard WMO weather codes
            let weatherCondition = "Sunny";
            if (code >= 51 && code <= 67) weatherCondition = "Rainy";
            else if (code >= 71 && code <= 99) weatherCondition = "Stormy";
            else if (code === 45 || code === 48) weatherCondition = "Foggy";
            
            weatherInput.value = weatherCondition;
        } catch (e) {
            weatherInput.value = "Sunny"; // Fallback on error
        }
    }

    if (destinationSelect && weatherInput) {
        destinationSelect.addEventListener('change', () => fetchWeather(destinationSelect.value));
        fetchWeather(destinationSelect.value); // Initial fetch
    }

    if (predictionForm) {
        predictionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Disable button & show spinner
            submitBtn.disabled = true;
            spinner.style.display = 'flex';
            
            // Trigger 3D Globe Live Route update
            if (typeof window.drawLiveRoute === 'function') {
                window.drawLiveRoute(
                    document.getElementById('origin').value,
                    document.getElementById('hub') ? document.getElementById('hub').value : "",
                    document.getElementById('destination').value
                );
            }
            
            // GSAP fade out previous results if visible
            if (resultBox.style.display === 'block') {
                gsap.to(resultBox, { opacity: 0, scale: 0.95, duration: 0.3, onComplete: () => {
                    resultBox.style.display = 'none';
                }});
            }

            // Gather inputs
            const payload = {
                Origin: document.getElementById('origin').value,
                Destination: document.getElementById('destination').value,
                Distance_km: parseFloat(document.getElementById('distance').value),
                Shipment_Mode: document.getElementById('mode').value,
                Carrier: document.getElementById('carrier').value,
                Quantity: parseInt(document.getElementById('quantity').value),
                Weight_kg: parseFloat(document.getElementById('weight').value),
                Volume_m3: parseFloat(document.getElementById('volume').value),
                Shipment_Value_INR: parseFloat(document.getElementById('value').value),
                Weather_Conditions: document.getElementById('weather').value,
                Traffic_Conditions: document.getElementById('traffic').value,
                Planned_Duration_Days: parseInt(document.getElementById('planned_days').value)
            };

            try {
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.success) {
                    // Update prediction display values
                    document.getElementById('res-delay').innerText = 
                        (result.predicted_delay_days > 0 ? '+' : '') + result.predicted_delay_days + ' days';
                    document.getElementById('res-total-days').innerText = result.predicted_actual_duration + ' days';
                    
                    const badge = document.getElementById('res-risk-badge');
                    badge.innerText = result.risk_level;
                    badge.className = 'status-badge'; // Reset classes
                    
                    // Risk coloring adjustments
                    if (result.risk_indicator === 'success') {
                        badge.classList.add('badge-success');
                    } else if (result.risk_indicator === 'warning') {
                        badge.classList.add('badge-warning');
                    } else {
                        badge.classList.add('badge-danger');
                    }
                    
                    document.getElementById('res-reorder-suggestion').innerText = result.reorder_suggestion;
                    
                    // Dynamic box styling (glowing border of risk level)
                    resultBox.style.border = `1px solid ${result.border_color}`;
                    resultBox.style.boxShadow = `0 10px 30px ${result.bg_color}`;
                    
                    // Hide spinner, show result box
                    spinner.style.display = 'none';
                    resultBox.style.display = 'block';
                    
                    // GSAP Animate Result Entrance
                    gsap.fromTo(resultBox, 
                        { opacity: 0, scale: 0.95, y: 20 }, 
                        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)' }
                    );

                    // Animate number count-up effect
                    animateCountUp('res-delay-num', result.predicted_delay_days);
                    
                    // Display financial impact
                    if (document.getElementById('res-penalty')) {
                        document.getElementById('res-penalty').innerText = '₹' + result.financial_impact_inr.toLocaleString('en-IN');
                    }

                } else {
                    alert('Error: ' + result.error);
                    spinner.style.display = 'none';
                }
            } catch (err) {
                console.error(err);
                alert('Network error connecting to Flask prediction service.');
                spinner.style.display = 'none';
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // PDF Generation Logic
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            const element = document.getElementById('result-box');
            // Ensure background is visible in PDF (Glassmorphism might render as pure black otherwise)
            const opt = {
                margin:       10,
                filename:     `Freight_Risk_Report_${Date.now()}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#111827' },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }
});

// Helper for dynamic number animations
function animateCountUp(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    const obj = { val: 0 };
    const prefix = targetValue > 0 ? '+' : '';
    
    gsap.to(obj, {
        val: targetValue,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
            el.innerText = prefix + obj.val.toFixed(2);
        }
    });
}
