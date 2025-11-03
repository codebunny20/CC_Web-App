from flask import Flask, render_template, request, jsonify
import math
import json
import os


app = Flask(__name__)

# Conversion factors (same as desktop app)
FACTORS = {
    "LENGTH": {
        "meter (m)": 1,
        "kilometer (km)": 1000,
        "centimeter (cm)": 0.01,
        "millimeter (mm)": 0.001,
        "inch (in)": 0.0254,
        "foot (ft)": 0.3048,
        "yard (yd)": 0.9144,
        "mile (mi)": 1609.344
    },
    "MASS": {
        "kilogram (kg)": 1,
        "gram (g)": 0.001,
        "milligram (mg)": 1e-6,
        "metric ton (t)": 1000,
        "ounce (oz)": 0.028349523125,
        "pound (lb)": 0.45359237,
        "stone": 6.35029318
    },
    "TIME": {
        "second (s)": 1,
        "minute (min)": 60,
        "hour (h)": 3600,
        "day": 86400,
        "week": 604800,
        "year": 31536000
    },
    "AREA": {
        "square meter (m²)": 1,
        "hectare (ha)": 10000,
        "acre": 4046.8564224,
        "square kilometer (km²)": 1_000_000,
        "square foot (ft²)": 0.09290304,
        "square inch (in²)": 0.00064516
    },
    "VOLUME": {
        "cubic meter (m³)": 1,
        "liter (L)": 0.001,
        "milliliter (mL)": 1e-6,
        "gallon (US)": 0.003785411784,
        "gallon (UK)": 0.00454609,
        "pint (US)": 0.000473176473,
        "quart (US)": 0.000946352946,
        "cubic foot (ft³)": 0.028316846592,
        "cubic inch (in³)": 0.000016387064
    },
    "SPEED": {
        "meter per second (m/s)": 1,
        "kilometer per hour (km/h)": 1000/3600,
        "mile per hour (mph)": 1609.344/3600,
        "foot per second (ft/s)": 0.3048,
        "knot (kn)": 1852/3600
    },
    "PRESSURE": {
        "pascal (Pa)": 1.0,
        "kilopascal (kPa)": 1_000.0,
        "bar": 100_000.0,
        "atmosphere (atm)": 101_325.0,
        "torr (Torr)": 101_325.0 / 760.0,
        "pound per square inch (psi)": 6_894.757293168361,
    },
    "POWER": {
        "watt (W)": 1.0,
        "kilowatt (kW)": 1000.0,
        "megawatt (MW)": 1_000_000.0,
        "horsepower (hp)": 745.6998715822702,
    }
}

# Build DATA factors
k, ki = 1000.0, 1024.0
FACTORS["DATA"] = {
    "bit (b)": 1.0, "byte (B)": 8.0,
    "kilobit (kb)": k, "kilobyte (kB)": 8.0 * k,
    "megabit (Mb)": k**2, "megabyte (MB)": 8.0 * (k**2),
    "gigabit (Gb)": k**3, "gigabyte (GB)": 8.0 * (k**3),
    "terabit (Tb)": k**4, "terabyte (TB)": 8.0 * (k**4),
    "kibibit (Kib)": ki, "kibibyte (KiB)": 8.0 * ki,
    "mebibit (Mib)": ki**2, "mebibyte (MiB)": 8.0 * (ki**2),
    "gibibit (Gib)": ki**3, "gibibyte (GiB)": 8.0 * (ki**3),
    "tebibit (Tib)": ki**4, "tebibyte (TiB)": 8.0 * (ki**4),
}

MISC_UNITS = {
    "Angle": ["degree (°)", "radian (rad)"],
    "Sound Intensity": ["intensity (W/m²)", "level (dB)"],
    "Power": list(FACTORS["POWER"].keys()),
    "Pressure": list(FACTORS["PRESSURE"].keys()),
    "Data": list(FACTORS["DATA"].keys()),
    "Frequency": ["hertz (Hz)", "kilohertz (kHz)", "megahertz (MHz)", "gigahertz (GHz)", "terahertz (THz)"],
    "RPM": ["revolutions per minute (RPM)", "revolutions per second (RPS)", "hertz (Hz)", "radians per second (rad/s)"],
    "Firearm ROF": ["rounds per minute (RPM)", "rounds per second (RPS)", "rounds per hour (RPH)"]
}

def format_number(v):
    """Format conversion result for display."""
    if v == 0:
        return "0"
    abs_v = abs(v)
    if abs_v >= 1e6 or abs_v < 1e-3:
        return f"{v:.6g}"
    return f"{v:.6f}".rstrip("0").rstrip(".")

def linear_convert(value, from_unit, to_unit, factors):
    """Generic linear unit conversion."""
    if from_unit == to_unit:
        return value
    return value * factors[from_unit] / factors[to_unit]

def convert_temperature(from_unit, to_unit, value):
    """Temperature conversion with offset."""
    if from_unit == to_unit:
        return value
    
    c_map = {
        "Celsius (°C)": (lambda v: v, lambda v: v),
        "Fahrenheit (°F)": (lambda v: (v - 32) * 5/9, lambda v: v * 9/5 + 32),
        "kelvin (K)": (lambda v: v - 273.15, lambda v: v + 273.15),
    }
    
    to_c, from_c = c_map[from_unit]
    _, to_result = c_map[to_unit]
    return to_result(to_c(value))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/convert', methods=['POST'])
def api_convert():
    """Convert units - main converter."""
    data = request.json
    category = data.get('category', 'Length')
    from_unit = data.get('from_unit')
    to_unit = data.get('to_unit')
    value = float(data.get('value', 0))
    
    try:
        if category == "Temperature":
            result = convert_temperature(from_unit, to_unit, value)
        else:
            factors = FACTORS.get(category.upper(), {})
            result = linear_convert(value, from_unit, to_unit, factors)
        
        return jsonify({"success": True, "result": format_number(result)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/convert-all', methods=['POST'])
def api_convert_all():
    """Convert to all units in a category."""
    data = request.json
    category = data.get('category', 'Length')
    from_unit = data.get('from_unit')
    value = float(data.get('value', 0))
    
    units = {
        "Length": list(FACTORS["LENGTH"].keys()),
        "Mass": list(FACTORS["MASS"].keys()),
        "Time": list(FACTORS["TIME"].keys()),
        "Temperature": ["kelvin (K)", "Celsius (°C)", "Fahrenheit (°F)"],
        "Area": list(FACTORS["AREA"].keys()),
        "Volume": list(FACTORS["VOLUME"].keys()),
        "Speed": list(FACTORS["SPEED"].keys())
    }.get(category, [])
    
    results = {}
    try:
        for to_unit in units:
            if category == "Temperature":
                result = convert_temperature(from_unit, to_unit, value)
            else:
                factors = FACTORS.get(category.upper(), {})
                result = linear_convert(value, from_unit, to_unit, factors)
            results[to_unit] = format_number(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
    
    return jsonify({"success": True, "results": results})

@app.route('/api/convert-misc', methods=['POST'])
def api_convert_misc():
    """Convert misc units (Angle, Power, etc)."""
    data = request.json
    category = data.get('category', 'Angle')
    from_unit = data.get('from_unit')
    value = float(data.get('value', 0))
    
    results = {}
    try:
        units = MISC_UNITS.get(category, [])
        for to_unit in units:
            if category == "Angle":
                result = convert_misc_angle(from_unit, to_unit, value)
            elif category == "Sound Intensity":
                result = convert_misc_sound_intensity(from_unit, to_unit, value)
            elif category in ["Power", "Pressure", "Data"]:
                factors = FACTORS[category.upper()]
                result = linear_convert(value, from_unit, to_unit, factors)
            elif category == "Frequency":
                result = convert_misc_frequency(from_unit, to_unit, value)
            elif category == "RPM":
                result = convert_misc_rpm(from_unit, to_unit, value)
            elif category == "Firearm ROF":
                result = convert_firearm_rof(from_unit, to_unit, value)
            results[to_unit] = format_number(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
    
    return jsonify({"success": True, "results": results})

def convert_misc_angle(from_unit, to_unit, value):
    if from_unit == to_unit:
        return value
    if from_unit == "degree (°)" and to_unit == "radian (rad)":
        return value * math.pi / 180.0
    if from_unit == "radian (rad)" and to_unit == "degree (°)":
        return value * 180.0 / math.pi
    return value

def convert_misc_sound_intensity(from_unit, to_unit, value):
    I0 = 1e-12
    if from_unit == to_unit:
        return value
    if from_unit == "intensity (W/m²)" and to_unit == "level (dB)":
        if value <= 0:
            raise ValueError("Intensity must be > 0")
        return 10.0 * math.log10(value / I0)
    if from_unit == "level (dB)" and to_unit == "intensity (W/m²)":
        return I0 * (10.0 ** (value / 10.0))
    return value

def convert_misc_frequency(from_unit, to_unit, value):
    freq_factors = {
        "hertz (Hz)": 1.0,
        "kilohertz (kHz)": 1e3,
        "megahertz (MHz)": 1e6,
        "gigahertz (GHz)": 1e9,
        "terahertz (THz)": 1e12,
    }
    if from_unit == to_unit:
        return value
    return value * freq_factors[from_unit] / freq_factors[to_unit]

def convert_misc_rpm(from_unit, to_unit, value):
    """Convert between RPM and related rotational/frequency units."""
    if from_unit == to_unit:
        return value
    
    # Convert to RPM as base unit
    to_rpm = {
        "revolutions per minute (RPM)": 1.0,
        "revolutions per second (RPS)": 1.0 / 60.0,
        "hertz (Hz)": 1.0 / 60.0,
        "radians per second (rad/s)": 1.0 / (60.0 / (2 * math.pi))
    }
    
    # Convert from base unit (RPM) to target
    from_rpm = {
        "revolutions per minute (RPM)": 1.0,
        "revolutions per second (RPS)": 60.0,
        "hertz (Hz)": 60.0,
        "radians per second (rad/s)": 60.0 / (2 * math.pi)
    }
    
    rpm_value = value / to_rpm[from_unit]
    return rpm_value * from_rpm[to_unit]

def convert_firearm_rof(from_unit, to_unit, value):
    """Convert between firearm rate of fire units."""
    if from_unit == to_unit:
        return value
    
    # Convert to RPM as base unit
    to_rpm = {
        "rounds per minute (RPM)": 1.0,
        "rounds per second (RPS)": 1.0 / 60.0,
        "rounds per hour (RPH)": 1.0 / 60.0
    }
    
    # Convert from base unit (RPM) to target
    from_rpm = {
        "rounds per minute (RPM)": 1.0,
        "rounds per second (RPS)": 60.0,
        "rounds per hour (RPH)": 60.0
    }
    
    rpm_value = value / to_rpm[from_unit]
    return rpm_value * from_rpm[to_unit]

@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    """Evaluate a mathematical expression."""
    data = request.json
    expr = data.get('expr', '')
    try:
        result = eval(expr, {"__builtins__": {}}, {})
        return jsonify({"success": True, "result": format_number(result)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/graph-sample', methods=['POST'])
def api_graph_sample():
    """Sample points for graphing."""
    data = request.json
    expr = data.get('expr', 'sin(x)')
    xmin = float(data.get('xmin', -10))
    xmax = float(data.get('xmax', 10))
    samples = int(data.get('samples', 600))
    
    env = {
        "pi": math.pi, "e": math.e,
        "sin": math.sin, "cos": math.cos, "tan": math.tan,
        "asin": math.asin, "acos": math.acos, "atan": math.atan,
        "exp": math.exp, "log": math.log, "log10": math.log10,
        "sqrt": math.sqrt, "abs": abs, "floor": math.floor, "ceil": math.ceil,
        "pow": pow
    }
    
    xs, ys = [], []
    dx = (xmax - xmin) / max(1, samples - 1)
    
    for i in range(samples):
        x = xmin + i * dx
        env["x"] = x
        try:
            y = float(eval(expr, {"__builtins__": {}}, env))
            if math.isfinite(y):
                xs.append(x)
                ys.append(y)
        except:
            pass
    
    return jsonify({"success": True, "xs": xs, "ys": ys})

if __name__ == '__main__':
    app.run(debug=True)
