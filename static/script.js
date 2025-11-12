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
function goToCalculator() { 
    showPage('calculatorPage'); 
    showCalcTab('basic'); 
}
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
    localStorage.setItem('theme', document.getElementById('themeSetting').value);
    localStorage.setItem('defaultCategory', document.getElementById('defaultCategory').value);
    localStorage.setItem('decimalPlaces', document.getElementById('decimalPlaces').value);
    localStorage.setItem('enterToConvert', document.getElementById('enterToConvert').checked);
    localStorage.setItem('graphResolution', document.getElementById('graphResolution').value);
    localStorage.setItem('gridLines', document.getElementById('gridLines').checked);
    
    settingsChanged = false;
}

function saveSettingsManual() {
    saveAllSettings();
    applyTheme();
    alert('Settings saved successfully!');
}

function loadAllSettings() {
    const theme = localStorage.getItem('theme') || 'dark';
    const defaultCategory = localStorage.getItem('defaultCategory') || 'Length';
    const decimalPlaces = localStorage.getItem('decimalPlaces') || '4';
    const enterToConvert = localStorage.getItem('enterToConvert') !== 'false';
    const graphResolution = localStorage.getItem('graphResolution') || 'medium';
    const gridLines = localStorage.getItem('gridLines') !== 'false';

    document.getElementById('themeSetting').value = theme;
    document.getElementById('defaultCategory').value = defaultCategory;
    document.getElementById('decimalPlaces').value = decimalPlaces;
    document.getElementById('enterToConvert').checked = enterToConvert;
    document.getElementById('graphResolution').value = graphResolution;
    document.getElementById('gridLines').checked = gridLines;
}

// ============= SETTINGS PAGE EVENT LISTENERS =============
function setupSettingsListeners() {
    const settingElements = [
        'themeSetting', 'defaultCategory', 'decimalPlaces',
        'enterToConvert', 'graphResolution', 'gridLines'
    ];

    settingElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                markSettingsChanged();
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

// ============= CALCULATOR =============
let calcDisplay = '0';
let calcOperand = null;
let calcLastOperator = null;
let shouldResetDisplay = false;

function updateCalcOperation() {
    const operationDisplay = document.getElementById('calcOperation');
    if (!operationDisplay) return;
    
    if (calcLastOperator === null) {
        operationDisplay.textContent = '';
    } else {
        const opSymbol = calcLastOperator === '+' ? '+' 
                       : calcLastOperator === '-' ? '-'
                       : calcLastOperator === '*' ? '×'
                       : '÷';
        operationDisplay.textContent = `${calcOperand} ${opSymbol} ${calcDisplay}`;
    }
}

function calcInput(val) {
    // Handle number input
    if (/^\d$/.test(val)) {
        if (shouldResetDisplay) {
            calcDisplay = val;
            shouldResetDisplay = false;
        } else {
            if (calcDisplay === '0') {
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
    else if (['+', '-', '*', '/'].includes(val)) {
        if (calcLastOperator !== null && !shouldResetDisplay) {
            calcEquals();
        }
        calcOperand = parseFloat(calcDisplay);
        calcLastOperator = val;
        shouldResetDisplay = true;
    }

    updateCalcDisplay();
    updateCalcOperation();
}

function updateCalcDisplay() {
    const display = document.getElementById('calcDisplay');
    if (display) {
        display.textContent = calcDisplay;
    }
}

function calcClear() {
    calcDisplay = '0';
    calcOperand = null;
    calcLastOperator = null;
    shouldResetDisplay = false;
    updateCalcDisplay();
    updateCalcOperation();
}

function calcEquals() {
    if (calcLastOperator === null || calcOperand === null) {
        return;
    }

    try {
        const current = parseFloat(calcDisplay);
        let result;

        switch (calcLastOperator) {
            case '+':
                result = calcOperand + current;
                break;
            case '-':
                result = calcOperand - current;
                break;
            case '*':
                result = calcOperand * current;
                break;
            case '/':
                if (current === 0) {
                    calcDisplay = 'Error';
                    calcLastOperator = null;
                    calcOperand = null;
                    shouldResetDisplay = true;
                    updateCalcDisplay();
                    updateCalcOperation();
                    setTimeout(() => calcClear(), 1500);
                    return;
                }
                result = calcOperand / current;
                break;
            default:
                return;
        }

        if (!isFinite(result)) {
            calcDisplay = 'Error';
        } else {
            calcDisplay = result.toString().length > 15 
                ? result.toFixed(8).replace(/\.?0+$/, '') 
                : result.toString();
        }

        calcLastOperator = null;
        calcOperand = null;
        shouldResetDisplay = true;
        updateCalcDisplay();
        updateCalcOperation();
    } catch (e) {
        calcDisplay = 'Error';
        calcLastOperator = null;
        calcOperand = null;
        shouldResetDisplay = true;
        updateCalcDisplay();
        updateCalcOperation();
        setTimeout(() => calcClear(), 1500);
    }
}

// ============= SCIENTIFIC CALCULATOR =============
let sciExpr = '';
let sciAns = null;

function showCalcTab(tab) {
    const map = {
        basic: 'basicCalcSection',
        scientific: 'scientificCalcSection',
        programmer: 'programmerCalcSection',
        finance: 'financeCalcSection',
    };
    const targetId = map[tab] || map.basic;

    // Hide all calculator mode sections
    document.querySelectorAll('.calc-mode').forEach(sec => sec.style.display = 'none');
    const target = document.getElementById(targetId);
    if (target) target.style.display = '';

    // Update active state on tab buttons
    document.querySelectorAll('.calc-tab').forEach(btn => btn.classList.remove('active'));
    const btnId = tab === 'basic' ? 'tabBasic'
                : tab === 'scientific' ? 'tabScientific'
                : tab === 'programmer' ? 'tabProgrammer'
                : 'tabFinance';
    const activeBtn = document.getElementById(btnId);
    if (activeBtn) activeBtn.classList.add('active');
}

function updateSciDisplays() {
    const op = document.getElementById('sciOperation');
    const disp = document.getElementById('sciDisplay');
    if (op) op.textContent = sciExpr || '';
    if (disp) disp.textContent = (sciAns !== null) ? String(sciAns) : (sciExpr || '0');
}

function sciClear() {
    sciExpr = '';
    sciAns = null;
    updateSciDisplays();
}

function sciBackspace() {
    if (!sciExpr) return;
    // Remove last token or character
    const funcs = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'sqrt(', 'log10(', 'log2(', 'log('];
    for (const f of funcs) {
        if (sciExpr.endsWith(f)) {
            sciExpr = sciExpr.slice(0, -f.length);
            updateSciDisplays();
            return;
        }
    }
    sciExpr = sciExpr.slice(0, -1);
    updateSciDisplays();
}

function sciAppend(token) {
    if (token === 'PI') token = 'pi';
    if (token === 'E') token = 'e';
    sciExpr += token;
    sciAns = null;
    updateSciDisplays();
}

function sciEquals() {
    if (!sciExpr) return;
    // Replace any accidental unicode multiplication or division signs if introduced
    const expr = sciExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

    fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            sciAns = d.result;
            // Continue with result as next expression baseline
            sciExpr = String(d.result);
            updateSciDisplays();
        } else {
            sciAns = 'Error';
            updateSciDisplays();
            setTimeout(() => sciClear(), 1200);
        }
    })
    .catch(() => {
        sciAns = 'Error';
        updateSciDisplays();
        setTimeout(() => sciClear(), 1200);
    });
}

// ============= PROGRAMMER CALCULATOR =============
let progBase = 10;
let progCur = '';      // current number in current base as string
let progExpr = '';     // expression string in decimal with bitwise ops
let progResult = null; // last evaluated decimal string

function progSetBase(base) {
    progBase = base;
    progRefresh();
}

function progIsValidDigit(ch) {
    const d = ch.toUpperCase();
    if (/[0-9]/.test(d)) return parseInt(d, 10) < progBase;
    if (/[A-F]/.test(d)) return progBase === 16;
    return false;
}

function progAppendDigit(d) {
    const up = d.toUpperCase();
    if (!progIsValidDigit(up)) return;
    // avoid leading zeros noise
    if (progCur === '0') progCur = '';
    progCur += up;
    progRefresh();
}

function progBackspace() {
    if (!progCur) return;
    progCur = progCur.slice(0, -1);
    progRefresh();
}

function progClear() {
    progCur = '';
    progExpr = '';
    progResult = null;
    progRefresh();
}

function progAppendParen(p) {
    // if there's a buffered number, push it first
    if (progCur) {
        progPushCurrentNumberToExpr();
    }
    progExpr += p;
    progRefresh();
}

function progAppendOp(op) {
    if (op === 'NOT') {
        if (progCur) {
            const dec = progCurToDecString();
            progExpr += (progNeedsOpSeparator(progExpr) ? ' ' : '') + `~(${dec})`;
            progCur = '';
        } else {
            // unary NOT operator placed, next number will follow
            progExpr += (progNeedsOpSeparator(progExpr) ? ' ' : '') + '~';
        }
    } else {
        if (progCur) {
            progPushCurrentNumberToExpr();
        }
        const mapped = op; // &, |, ^, <<, >>, +, -, *, /
        progExpr += (progNeedsOpSeparator(progExpr) ? ' ' : '') + mapped + ' ';
    }
    progRefresh();
}

function progEvaluate() {
    if (progCur) progPushCurrentNumberToExpr();
    const expr = progExpr.trim();
    if (!expr) return;
    fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expr, mode: 'programmer' })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            progResult = d.result; // decimal string
            progCur = '';          // keep buffer empty
            progExpr = '';         // start fresh with result shown
            progRefresh();
        } else {
            progShowError();
        }
    })
    .catch(progShowError);
}

function progShowError() {
    const disp = document.getElementById('progDisplay');
    if (disp) disp.textContent = 'Error';
    setTimeout(() => progRefresh(), 1200);
}

function progNeedsOpSeparator(expr) {
    if (!expr) return false;
    const last = expr.trim().slice(-1);
    return last && !' ('.includes(last);
}

function progPushCurrentNumberToExpr() {
    const dec = progCurToDecString();
    progExpr += (progNeedsOpSeparator(progExpr) ? '' : '') + dec;
    progCur = '';
}

function progCurToDecString() {
    if (!progCur) return '0';
    const negative = progCur.startsWith('-');
    const str = negative ? progCur.slice(1) : progCur;
    const decBig = bigIntFromBase(str, progBase);
    return (negative ? '-' : '') + decBig.toString();
}

function bigIntFromBase(str, base) {
    const map = ch => {
        const c = ch.toUpperCase();
        if (c >= '0' && c <= '9') return BigInt(c.charCodeAt(0) - 48);
        return BigInt(10 + (c.charCodeAt(0) - 65));
    };
    let n = 0n;
    const b = BigInt(base);
    for (const ch of str) {
        n = n * b + map(ch);
    }
    return n;
}

function bigIntToBaseString(n, base) {
    const digits = '0123456789ABCDEF';
    if (n === 0n) return '0';
    const b = BigInt(base);
    const neg = n < 0n;
    let x = neg ? -n : n;
    let out = '';
    while (x > 0n) {
        const rem = x % b;
        out = digits[Number(rem)] + out;
        x = x / b;
    }
    return neg ? '-' + out : out;
}

function progGetActiveValueAsBigInt() {
    if (progCur) {
        const dec = progCurToDecString();
        try { return BigInt(dec); } catch { return 0n; }
    }
    if (progResult !== null) {
        try { return BigInt(progResult); } catch { return 0n; }
    }
    return 0n;
}

function progRefresh() {
    // Operation line
    const opEl = document.getElementById('progOperation');
    if (opEl) opEl.textContent = progExpr || '';

    // Main display shows current value in current base
    const disp = document.getElementById('progDisplay');
    const activeVal = progGetActiveValueAsBigInt();
    const shown = progCur
        ? progCur
        : bigIntToBaseString(activeVal, progBase);
    if (disp) disp.textContent = shown;

    // Base selector sync
    const baseSel = document.getElementById('progBase');
    if (baseSel) baseSel.value = String(progBase);

    // Conversions
    const decEl = document.getElementById('progDec');
    const hexEl = document.getElementById('progHex');
    const octEl = document.getElementById('progOct');
    const binEl = document.getElementById('progBin');
    const n = activeVal;
    if (decEl) decEl.textContent = n.toString();
    if (hexEl) hexEl.textContent = '0x' + bigIntToBaseString(n, 16);
    if (octEl) octEl.textContent = '0o' + bigIntToBaseString(n, 8);
    if (binEl) binEl.textContent = '0b' + bigIntToBaseString(n, 2);

    // Enable/disable A-F based on base
    const hexKeys = ['progA','progB','progC','progD','progE','progF'];
    hexKeys.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.disabled = progBase !== 16;
    });
}

// ============= GRAPHING CALCULATOR =============
let graphState = null;

function toggleAutoY() {
    const autoY = document.getElementById('graphAutoY').checked;
    document.getElementById('graphYmin').disabled = autoY;
    document.getElementById('graphYmax').disabled = autoY;
}

function graphPlot() {
    const expr = document.getElementById('graphExpr').value;
    const xmin = parseFloat(document.getElementById('graphXmin').value);
    const xmax = parseFloat(document.getElementById('graphXmax').value);
    const autoY = document.getElementById('graphAutoY').checked;
    const ymin = parseFloat(document.getElementById('graphYmin').value);
    const ymax = parseFloat(document.getElementById('graphYmax').value);
    const msgDiv = document.getElementById('graphMsg');
    
    if (!expr || isNaN(xmin) || isNaN(xmax)) {
        msgDiv.textContent = 'Invalid input values';
        msgDiv.style.color = 'var(--error)';
        return;
    }
    
    if (xmin >= xmax) {
        msgDiv.textContent = 'X min must be less than X max';
        msgDiv.style.color = 'var(--error)';
        return;
    }
    
    msgDiv.textContent = 'Plotting...';
    msgDiv.style.color = 'var(--text-dim)';
    
    const resolution = localStorage.getItem('graphResolution') || 'medium';
    let samples = 600;
    if (resolution === 'low') samples = 300;
    if (resolution === 'high') samples = 1000;
    
    fetch('/api/graph-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            expr: expr,
            xmin: xmin,
            xmax: xmax,
            samples: samples
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success && d.xs.length > 0) {
            let computedYmin = Math.min(...d.ys);
            let computedYmax = Math.max(...d.ys);
            
            if (computedYmin === computedYmax) {
                computedYmin -= 1;
                computedYmax += 1;
            }
            
            const padding = (computedYmax - computedYmin) * 0.1;
            computedYmin -= padding;
            computedYmax += padding;
            
            graphState = {
                xs: d.xs,
                ys: d.ys,
                xmin: xmin,
                xmax: xmax,
                ymin: autoY ? computedYmin : ymin,
                ymax: autoY ? computedYmax : ymax,
                expr: expr
            };
            
            drawGraph();
            msgDiv.textContent = '';
        } else {
            msgDiv.textContent = 'Error plotting graph: ' + (d.error || 'Unknown error');
            msgDiv.style.color = 'var(--error)';
            graphState = null;
        }
    })
    .catch(err => {
        msgDiv.textContent = 'Error: ' + err.message;
        msgDiv.style.color = 'var(--error)';
    });
}

function drawGraph() {
    if (!graphState) return;
    
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const padding = 50;
    const width = canvas.width - 2 * padding;
    const height = canvas.height - 2 * padding;
    
    const { xs, ys, xmin, xmax, ymin, ymax } = graphState;
    
    // Background
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-card').trim();
    if (!ctx.fillStyle) ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    if (document.getElementById('gridLines').checked) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i <= 10; i++) {
            const x = padding + (i / 10) * width;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, canvas.height - padding);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let i = 0; i <= 10; i++) {
            const y = padding + (i / 10) * height;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
    }
    
    // Axes
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // Axis labels
    ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X-axis labels
    for (let i = 0; i <= 5; i++) {
        const x = padding + (i / 5) * width;
        const value = xmin + (i / 5) * (xmax - xmin);
        ctx.fillText(value.toFixed(1), x, canvas.height - padding + 15);
    }
    
    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const y = canvas.height - padding - (i / 5) * height;
        const value = ymin + (i / 5) * (ymax - ymin);
        ctx.fillText(value.toFixed(1), padding - 10, y);
    }
    
    // Plot curve
    ctx.strokeStyle = 'rgba(96, 165, 250, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let first = true;
    for (let i = 0; i < xs.length; i++) {
        const x = padding + ((xs[i] - xmin) / (xmax - xmin)) * width;
        const y = canvas.height - padding - ((ys[i] - ymin) / (ymax - ymin)) * height;
        
        if (first) {
            ctx.moveTo(x, y);
            first = false;
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Plot points
    ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
    for (let i = 0; i < xs.length; i += Math.max(1, Math.floor(xs.length / 50))) {
        const x = padding + ((xs[i] - xmin) / (xmax - xmin)) * width;
        const y = canvas.height - padding - ((ys[i] - ymin) / (ymax - ymin)) * height;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function graphClear() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-card').trim();
    if (!ctx.fillStyle) ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    graphState = null;
    document.getElementById('graphMsg').textContent = '';
}

// ============= INITIALIZE =============
function loadCalculatorState() {
    calcClear();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCalculatorState();
    updateUnits();
    updateMiscUnits();
    // Initialize scientific calculator
    sciClear();
    // Initialize programmer calculator
    progRefresh();
});

function loadConverterPreferences() {
    const defaultCategory = localStorage.getItem('defaultCategory') || 'Length';
    const categorySelect = document.getElementById('category');
    categorySelect.value = defaultCategory;
}

function loadMiscConverterPreferences() {
    const defaultCategory = localStorage.getItem('defaultCategory') || 'Angle';
    const miscCategory = document.getElementById('miscCategory');
    // Only set if the category exists in misc conversions
    if (['Angle', 'Sound Intensity', 'Power', 'Pressure', 'Data', 'Frequency'].includes(defaultCategory)) {
        miscCategory.value = defaultCategory;
    } else {
        miscCategory.value = 'Angle';
    }
}

// ============= GAME CALCULATOR FUNCTIONS =============
function updateGameRpmUnits() {
    const type = document.getElementById('gameRpmType').value;
    const select = document.getElementById('gameRpmFromUnit');
    
    if (type === 'RPM') {
        select.innerHTML = `
            <option>RPM (Revolutions/Min)</option>
            <option>RPS (Revolutions/Sec)</option>
            <option>Hz (Cycles/Sec)</option>
            <option>rad/s (Radians/Sec)</option>
        `;
    } else {
        select.innerHTML = `
            <option>RPM (Rounds/Min)</option>
            <option>RPS (Rounds/Sec)</option>
            <option>RPH (Rounds/Hour)</option>
        `;
    }
}

function convertGameRpm() {
    const type = document.getElementById('gameRpmType').value;
    const fromUnit = document.getElementById('gameRpmFromUnit').value;
    const value = parseFloat(document.getElementById('gameRpmValue').value);
    
    if (isNaN(value)) {
        alert('Enter a valid number');
        return;
    }

    fetch('/api/game-rpm-convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversion_type: type,
            from_unit: fromUnit,
            value: value
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            const html = Object.entries(d.results)
                .map(([unit, val]) => `<div class="result-item"><span class="unit">${unit}</span><span class="value">${val}</span></div>`)
                .join('');
            document.getElementById('gameRpmResults').innerHTML = html;
        } else {
            alert('Error: ' + d.error);
        }
    });
}

function calculateReloadStats() {
    const magSize = parseFloat(document.getElementById('reloadMagSize').value);
    const reloadTime = parseFloat(document.getElementById('reloadTime').value);
    const rps = parseFloat(document.getElementById('reloadRPS').value);
    
    if (isNaN(magSize) || isNaN(reloadTime) || isNaN(rps)) {
        alert('Enter valid numbers');
        return;
    }

    fetch('/api/game-reload-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            mag_size: magSize,
            reload_time: reloadTime,
            rps: rps
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            const html = Object.entries(d.results)
                .map(([label, val]) => `<div class="result-item"><span class="unit">${label}</span><span class="value">${val}</span></div>`)
                .join('');
            document.getElementById('reloadResults').innerHTML = html;
        } else {
            alert('Error: ' + d.error);
        }
    });
}

function calculateWeaponSwap() {
    const reload1 = parseFloat(document.getElementById('weaponSwapReload1').value);
    const reload2 = parseFloat(document.getElementById('weaponSwapReload2').value);
    const swapTime = parseFloat(document.getElementById('weaponSwapTime').value);
    
    if (isNaN(reload1) || isNaN(reload2) || isNaN(swapTime)) {
        alert('Enter valid numbers');
        return;
    }

    fetch('/api/game-weapon-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            reload1: reload1,
            reload2: reload2,
            swap_time: swapTime
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            const html = Object.entries(d.results)
                .map(([label, val]) => `<div class="result-item"><span class="unit">${label}</span><span class="value">${val}</span></div>`)
                .join('');
            document.getElementById('weaponSwapResults').innerHTML = html;
        } else {
            alert('Error: ' + d.error);
        }
    });
}

function calculateDPS() {
    const damage = parseFloat(document.getElementById('dpsDamage').value);
    const rpm = parseFloat(document.getElementById('dpsRPM').value);
    const magSize = parseFloat(document.getElementById('dpsMagSize').value);
    const reloadTime = parseFloat(document.getElementById('dpsReloadTime').value);
    const accuracy = parseFloat(document.getElementById('dpsAccuracy').value);
    
    if (isNaN(damage) || isNaN(rpm) || isNaN(magSize) || isNaN(reloadTime) || isNaN(accuracy)) {
        alert('Enter valid numbers');
        return;
    }

    fetch('/api/game-dps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            damage: damage,
            rpm: rpm,
            mag_size: magSize,
            reload_time: reloadTime,
            accuracy: accuracy
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            const html = Object.entries(d.results)
                .map(([label, val]) => `<div class="result-item"><span class="unit">${label}</span><span class="value">${val}</span></div>`)
                .join('');
            document.getElementById('dpsResults').innerHTML = html;
        } else {
            alert('Error: ' + d.error);
        }
    });
}

function calculateTTK() {
    const health = parseFloat(document.getElementById('ttkHealth').value);
    const damage = parseFloat(document.getElementById('ttkDamage').value);
    const rpm = parseFloat(document.getElementById('ttkRPM').value);
    const headshotMult = parseFloat(document.getElementById('ttkHeadshotMult').value);
    
    if (isNaN(health) || isNaN(damage) || isNaN(rpm) || isNaN(headshotMult)) {
        alert('Enter valid numbers');
        return;
    }

    fetch('/api/game-ttk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            health: health,
            damage: damage,
            rpm: rpm,
            headshot_mult: headshotMult
        })
    })
    .then(r => r.json())
    .then(d => {
        if (d.success) {
            const html = Object.entries(d.results)
                .map(([label, val]) => `<div class="result-item"><span class="unit">${label}</span><span class="value">${val}</span></div>`)
                .join('');
            document.getElementById('ttkResults').innerHTML = html;
        } else {
            alert('Error: ' + d.error);
        }
    });
}
