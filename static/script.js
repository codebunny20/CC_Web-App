// ============= DROPDOWN MENU =============
function toggleDropdown() {
    const dropdown = document.getElementById('toolsDropdown');
    dropdown.classList.toggle('active');
}

function closeDropdown() {
    const dropdown = document.getElementById('toolsDropdown');
    dropdown.classList.remove('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('toolsDropdown');
    const dropdownContainer = document.querySelector('.dropdown-container');
    if (!dropdownContainer.contains(e.target)) {
        closeDropdown();
    }
});

// ============= PAGE NAVIGATION =============
function showPage(pageId) {
    closeDropdown();
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function goToHome() { showPage('homePage'); }
function goToConverter() { 
    showPage('converterPage');
    loadConverterPreferences();
    updateUnits();
}
function goToCalculator() { showPage('calculatorPage'); }
function goToMiscConverter() { 
    showPage('miscPage');
    loadMiscConverterPreferences();
    updateMiscUnits();
}
function goToGraphing() { showPage('graphingPage'); }
function goToSettings() { showPage('settingsPage'); }
function goToAbout() { showPage('aboutPage'); }
function goToGameCalc() { 
    showPage('gameCalcPage');
    updateGameRpmUnits();
}

// ============= SETTINGS STATE MANAGEMENT =============
let settingsChanged = false;

function markSettingsChanged() {
    settingsChanged = true;
}

function saveAllSettings() {
    if (!settingsChanged) return;
    
    localStorage.setItem('theme', document.getElementById('themeSetting').value);
    localStorage.setItem('defaultCategory', document.getElementById('defaultCategory').value);
    localStorage.setItem('decimalPlaces', document.getElementById('decimalPlaces').value);
    localStorage.setItem('enterToConvert', document.getElementById('enterToConvert').checked);
    localStorage.setItem('calcHistory', document.getElementById('calcHistory').checked);
    localStorage.setItem('calcSound', document.getElementById('calcSound').checked);
    localStorage.setItem('graphResolution', document.getElementById('graphResolution').value);
    localStorage.setItem('gridLines', document.getElementById('gridLines').checked);
    localStorage.setItem('saveHistory', document.getElementById('saveHistory').checked);
    
    settingsChanged = false;
}

function loadAllSettings() {
    const theme = localStorage.getItem('theme') || 'dark';
    const defaultCategory = localStorage.getItem('defaultCategory') || 'Length';
    const decimalPlaces = localStorage.getItem('decimalPlaces') || '4';
    const enterToConvert = localStorage.getItem('enterToConvert') !== 'false';
    const calcHistory = localStorage.getItem('calcHistory') !== 'false';
    const calcSound = localStorage.getItem('calcSound') !== 'false';
    const graphResolution = localStorage.getItem('graphResolution') || 'medium';
    const gridLines = localStorage.getItem('gridLines') !== 'false';
    const saveHistory = localStorage.getItem('saveHistory') !== 'false';

    document.getElementById('themeSetting').value = theme;
    document.getElementById('defaultCategory').value = defaultCategory;
    document.getElementById('decimalPlaces').value = decimalPlaces;
    document.getElementById('enterToConvert').checked = enterToConvert;
    document.getElementById('calcHistory').checked = calcHistory;
    document.getElementById('calcSound').checked = calcSound;
    document.getElementById('graphResolution').value = graphResolution;
    document.getElementById('gridLines').checked = gridLines;
    document.getElementById('saveHistory').checked = saveHistory;
}

// ============= SETTINGS PAGE EVENT LISTENERS =============
function setupSettingsListeners() {
    const settingElements = [
        'themeSetting', 'defaultCategory', 'decimalPlaces',
        'enterToConvert', 'calcHistory', 'calcSound',
        'graphResolution', 'gridLines', 'saveHistory'
    ];

    settingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                markSettingsChanged();
                saveAllSettings();
            });
        }
    });
}

// ============= SETTINGS =============
function applyTheme() {
    const theme = document.getElementById('themeSetting').value;
    if (theme === 'dark') {
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
    }
    localStorage.setItem('theme', theme);
    markSettingsChanged();
    if (graphState) drawGraph();
}

function resetSettings() {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
        localStorage.clear();
        document.getElementById('themeSetting').value = 'dark';
        loadAllSettings();
        applyTheme();
        location.reload();
    }
}

window.addEventListener('load', () => {
    loadAllSettings();
    applyTheme();
    setupSettingsListeners();
    loadCalculatorState();
});

// Save settings before leaving page
window.addEventListener('beforeunload', () => {
    saveAllSettings();
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
    const decimalPlaces = parseInt(localStorage.getItem('decimalPlaces')) || 4;

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
                const result = (baseValue * factor).toFixed(decimalPlaces).replace(/\.?0+$/, '');
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

    const decimalPlaces = parseInt(localStorage.getItem('decimalPlaces')) || 4;

    const results = {
        'Celsius': celsius,
        'Fahrenheit': celsius * 9/5 + 32,
        'Kelvin': celsius + 273.15
    };

    const html = Object.entries(results)
        .map(([unit, val]) => `<div class="result-item"><span class="unit">${unit}</span><span class="value">${val.toFixed(decimalPlaces)}</span></div>`)
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
    const decimalPlaces = parseInt(localStorage.getItem('decimalPlaces')) || 4;

    if (isNaN(value)) {
        alert('Enter a valid number');
        return;
    }

    const data = miscConversionData[category];
    const fromFactor = data[fromUnit];

    if (typeof fromFactor === 'string') {
        convertSpecialMisc(value, category, fromUnit, decimalPlaces);
    } else {
        const baseValue = value / fromFactor;
        const results = document.getElementById('miscResults');
        results.innerHTML = Object.entries(data)
            .map(([unit, factor]) => {
                if (typeof factor === 'string') return '';
                const result = (baseValue * factor).toFixed(decimalPlaces).replace(/\.?0+$/, '');
                return `<div class="result-item"><span class="unit">${unit}</span><span class="value">${result}</span></div>`;
            })
            .join('');
    }
}

function convertSpecialMisc(value, category, fromUnit, decimalPlaces) {
    const results = document.getElementById('miscResults');
    if (category === 'Sound Intensity') {
        const watt = fromUnit === 'Decibel (W/m²)' ? Math.pow(10, value/10) * 1e-12 : value;
        const db = fromUnit === 'Watt/m²' ? 10 * Math.log10(value / 1e-12) : value;
        results.innerHTML = `
            <div class="result-item"><span class="unit">Decibel (W/m²)</span><span class="value">${db.toFixed(decimalPlaces)}</span></div>
            <div class="result-item"><span class="unit">Watt/m²</span><span class="value">${watt.toFixed(decimalPlaces)}</span></div>
        `;
    }
}

// ============= CALCULATOR ENHANCEMENTS =============
let calcDisplay = '0';
let calcMemory = 0;
let calcHistory = [];
let calcScientificMode = false;
let lastOperator = null;
let shouldResetDisplay = false;

function loadCalculatorState() {
    const saved = localStorage.getItem('calcMemory');
    const savedHistory = localStorage.getItem('calcHistory');
    if (saved) calcMemory = parseFloat(saved);
    if (savedHistory) {
        try {
            calcHistory = JSON.parse(savedHistory);
            renderHistory();
        } catch (e) {
            calcHistory = [];
        }
    }
    updateMemoryDisplay();
}

function saveCalculatorState() {
    localStorage.setItem('calcMemory', calcMemory);
    localStorage.setItem('calcHistory', JSON.stringify(calcHistory));
}

function toggleScientificMode() {
    calcScientificMode = !calcScientificMode;
    const basicGrid = document.getElementById('basicGrid');
    const scientificGrid = document.getElementById('scientificGrid');
    if (basicGrid) basicGrid.style.display = calcScientificMode ? 'none' : 'grid';
    if (scientificGrid) scientificGrid.style.display = calcScientificMode ? 'grid' : 'none';
}

function calcInput(val) {
    // Handle number input
    if (/^\d$/.test(val)) {
        if (shouldResetDisplay) {
            calcDisplay = val;
            shouldResetDisplay = false;
        } else {
            if (calcDisplay === '0' && val !== '.') {
                calcDisplay = val;
            } else if (calcDisplay.length < 15) {
                calcDisplay += val;
            }
        }
    }
    // Handle decimal point
    else if (val === '.') {
        if (shouldResetDisplay) {
            calcDisplay = '0.';
            shouldResetDisplay = false;
        } else if (!calcDisplay.includes('.')) {
            calcDisplay += '.';
        }
    }
    // Handle operators
    else if (['+', '-', '*', '/', '%', '^'].includes(val)) {
        if (!shouldResetDisplay && calcDisplay !== '0' && calcDisplay !== '') {
            // Complete previous calculation if operator pressed
            if (lastOperator && !shouldResetDisplay) {
                calcEquals();
            }
        }
        lastOperator = val;
        shouldResetDisplay = true;
    }
    // Handle parentheses
    else if (val === '(' || val === ')') {
        if (shouldResetDisplay && val === '(') {
            calcDisplay = val;
            shouldResetDisplay = false;
        } else {
            calcDisplay += val;
        }
    }
    // Handle backspace
    else if (val === 'backspace') {
        if (calcDisplay.length > 1) {
            calcDisplay = calcDisplay.slice(0, -1);
        } else {
            calcDisplay = '0';
        }
        shouldResetDisplay = false;
    }

    updateCalcDisplay();
}

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.textContent = calcDisplay;
    }
}

function calcScientific(func) {
    const expr = calcDisplay;
    let result;
    
    try {
        switch(func) {
            case 'sin':
                result = Math.sin(parseExpression(expr));
                break;
            case 'cos':
                result = Math.cos(parseExpression(expr));
                break;
            case 'tan':
                result = Math.tan(parseExpression(expr));
                break;
            case 'asin':
                const asinVal = parseExpression(expr);
                if (asinVal < -1 || asinVal > 1) throw new Error('asin domain error');
                result = Math.asin(asinVal);
                break;
            case 'acos':
                const acosVal = parseExpression(expr);
                if (acosVal < -1 || acosVal > 1) throw new Error('acos domain error');
                result = Math.acos(acosVal);
                break;
            case 'atan':
                result = Math.atan(parseExpression(expr));
                break;
            case 'log':
                const logVal = parseExpression(expr);
                if (logVal <= 0) throw new Error('log domain error');
                result = Math.log10(logVal);
                break;
            case 'ln':
                const lnVal = parseExpression(expr);
                if (lnVal <= 0) throw new Error('ln domain error');
                result = Math.log(lnVal);
                break;
            case 'sqrt':
                const sqrtVal = parseExpression(expr);
                if (sqrtVal < 0) throw new Error('sqrt of negative number');
                result = Math.sqrt(sqrtVal);
                break;
            case 'pi':
                calcDisplay = (calcDisplay === '0') ? String(Math.PI) : calcDisplay + Math.PI;
                shouldResetDisplay = true;
                updateCalcDisplay();
                return;
            case 'e':
                calcDisplay = (calcDisplay === '0') ? String(Math.E) : calcDisplay + Math.E;
                shouldResetDisplay = true;
                updateCalcDisplay();
                return;
        }
        
        if (result !== undefined) {
            addToHistory(expr, result);
            calcDisplay = formatResult(result);
            shouldResetDisplay = true;
            lastOperator = null;
            updateCalcDisplay();
        }
    } catch (e) {
        calcDisplay = 'Error: ' + e.message;
        lastOperator = null;
        shouldResetDisplay = true;
        updateCalcDisplay();
        setTimeout(() => calcClear(), 2000);
    }
}

function parseExpression(expr) {
    // Replace ^ with ** for power
    expr = expr.replace(/\^/g, '**');
    // Use Function constructor for safer evaluation
    try {
        const result = Function('"use strict"; return (' + expr + ')')();
        return result;
    } catch (e) {
        throw new Error('Invalid expression');
    }
}

function formatResult(result) {
    if (!isFinite(result)) {
        throw new Error('Invalid result');
    }
    
    // Format with appropriate decimal places
    if (Math.abs(result) >= 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
        return result.toExponential(6);
    }
    
    const rounded = Math.round(result * 1e10) / 1e10;
    const str = rounded.toString();
    
    // Limit display length
    if (str.length > 15) {
        return rounded.toFixed(8).replace(/\.?0+$/, '');
    }
    return str;
}

function calcClear() {
    calcDisplay = '0';
    lastOperator = null;
    shouldResetDisplay = false;
    updateCalcDisplay();
}

function calcEquals() {
    try {
        const expr = calcDisplay.replace(/\^/g, '**');
        
        // Validate expression
        if (!expr || expr === '0' || expr === '.' || /[+\-*/%^(]$/.test(expr)) {
            return;
        }
        
        const result = parseExpression(expr);
        
        if (!isFinite(result)) {
            throw new Error('Invalid calculation');
        }
        
        addToHistory(calcDisplay, result);
        calcDisplay = formatResult(result);
        lastOperator = null;
        shouldResetDisplay = true;
        updateCalcDisplay();
    } catch (e) {
        calcDisplay = 'Error';
        lastOperator = null;
        shouldResetDisplay = true;
        updateCalcDisplay();
        setTimeout(() => calcClear(), 1500);
    }
}

function addToHistory(expression, result) {
    if (calcHistory.length >= 100) {
        calcHistory.shift(); // Remove oldest item if history exceeds 100
    }
    
    calcHistory.push({
        expr: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    });
    renderHistory();
    saveCalculatorState();
}

function renderHistory() {
    const tape = document.getElementById('historyTape');
    if (!tape) return;
    
    if (calcHistory.length === 0) {
        tape.innerHTML = '<p style="color: var(--text-dim); text-align: center; padding: 1rem;">No history</p>';
        return;
    }
    
    tape.innerHTML = calcHistory.map((item, idx) => `
        <div class="history-item" onclick="recallFromHistory(${idx})" style="cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: background 0.2s;" onmouseover="this.style.background='rgba(96, 165, 250, 0.1)'" onmouseout="this.style.background='transparent'">
            <div class="history-item-expr">${item.expr}</div>
            <div class="history-item-result">= ${formatResult(item.result)}</div>
        </div>
    `).join('');
}

function recallFromHistory(idx) {
    if (idx >= 0 && idx < calcHistory.length) {
        calcDisplay = formatResult(calcHistory[idx].result);
        lastOperator = null;
        shouldResetDisplay = true;
        updateCalcDisplay();
    }
}

function clearHistory() {
    if (confirm('Clear calculation history?')) {
        calcHistory = [];
        renderHistory();
        saveCalculatorState();
    }
}

// ============= MEMORY FUNCTIONS =============
function updateMemoryDisplay() {
    const memDisplay = document.getElementById('calcMemDisplay');
    if (!memDisplay) return;
    
    const display = calcMemory === 0 ? 'M: 0' : `M: ${formatResult(calcMemory)}`;
    memDisplay.textContent = display;
}

function calcMemoryAdd() {
    try {
        const val = parseExpression(calcDisplay);
        calcMemory += val;
        updateMemoryDisplay();
        saveCalculatorState();
    } catch (e) {
        calcDisplay = 'Error';
        shouldResetDisplay = true;
        updateCalcDisplay();
        setTimeout(() => calcClear(), 1500);
    }
}

function calcMemorySubtract() {
    try {
        const val = parseExpression(calcDisplay);
        calcMemory -= val;
        updateMemoryDisplay();
        saveCalculatorState();
    } catch (e) {
        calcDisplay = 'Error';
        shouldResetDisplay = true;
        updateCalcDisplay();
        setTimeout(() => calcClear(), 1500);
    }
}

function calcMemoryRecall() {
    calcDisplay = formatResult(calcMemory);
    lastOperator = null;
    shouldResetDisplay = true;
    updateCalcDisplay();
}

function calcMemoryClear() {
    calcMemory = 0;
    updateMemoryDisplay();
    saveCalculatorState();
}

// ============= SETTINGS FUNCTIONS =============
function exportSettings() {
    const settings = {
        theme: document.getElementById('themeSetting').value,
        defaultCategory: document.getElementById('defaultCategory').value,
        decimalPlaces: document.getElementById('decimalPlaces').value,
        enterToConvert: document.getElementById('enterToConvert').checked,
        calcHistory: document.getElementById('calcHistory').checked,
        calcSound: document.getElementById('calcSound').checked,
        graphResolution: document.getElementById('graphResolution').value,
        gridLines: document.getElementById('gridLines').checked,
        saveHistory: document.getElementById('saveHistory').checked,
        calcMemory: calcMemory,
        calcHistoryData: calcHistory
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cc-app-settings.json';
    link.click();
    URL.revokeObjectURL(url);
}

function importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const settings = JSON.parse(event.target.result);
                document.getElementById('themeSetting').value = settings.theme || 'dark';
                document.getElementById('defaultCategory').value = settings.defaultCategory || 'Length';
                document.getElementById('decimalPlaces').value = settings.decimalPlaces || 4;
                document.getElementById('enterToConvert').checked = settings.enterToConvert !== false;
                document.getElementById('calcHistory').checked = settings.calcHistory !== false;
                document.getElementById('calcSound').checked = settings.calcSound !== false;
                document.getElementById('graphResolution').value = settings.graphResolution || 'medium';
                document.getElementById('gridLines').checked = settings.gridLines !== false;
                document.getElementById('saveHistory').checked = settings.saveHistory !== false;
                if (settings.calcMemory) calcMemory = settings.calcMemory;
                if (settings.calcHistoryData && Array.isArray(settings.calcHistoryData)) {
                    calcHistory = settings.calcHistoryData;
                    renderHistory();
                }
                applyTheme();
                saveCalculatorState();
                alert('Settings imported successfully!');
            } catch (err) {
                alert('Error importing settings: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function drawGraph() {
    if (graphState) {
        _graph_draw(graphState.points, graphState.xMin, graphState.xMax, graphState.yMin, graphState.yMax, graphState.expr);
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

// ============= GAME CALCULATOR FUNCTIONS =============

const gameRpmUnits = {
    'RPM': ['revolutions per minute (RPM)', 'revolutions per second (RPS)', 'hertz (Hz)', 'radians per second (rad/s)'],
    'Firearm': ['rounds per minute (RPM)', 'rounds per second (RPS)', 'rounds per hour (RPH)']
};

function updateGameRpmUnits() {
    const type = document.getElementById('gameRpmType').value;
    const units = gameRpmUnits[type];
    const select = document.getElementById('gameRpmFromUnit');
    select.innerHTML = units.map(u => `<option>${u}</option>`).join('');
}

function convertGameRpm() {
    const type = document.getElementById('gameRpmType').value;
    const fromUnit = document.getElementById('gameRpmFromUnit').value;
    const value = parseFloat(document.getElementById('gameRpmValue').value);

    if (isNaN(value) || value < 0) {
        alert('Enter a valid positive number');
        return;
    }

    const units = gameRpmUnits[type];
    const results = document.getElementById('gameRpmResults');
    let resultsList = '';

    try {
        units.forEach(toUnit => {
            let result;
            if (type === 'RPM') {
                result = convertGameRpmStandard(fromUnit, toUnit, value);
            } else {
                result = convertGameRpmFirearm(fromUnit, toUnit, value);
            }
            const formatted = result.toFixed(6).replace(/\.?0+$/, '');
            resultsList += `<div class="result-item"><span class="unit">${toUnit}</span><span class="value">${formatted}</span></div>`;
        });
    } catch (e) {
        alert('Conversion error: ' + e.message);
        return;
    }

    results.innerHTML = resultsList;
}

function convertGameRpmStandard(fromUnit, toUnit, value) {
    if (fromUnit === toUnit) return value;
    
    const toRpm = {
        'revolutions per minute (RPM)': 1.0,
        'revolutions per second (RPS)': 1.0 / 60.0,
        'hertz (Hz)': 1.0 / 60.0,
        'radians per second (rad/s)': 1.0 / (60.0 / (2 * Math.PI))
    };
    
    const fromRpm = {
        'revolutions per minute (RPM)': 1.0,
        'revolutions per second (RPS)': 60.0,
        'hertz (Hz)': 60.0,
        'radians per second (rad/s)': 60.0 / (2 * Math.PI)
    };
    
    const rpmValue = value / toRpm[fromUnit];
    return rpmValue * fromRpm[toUnit];
}

function convertGameRpmFirearm(fromUnit, toUnit, value) {
    if (fromUnit === toUnit) return value;
    
    const toRpm = {
        'rounds per minute (RPM)': 1.0,
        'rounds per second (RPS)': 1.0 / 60.0,
        'rounds per hour (RPH)': 1.0 / 60.0
    };
    
    const fromRpm = {
        'rounds per minute (RPM)': 1.0,
        'rounds per second (RPS)': 60.0,
        'rounds per hour (RPH)': 60.0
    };
    
    const rpmValue = value / toRpm[fromUnit];
    return rpmValue * fromRpm[toUnit];
}

function calculateReloadStats() {
    const magSize = parseFloat(document.getElementById('reloadMagSize').value);
    const reloadTime = parseFloat(document.getElementById('reloadTime').value);
    const rps = parseFloat(document.getElementById('reloadRPS').value);

    if (isNaN(magSize) || isNaN(reloadTime) || isNaN(rps) || magSize <= 0 || reloadTime <= 0 || rps <= 0) {
        alert('Enter valid positive numbers');
        return;
    }

    const rpm = rps * 60;
    const roundsPerReload = magSize;
    const timeToEmptyMag = magSize / rps;
    const timePerRound = 1 / rps;
    const cycleTime = reloadTime + timeToEmptyMag;
    const avgDpsNoAccuracy = (magSize / cycleTime) * 1; // 1 damage per round placeholder

    const results = `
        <div class="result-item"><span class="unit">Fire Rate (RPM)</span><span class="value">${rpm.toFixed(0)}</span></div>
        <div class="result-item"><span class="unit">Fire Rate (RPS)</span><span class="value">${rps.toFixed(2)}</span></div>
        <div class="result-item"><span class="unit">Time to Empty Magazine</span><span class="value">${timeToEmptyMag.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Time Per Shot</span><span class="value">${timePerRound.toFixed(3)}s</span></div>
        <div class="result-item"><span class="unit">Reload Time</span><span class="value">${reloadTime.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Full Cycle Time (Fire + Reload)</span><span class="value">${cycleTime.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Rounds Per Minute (Sustained)</span><span class="value">${(magSize / cycleTime * 60).toFixed(0)}</span></div>
    `;
    
    document.getElementById('reloadResults').innerHTML = results;
}

function calculateWeaponSwap() {
    const reload1 = parseFloat(document.getElementById('weaponSwapReload1').value);
    const reload2 = parseFloat(document.getElementById('weaponSwapReload2').value);
    const swapTime = parseFloat(document.getElementById('weaponSwapTime').value);

    if (isNaN(reload1) || isNaN(reload2) || isNaN(swapTime) || reload1 <= 0 || reload2 <= 0 || swapTime <= 0) {
        alert('Enter valid positive numbers');
        return;
    }

    const totalSequentialTime = reload1 + reload2 + swapTime;
    const simultaneousTime = Math.max(reload1, reload2) + swapTime;
    const timeSaved = totalSequentialTime - simultaneousTime;
    const efficiencyGain = (timeSaved / totalSequentialTime * 100).toFixed(1);

    const results = `
        <div class="result-item"><span class="unit">Weapon 1 Reload Time</span><span class="value">${reload1.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Weapon 2 Reload Time</span><span class="value">${reload2.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Swap Time</span><span class="value">${swapTime.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Sequential Time (Reload 1 → Swap → Reload 2)</span><span class="value">${totalSequentialTime.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Simultaneous Time (Swap during longer reload)</span><span class="value">${simultaneousTime.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Time Saved by Swapping</span><span class="value">${timeSaved.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Efficiency Gain</span><span class="value">${efficiencyGain}%</span></div>
    `;
    
    document.getElementById('weaponSwapResults').innerHTML = results;
}

function calculateDPS() {
    const damage = parseFloat(document.getElementById('dpsDamage').value);
    const rpm = parseFloat(document.getElementById('dpsRPM').value);
    const magSize = parseFloat(document.getElementById('dpsMagSize').value);
    const reloadTime = parseFloat(document.getElementById('dpsReloadTime').value);
    const accuracy = parseFloat(document.getElementById('dpsAccuracy').value) / 100;

    if (isNaN(damage) || isNaN(rpm) || isNaN(magSize) || isNaN(reloadTime) || isNaN(accuracy) || 
        damage <= 0 || rpm <= 0 || magSize <= 0 || reloadTime <= 0 || accuracy < 0 || accuracy > 1) {
        alert('Enter valid numbers');
        return;
    }

    const rps = rpm / 60;
    const timeToEmptyMag = magSize / rps;
    const cycleTime = reloadTime + timeToEmptyMag;
    const damagePerMag = damage * magSize * accuracy;
    const dpsNoReload = damage * rps * accuracy;
    const dpsSustained = damagePerMag / cycleTime;
    const bulletsPerSecond = rps * accuracy;

    const results = `
        <div class="result-item"><span class="unit">Damage Per Shot</span><span class="value">${damage.toFixed(1)}</span></div>
        <div class="result-item"><span class="unit">Fire Rate (RPS)</span><span class="value">${rps.toFixed(2)}</span></div>
        <div class="result-item"><span class="unit">Accuracy</span><span class="value">${(accuracy * 100).toFixed(0)}%</span></div>
        <div class="result-item"><span class="unit">Bullets Per Second (Accurate)</span><span class="value">${bulletsPerSecond.toFixed(2)}</span></div>
        <div class="result-item"><span class="unit">DPS (No Reload Considered)</span><span class="value">${dpsNoReload.toFixed(1)}</span></div>
        <div class="result-item"><span class="unit">DPS (Sustained with Reload)</span><span class="value">${dpsSustained.toFixed(1)}</span></div>
        <div class="result-item"><span class="unit">Damage Per Magazine</span><span class="value">${damagePerMag.toFixed(1)}</span></div>
        <div class="result-item"><span class="unit">Time to Empty Magazine</span><span class="value">${timeToEmptyMag.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Full Cycle Time (Fire + Reload)</span><span class="value">${cycleTime.toFixed(2)}s</span></div>
    `;
    
    document.getElementById('dpsResults').innerHTML = results;
}

function calculateTTK() {
    const health = parseFloat(document.getElementById('ttkHealth').value);
    const damage = parseFloat(document.getElementById('ttkDamage').value);
    const rpm = parseFloat(document.getElementById('ttkRPM').value);
    const headshotMult = parseFloat(document.getElementById('ttkHeadshotMult').value);

    if (isNaN(health) || isNaN(damage) || isNaN(rpm) || isNaN(headshotMult) ||
        health <= 0 || damage <= 0 || rpm <= 0 || headshotMult < 1) {
        alert('Enter valid numbers');
        return;
    }

    const rps = rpm / 60;
    const timePerShot = 1 / rps;
    
    // Body shot calculations
    const shotsToKillBody = Math.ceil(health / damage);
    const ttkBodyShots = (shotsToKillBody - 1) * timePerShot;
    
    // Headshot calculations
    const headshotDamage = damage * headshotMult;
    const shotsToKillHeadshot = Math.ceil(health / headshotDamage);
    const ttkHeadshots = (shotsToKillHeadshot - 1) * timePerShot;
    
    // Mixed (1 headshot + body)
    const remainingHealth = health - headshotDamage;
    const additionalBodyShots = Math.ceil(remainingHealth / damage);
    const ttkMixed = (1 + additionalBodyShots - 1) * timePerShot;

    const results = `
        <div class="result-item"><span class="unit">Target Health</span><span class="value">${health.toFixed(0)}</span></div>
        <div class="result-item"><span class="unit">Fire Rate (RPS)</span><span class="value">${rps.toFixed(2)}</span></div>
        <div class="result-item"><span class="unit">Time Per Shot</span><span class="value">${timePerShot.toFixed(3)}s</span></div>
        <div class="result-item"><span class="unit">Body Shot TTK</span><span class="value">${ttkBodyShots.toFixed(2)}s (${shotsToKillBody} shots)</span></div>
        <div class="result-item"><span class="unit">Headshot TTK (${(headshotMult)}x damage)</span><span class="value">${ttkHeadshots.toFixed(2)}s (${shotsToKillHeadshot} shots)</span></div>
        <div class="result-item"><span class="unit">Mixed TTK (1 Headshot + Body)</span><span class="value">${ttkMixed.toFixed(2)}s</span></div>
        <div class="result-item"><span class="unit">Time Saved by Headshotting</span><span class="value">${(ttkBodyShots - ttkHeadshots).toFixed(2)}s</span></div>
    `;
    
    document.getElementById('ttkResults').innerHTML = results;
}

// ============= INITIALIZE =============
document.addEventListener('DOMContentLoaded', () => {
    updateUnits();
    updateMiscUnits();
    toggleAutoY();
});

function loadConverterPreferences() {
    const defaultCategory = localStorage.getItem('defaultCategory') || 'Length';
    const categorySelect = document.getElementById('category');
    categorySelect.value = defaultCategory;
}

function loadMiscConverterPreferences() {
    const defaultCategory = localStorage.getItem('defaultCategory') || 'Length';
    const miscCategory = document.getElementById('miscCategory');
    // Only set if the category exists in misc conversions
    if (['Angle', 'Sound Intensity', 'Power', 'Pressure', 'Data', 'Frequency'].includes(defaultCategory)) {
        miscCategory.value = defaultCategory;
    }
}
