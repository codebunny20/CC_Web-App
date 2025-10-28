// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function goToHome() { showPage('homePage'); }
function goToConverter() { 
    showPage('converterPage');
    updateUnits();
}
function goToCalculator() { showPage('calculatorPage'); }
function goToMiscConverter() { 
    showPage('miscPage');
    updateMiscUnits();
}
function goToGraphing() { showPage('graphingPage'); }
function goToSettings() { showPage('settingsPage'); }
function goToAbout() { showPage('aboutPage'); }

// Unit Converter
const unitSets = {
    'Length': ['meter (m)', 'kilometer (km)', 'centimeter (cm)', 'millimeter (mm)', 'inch (in)', 'foot (ft)', 'yard (yd)', 'mile (mi)'],
    'Mass': ['kilogram (kg)', 'gram (g)', 'milligram (mg)', 'metric ton (t)', 'ounce (oz)', 'pound (lb)', 'stone'],
    'Time': ['second (s)', 'minute (min)', 'hour (h)', 'day', 'week', 'year'],
    'Temperature': ['kelvin (K)', 'Celsius (°C)', 'Fahrenheit (°F)'],
    'Area': ['square meter (m²)', 'hectare (ha)', 'acre', 'square kilometer (km²)', 'square foot (ft²)', 'square inch (in²)'],
    'Volume': ['cubic meter (m³)', 'liter (L)', 'milliliter (mL)', 'gallon (US)', 'gallon (UK)', 'pint (US)', 'quart (US)', 'cubic foot (ft³)', 'cubic inch (in³)'],
    'Speed': ['meter per second (m/s)', 'kilometer per hour (km/h)', 'mile per hour (mph)', 'foot per second (ft/s)', 'knot (kn)']
};

function updateUnits() {
    const category = document.getElementById('category').value;
    const units = unitSets[category] || [];
    const select = document.getElementById('fromUnit');
    select.innerHTML = units.map(u => `<option>${u}</option>`).join('');
}

function convertUnits() {
    const category = document.getElementById('category').value;
    const fromUnit = document.getElementById('fromUnit').value;
    const value = parseFloat(document.getElementById('inputValue').value);

    if (isNaN(value)) {
        alert('Please enter a valid number');
        return;
    }

    fetch('/api/convert-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, from_unit: fromUnit, value })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            displayResults(data.results);
        } else {
            alert('Conversion error: ' + data.error);
        }
    })
    .catch(e => alert('Error: ' + e.message));
}

function displayResults(results) {
    const container = document.getElementById('conversionResults');
    container.innerHTML = '';
    Object.entries(results).forEach(([unit, value]) => {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.innerHTML = `<span class="unit">${unit}</span><span class="value">${value}</span>`;
        container.appendChild(item);
    });
}

// Calculator
let calcExpression = '0';

function updateCalcDisplay() {
    document.getElementById('calcDisplay').textContent = calcExpression;
}

function calcInput(char) {
    if (calcExpression === '0' && char !== '.') {
        calcExpression = char;
    } else {
        calcExpression += char;
    }
    updateCalcDisplay();
}

function calcClear() {
    calcExpression = '0';
    updateCalcDisplay();
}

function calcEquals() {
    try {
        calcExpression = String(eval(calcExpression));
        updateCalcDisplay();
    } catch {
        calcExpression = 'Error';
        updateCalcDisplay();
        setTimeout(() => calcClear(), 1000);
    }
}

// Misc Converter
const miscUnitSets = {
    'Angle': ['degree (°)', 'radian (rad)'],
    'Sound Intensity': ['intensity (W/m²)', 'level (dB)'],
    'Power': ['watt (W)', 'kilowatt (kW)', 'megawatt (MW)', 'horsepower (hp)'],
    'Pressure': ['pascal (Pa)', 'kilopascal (kPa)', 'bar', 'atmosphere (atm)', 'torr (Torr)', 'pound per square inch (psi)'],
    'Data': ['bit (b)', 'byte (B)', 'kilobit (kb)', 'kilobyte (kB)', 'megabit (Mb)', 'megabyte (MB)', 'gigabit (Gb)', 'gigabyte (GB)', 'terabit (Tb)', 'terabyte (TB)', 'kibibit (Kib)', 'kibibyte (KiB)', 'mebibit (Mib)', 'mebibyte (MiB)', 'gibibit (Gib)', 'gibibyte (GiB)', 'tebibit (Tib)', 'tebibyte (TiB)'],
    'Frequency': ['hertz (Hz)', 'kilohertz (kHz)', 'megahertz (MHz)', 'gigahertz (GHz)', 'terahertz (THz)']
};

function updateMiscUnits() {
    const category = document.getElementById('miscCategory').value;
    const units = miscUnitSets[category] || [];
    const select = document.getElementById('miscFromUnit');
    select.innerHTML = units.map(u => `<option>${u}</option>`).join('');
}

function convertMisc() {
    const category = document.getElementById('miscCategory').value;
    const fromUnit = document.getElementById('miscFromUnit').value;
    const value = parseFloat(document.getElementById('miscInputValue').value);

    if (isNaN(value)) {
        alert('Please enter a valid number');
        return;
    }

    fetch('/api/convert-misc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, from_unit: fromUnit, value })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            const container = document.getElementById('miscResults');
            container.innerHTML = '';
            Object.entries(data.results).forEach(([unit, val]) => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.innerHTML = `<span class="unit">${unit}</span><span class="value">${val}</span>`;
                container.appendChild(item);
            });
        } else {
            alert('Error: ' + data.error);
        }
    })
    .catch(e => alert('Error: ' + e.message));
}

// Graphing
let graphState = null;

function toggleAutoY() {
    const auto = document.getElementById('graphAutoY').checked;
    document.getElementById('graphYmin').disabled = auto;
    document.getElementById('graphYmax').disabled = auto;
}

function graphClear() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    graphState = null;
    document.getElementById('graphMsg').textContent = '';
}

function graphPlot() {
    const expr = document.getElementById('graphExpr').value.trim();
    const xmin = parseFloat(document.getElementById('graphXmin').value);
    const xmax = parseFloat(document.getElementById('graphXmax').value);

    if (!expr || isNaN(xmin) || isNaN(xmax) || xmax <= xmin) {
        document.getElementById('graphMsg').textContent = 'Invalid input';
        return;
    }

    const samples = 800;
    fetch('/api/graph-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr, xmin, xmax, samples })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success && data.xs.length > 0) {
            let ymin, ymax;
            if (document.getElementById('graphAutoY').checked) {
                ymin = Math.min(...data.ys);
                ymax = Math.max(...data.ys);
                const pad = (ymax - ymin) * 0.1 || 1;
                ymin -= pad;
                ymax += pad;
            } else {
                ymin = parseFloat(document.getElementById('graphYmin').value);
                ymax = parseFloat(document.getElementById('graphYmax').value);
                if (isNaN(ymin) || isNaN(ymax) || ymax <= ymin) {
                    document.getElementById('graphMsg').textContent = 'Invalid Y range';
                    return;
                }
            }
            graphState = { expr, xmin, xmax, ymin, ymax, xs: data.xs, ys: data.ys };
            drawGraph();
            document.getElementById('graphMsg').textContent = '';
        } else {
            document.getElementById('graphMsg').textContent = 'No valid points';
        }
    })
    .catch(e => document.getElementById('graphMsg').textContent = 'Error: ' + e.message);
}

function drawGraph() {
    if (!graphState) return;
    const { expr, xmin, xmax, ymin, ymax, xs, ys } = graphState;
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    const lm = 40, rm = 20, tm = 20, bm = 30;
    const cw = w - lm - rm;
    const ch = h - tm - bm;
    const sx = cw / (xmax - xmin);
    const sy = ch / (ymax - ymin);

    function toPixels(x, y) {
        return [lm + (x - xmin) * sx, tm + ch - (y - ymin) * sy];
    }

    // Draw axes
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 1;
    if (xmin <= 0 && 0 <= xmax) {
        const [x0, _] = toPixels(0, ymax);
        const [__, y_bot] = toPixels(0, ymin);
        ctx.beginPath();
        ctx.moveTo(x0, _);
        ctx.lineTo(x0, y_bot);
        ctx.stroke();
    }
    if (ymin <= 0 && 0 <= ymax) {
        const [x_left, y0] = toPixels(xmin, 0);
        const [x_right, __] = toPixels(xmax, 0);
        ctx.beginPath();
        ctx.moveTo(x_left, y0);
        ctx.lineTo(x_right, y0);
        ctx.stroke();
    }

    // Draw border
    ctx.strokeStyle = '#444444';
    ctx.strokeRect(lm, tm, cw, ch);

    // Draw curve
    ctx.strokeStyle = '#22a6f2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let i = 0; i < xs.length; i++) {
        if (ys[i] !== null) {
            const [px, py] = toPixels(xs[i], ys[i]);
            if (first) {
                ctx.moveTo(px, py);
                first = false;
            } else {
                ctx.lineTo(px, py);
            }
        } else {
            first = true;
        }
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px sans-serif';
    ctx.fillText(`y = ${expr}`, lm + 6, tm + 15);
    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'right';
    ctx.fillText(`x:[${xmin.toFixed(1)},${xmax.toFixed(1)}] y:[${ymin.toFixed(1)},${ymax.toFixed(1)}]`, w - rm, h - bm + 14);
}

// Settings
function applyTheme() {
    const theme = document.getElementById('themeSetting').value;
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
    if (graphState) drawGraph();
}

function resetSettings() {
    if (confirm('Reset all settings to defaults?')) {
        localStorage.clear();
        location.reload();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.getElementById('themeSetting').value = savedTheme;
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
    updateUnits();
    updateMiscUnits();
});
