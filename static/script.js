// ============= PAGE NAVIGATION =============
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

// ============= SETTINGS =============
function applyTheme() {
    const theme = document.getElementById('themeSetting').value;
    if (theme === 'dark') {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }
    localStorage.setItem('theme', theme);
    if (graphState) drawGraph();
}

function resetSettings() {
    if (confirm('Reset all settings to default?')) {
        document.getElementById('themeSetting').value = 'dark';
        localStorage.clear();
        location.reload();
    }
}

window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.getElementById('themeSetting').value = savedTheme;
    applyTheme();
});

// ============= CONVERTER DATA =============
const conversionData = {
    'Length': {
        'Meter': 1,
        'Kilometer': 0.001,
        'Centimeter': 100,
        'Millimeter': 1000,
        'Mile': 0.000621371,
        'Yard': 1.09361,
        'Foot': 3.28084,
        'Inch': 39.3701
    },
    'Mass': {
        'Kilogram': 1,
        'Gram': 1000,
        'Milligram': 1000000,
        'Pound': 2.20462,
        'Ounce': 35.274
    },
    'Time': {
        'Second': 1,
        'Millisecond': 1000,
        'Minute': 1/60,
        'Hour': 1/3600,
        'Day': 1/86400
    },
    'Temperature': {
        'Celsius': 'c',
        'Fahrenheit': 'f',
        'Kelvin': 'k'
    },
    'Area': {
        'Square Meter': 1,
        'Square Kilometer': 0.000001,
        'Square Centimeter': 10000,
        'Square Mile': 3.861e-7,
        'Square Yard': 1.19599,
        'Square Foot': 10.7639,
        'Hectare': 0.0001
    },
    'Volume': {
        'Liter': 1,
        'Milliliter': 1000,
        'Cubic Meter': 0.001,
        'Gallon': 0.264172,
        'Quart': 1.05669,
        'Pint': 2.11338,
        'Cup': 4.22675
    },
    'Speed': {
        'Meter/Second': 1,
        'Kilometer/Hour': 3.6,
        'Mile/Hour': 2.23694,
        'Knot': 1.94384
    }
};

const miscConversionData = {
    'Angle': {
        'Radian': 1,
        'Degree': 57.2958,
        'Gradian': 63.6620
    },
    'Sound Intensity': {
        'Decibel (W/m²)': 1,
        'Watt/m²': 'db'
    },
    'Power': {
        'Watt': 1,
        'Kilowatt': 0.001,
        'Megawatt': 0.000001,
        'Horsepower': 0.00134102,
        'BTU/hour': 3.41214
    },
    'Pressure': {
        'Pascal': 1,
        'Kilopascal': 0.001,
        'Bar': 0.00001,
        'PSI': 0.000145038,
        'Atmosphere': 0.00000986923
    },
    'Data': {
        'Byte': 1,
        'Kilobyte': 0.001,
        'Megabyte': 0.000001,
        'Gigabyte': 0.000000001,
        'Terabyte': 0.000000000001
    },
    'Frequency': {
        'Hertz': 1,
        'Kilohertz': 0.001,
        'Megahertz': 0.000001,
        'Gigahertz': 0.000000001
    },
    'RPM': {
        'RPM': 1,
        'RPS': 60,
        'Hertz': 60,
        'Rad/s': 9.5493
    },
    'Firearm ROF': {
        'RPM': 1,
        'RPS': 60,
        'RPH': 1/60
    }
};

// ============= CONVERTER FUNCTIONS =============
function updateUnits() {
    const category = document.getElementById('category').value;
    const units = Object.keys(conversionData[category]);
    const select = document.getElementById('fromUnit');
    select.innerHTML = units.map(u => `<option>${u}</option>`).join('');
}

function convertUnits() {
    const category = document.getElementById('category').value;
    const fromUnit = document.getElementById('fromUnit').value;
    const value = parseFloat(document.getElementById('inputValue').value);

    if (isNaN(value)) {
        alert('Enter a valid number');
        return;
    }

    const data = conversionData[category];
    const fromFactor = data[fromUnit];

    if (category === 'Temperature') {
        convertTemperature(value, fromUnit);
    } else {
        const baseValue = value / fromFactor;
        const results = document.getElementById('conversionResults');
        results.innerHTML = Object.entries(data)
            .map(([unit, factor]) => {
                const result = (baseValue * factor).toFixed(6).replace(/\.?0+$/, '');
                return `<div class="result-item"><span class="unit">${unit}</span><span class="value">${result}</span></div>`;
            })
            .join('');
    }
}

function convertTemperature(value, fromUnit) {
    let celsius;
    if (fromUnit === 'Celsius') celsius = value;
    else if (fromUnit === 'Fahrenheit') celsius = (value - 32) * 5/9;
    else if (fromUnit === 'Kelvin') celsius = value - 273.15;

    const results = {
        'Celsius': celsius,
        'Fahrenheit': celsius * 9/5 + 32,
        'Kelvin': celsius + 273.15
    };

    const html = Object.entries(results)
        .map(([unit, val]) => `<div class="result-item"><span class="unit">${unit}</span><span class="value">${val.toFixed(2)}</span></div>`)
        .join('');
    document.getElementById('conversionResults').innerHTML = html;
}

// ============= MISC CONVERTER FUNCTIONS =============
function updateMiscUnits() {
    const category = document.getElementById('miscCategory').value;
    const units = Object.keys(miscConversionData[category]);
    const select = document.getElementById('miscFromUnit');
    select.innerHTML = units.map(u => `<option>${u}</option>`).join('');
}

function convertMisc() {
    const category = document.getElementById('miscCategory').value;
    const fromUnit = document.getElementById('miscFromUnit').value;
    const value = parseFloat(document.getElementById('miscInputValue').value);

    if (isNaN(value)) {
        alert('Enter a valid number');
        return;
    }

    const data = miscConversionData[category];
    const fromFactor = data[fromUnit];

    if (typeof fromFactor === 'string') {
        convertSpecialMisc(value, category, fromUnit);
    } else {
        const baseValue = value / fromFactor;
        const results = document.getElementById('miscResults');
        results.innerHTML = Object.entries(data)
            .map(([unit, factor]) => {
                if (typeof factor === 'string') return '';
                const result = (baseValue * factor).toFixed(6).replace(/\.?0+$/, '');
                return `<div class="result-item"><span class="unit">${unit}</span><span class="value">${result}</span></div>`;
            })
            .join('');
    }
}

function convertSpecialMisc(value, category, fromUnit) {
    const results = document.getElementById('miscResults');
    if (category === 'Sound Intensity') {
        const watt = fromUnit === 'Decibel (W/m²)' ? Math.pow(10, value/10) * 1e-12 : value;
        const db = fromUnit === 'Watt/m²' ? 10 * Math.log10(value / 1e-12) : value;
        results.innerHTML = `
            <div class="result-item"><span class="unit">Decibel (W/m²)</span><span class="value">${db.toFixed(2)}</span></div>
            <div class="result-item"><span class="unit">Watt/m²</span><span class="value">${watt.toFixed(6)}</span></div>
        `;
    }
}

// ============= CALCULATOR FUNCTIONS =============
let calcDisplay = '0';

function calcInput(val) {
    if (calcDisplay === '0' && val !== '.') calcDisplay = val;
    else calcDisplay += val;
    document.getElementById('calcDisplay').textContent = calcDisplay;
}

function calcClear() {
    calcDisplay = '0';
    document.getElementById('calcDisplay').textContent = calcDisplay;
}

function calcEquals() {
    try {
        calcDisplay = String(eval(calcDisplay));
        document.getElementById('calcDisplay').textContent = calcDisplay;
    } catch {
        calcDisplay = 'Error';
        document.getElementById('calcDisplay').textContent = calcDisplay;
        setTimeout(() => calcClear(), 1000);
    }
}

// ============= GRAPHING FUNCTIONS =============

let graphState = null;

function toggleAutoY() {
    const autoY = document.getElementById('graphAutoY').checked;
    document.getElementById('graphYmin').disabled = autoY;
    document.getElementById('graphYmax').disabled = autoY;
}

function graphClear() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById('graphMsg').textContent = '';
    graphState = null;
}

function graphPlot() {
    const expr = document.getElementById('graphExpr').value.trim();
    const xMin = parseFloat(document.getElementById('graphXmin').value);
    const xMax = parseFloat(document.getElementById('graphXmax').value);
    const autoY = document.getElementById('graphAutoY').checked;
    let yMin = parseFloat(document.getElementById('graphYmin').value);
    let yMax = parseFloat(document.getElementById('graphYmax').value);

    if (!expr) {
        document.getElementById('graphMsg').textContent = 'Enter an expression';
        return;
    }

    if (isNaN(xMin) || isNaN(xMax) || xMin >= xMax) {
        document.getElementById('graphMsg').textContent = 'Invalid x range';
        return;
    }

    if (!autoY && (isNaN(yMin) || isNaN(yMax) || yMin >= yMax)) {
        document.getElementById('graphMsg').textContent = 'Invalid y range';
        return;
    }

    const points = _graph_sample(expr, xMin, xMax);

    if (points.length === 0) {
        document.getElementById('graphMsg').textContent = 'No valid points to plot';
        return;
    }

    if (autoY) {
        const bounds = _graph_autoscale(points);
        yMin = bounds.yMin;
        yMax = bounds.yMax;
    }

    graphState = { expr, xMin, xMax, yMin, yMax, points };
    _graph_draw(points, xMin, xMax, yMin, yMax, expr);
    document.getElementById('graphMsg').textContent = '';
}

function _graph_sample(expr, xMin, xMax) {
    const points = [];
    const step = (xMax - xMin) / 500;
    const mathContext = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        exp: Math.exp,
        log: Math.log,
        log10: Math.log10,
        sqrt: Math.sqrt,
        abs: Math.abs,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        pi: Math.PI,
        e: Math.E
    };

    try {
        const func = new Function('x', ...Object.keys(mathContext), `return ${expr}`);
        for (let x = xMin; x <= xMax; x += step) {
            try {
                const y = func(x, ...Object.values(mathContext));
                if (isFinite(y)) {
                    points.push({ x, y });
                }
            } catch {
                // Skip invalid points
            }
        }
    } catch (err) {
        document.getElementById('graphMsg').textContent = `Expression error: ${err.message}`;
        return [];
    }

    return points;
}

function _graph_autoscale(points) {
    let yMin = Infinity, yMax = -Infinity;
    points.forEach(p => {
        if (p.y < yMin) yMin = p.y;
        if (p.y > yMax) yMax = p.y;
    });

    const padding = (yMax - yMin) * 0.1 || 1;
    return {
        yMin: yMin - padding,
        yMax: yMax + padding
    };
}

function _graph_draw(points, xMin, xMax, yMin, yMax, expr) {
    const canvas = document.getElementById('graphCanvas');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');

    const margin = 50;
    const plotWidth = canvas.width - 2 * margin;
    const plotHeight = canvas.height - 2 * margin;

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
        const x = margin + (i / 10) * plotWidth;
        const y = margin + (i / 10) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(x, margin);
        ctx.lineTo(x, canvas.height - margin);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(canvas.width - margin, y);
        ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    const xAxisY = margin + ((0 - yMin) / (yMax - yMin)) * plotHeight;
    const yAxisX = margin + ((0 - xMin) / (xMax - xMin)) * plotWidth;

    if (yMin <= 0 && 0 <= yMax) {
        ctx.beginPath();
        ctx.moveTo(margin, xAxisY);
        ctx.lineTo(canvas.width - margin, xAxisY);
        ctx.stroke();
    }

    if (xMin <= 0 && 0 <= xMax) {
        ctx.beginPath();
        ctx.moveTo(yAxisX, margin);
        ctx.lineTo(yAxisX, canvas.height - margin);
        ctx.stroke();
    }

    // Plot function
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    let started = false;

    for (let i = 0; i < points.length; i++) {
        const x = points[i].x;
        const y = points[i].y;

        if (y < yMin || y > yMax) continue;

        const px = margin + ((x - xMin) / (xMax - xMin)) * plotWidth;
        const py = canvas.height - margin - ((y - yMin) / (yMax - yMin)) * plotHeight;

        if (!started) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            started = true;
        } else {
            const prevX = points[i - 1].x;
            const prevY = points[i - 1].y;
            if (Math.abs(y - prevY) > (yMax - yMin) * 0.5) {
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(px, py);
            } else {
                ctx.lineTo(px, py);
            }
        }
    }

    if (started) ctx.stroke();

    // Labels and axis values
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    for (let i = 0; i <= 5; i++) {
        const x = margin + (i / 5) * plotWidth;
        const xVal = (xMin + (i / 5) * (xMax - xMin)).toFixed(1);
        ctx.fillText(xVal, x, canvas.height - margin + 20);

        const y = margin + (i / 5) * plotHeight;
        const yVal = (yMax - (i / 5) * (yMax - yMin)).toFixed(1);
        ctx.textAlign = 'right';
        ctx.fillText(yVal, margin - 10, y + 4);
        ctx.textAlign = 'center';
    }

    // Title
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`y = ${expr}`, canvas.width / 2, 20);
}

// ============= INITIALIZE =============
document.addEventListener('DOMContentLoaded', () => {
    updateUnits();
    updateMiscUnits();
    toggleAutoY();
});
