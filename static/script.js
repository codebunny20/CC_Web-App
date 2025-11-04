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
    localStorage.setItem('graphResolution', document.getElementById('graphResolution').value);
    localStorage.setItem('gridLines', document.getElementById('gridLines').checked);
    
    settingsChanged = false;
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

// ============= INITIALIZE =============
function loadCalculatorState() {
    calcClear();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCalculatorState();
    updateUnits();
    updateMiscUnits();
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
