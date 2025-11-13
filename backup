from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

# Conversion factors
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
    
    to_rpm = {
        "revolutions per minute (RPM)": 1.0,
        "revolutions per second (RPS)": 1.0 / 60.0,
        "hertz (Hz)": 1.0 / 60.0,
        "radians per second (rad/s)": 1.0 / (60.0 / (2 * math.pi))
    }
    
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
    
    to_rpm = {
        "rounds per minute (RPM)": 1.0,
        "rounds per second (RPS)": 1.0 / 60.0,
        "rounds per hour (RPH)": 1.0 / 60.0
    }
    
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
    mode = data.get('mode', 'default')
    try:
        # Support ^ as power for default/scientific, but preserve XOR for programmer
        if mode == 'programmer':
            safe_expr = expr  # keep bitwise ^, <<, >>, ~ intact
        else:
            safe_expr = expr.replace('^', '**')
        safe_expr = safe_expr.replace('ln', 'log')

        # Safe math environment
        env = {
            "pi": math.pi, "e": math.e,
            "sin": math.sin, "cos": math.cos, "tan": math.tan,
            "asin": math.asin, "acos": math.acos, "atan": math.atan,
            "sinh": math.sinh, "cosh": math.cosh, "tanh": math.tanh,
            "exp": math.exp, "log": math.log, "log10": math.log10, "log2": math.log2,
            "sqrt": math.sqrt, "abs": abs, "floor": math.floor, "ceil": math.ceil,
            "pow": pow, "fabs": math.fabs
        }

        result = eval(safe_expr, {"__builtins__": {}}, env)

        if mode == 'programmer':
            # Ensure integer string (no formatting, no scientific notation)
            return jsonify({"success": True, "result": str(int(result))})
        else:
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
    
    if samples > 2000:
        samples = 2000
    if samples < 100:
        samples = 100
    
    env = {
        "pi": math.pi, "e": math.e,
        "sin": math.sin, "cos": math.cos, "tan": math.tan,
        "asin": math.asin, "acos": math.acos, "atan": math.atan,
        "sinh": math.sinh, "cosh": math.cosh, "tanh": math.tanh,
        "exp": math.exp, "log": math.log, "log10": math.log10, "log2": math.log2,
        "sqrt": math.sqrt, "abs": abs, "floor": math.floor, "ceil": math.ceil,
        "pow": pow, "fabs": math.fabs
    }
    
    xs, ys = [], []
    dx = (xmax - xmin) / max(1, samples - 1)
    
    try:
        for i in range(samples):
            x = xmin + i * dx
            env["x"] = x
            
            safe_expr = expr.replace('^', '**').strip()
            y = float(eval(safe_expr, {"__builtins__": {}}, env))
            
            if math.isfinite(y):
                xs.append(round(x, 8))
                ys.append(round(y, 8))
    except Exception as e:
        return jsonify({"success": False, "error": f"Expression error: {str(e)}"}), 400
    
    if not xs:
        return jsonify({"success": False, "error": "No valid points to plot"}), 400
    
    return jsonify({"success": True, "xs": xs, "ys": ys})

@app.route('/api/game-rpm-convert', methods=['POST'])
def api_game_rpm_convert():
    """Convert RPM and firearm ROF units."""
    data = request.json
    conversion_type = data.get('conversion_type', 'RPM')
    from_unit = data.get('from_unit')
    value = float(data.get('value', 0))
    
    try:
        if conversion_type == 'RPM':
            rpm_units = {
                "RPM (Revolutions/Min)": 1.0,
                "RPS (Revolutions/Sec)": 60.0,
                "Hz (Cycles/Sec)": 60.0,
                "rad/s (Radians/Sec)": 60.0 / (2 * math.pi)
            }
        else:  # Firearm
            rpm_units = {
                "RPM (Rounds/Min)": 1.0,
                "RPS (Rounds/Sec)": 60.0,
                "RPH (Rounds/Hour)": 1.0 / 60.0
            }
        
        base_value = value / rpm_units[from_unit]
        results = {}
        
        for unit, factor in rpm_units.items():
            results[unit] = format_number(base_value * factor)
        
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/game-reload-stats', methods=['POST'])
def api_game_reload_stats():
    """Calculate reload statistics."""
    data = request.json
    mag_size = float(data.get('mag_size', 30))
    reload_time = float(data.get('reload_time', 2.5))
    rps = float(data.get('rps', 10))
    
    try:
        time_to_fire_mag = mag_size / rps
        total_cycle = reload_time + time_to_fire_mag
        dps = (mag_size * rps) / total_cycle
        
        results = {
            "Time to Fire Magazine": f"{time_to_fire_mag:.3f} seconds",
            "Reload Time": f"{reload_time:.3f} seconds",
            "Total Cycle Time": f"{total_cycle:.3f} seconds",
            "DPS (Magazine Cycle)": f"{dps:.2f} damage/sec"
        }
        
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/game-weapon-swap', methods=['POST'])
def api_game_weapon_swap():
    """Calculate weapon swap and rotation time."""
    data = request.json
    reload1 = float(data.get('reload1', 2.0))
    reload2 = float(data.get('reload2', 2.5))
    swap_time = float(data.get('swap_time', 0.7))
    
    try:
        sequence_time = reload1 + swap_time + reload2
        
        results = {
            "Weapon 1 Reload": f"{reload1:.3f} seconds",
            "Swap Time": f"{swap_time:.3f} seconds",
            "Weapon 2 Reload": f"{reload2:.3f} seconds",
            "Total Rotation Time": f"{sequence_time:.3f} seconds"
        }
        
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/game-dps', methods=['POST'])
def api_game_dps():
    """Calculate DPS with accuracy."""
    data = request.json
    damage = float(data.get('damage', 50))
    rpm = float(data.get('rpm', 600))
    mag_size = float(data.get('mag_size', 30))
    reload_time = float(data.get('reload_time', 2.0))
    accuracy = float(data.get('accuracy', 100)) / 100.0
    
    try:
        rps = rpm / 60.0
        time_to_mag = mag_size / rps
        total_cycle = time_to_mag + reload_time
        
        sustain_dps = (mag_size * damage * accuracy) / total_cycle
        burst_dps = mag_size * damage * accuracy * rps
        
        results = {
            "Burst DPS": f"{burst_dps:.2f} damage/sec",
            "Sustain DPS": f"{sustain_dps:.2f} damage/sec",
            "Magazine Damage": f"{mag_size * damage * accuracy:.0f} damage",
            "Fire Rate": f"{rps:.2f} rounds/sec"
        }
        
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/game-ttk', methods=['POST'])
def api_game_ttk():
    """Calculate Time To Kill."""
    data = request.json
    health = float(data.get('health', 100))
    damage = float(data.get('damage', 25))
    rpm = float(data.get('rpm', 600))
    headshot_mult = float(data.get('headshot_mult', 2.0))
    
    try:
        rps = rpm / 60.0
        
        shots_to_kill = math.ceil(health / damage)
        body_ttk = (shots_to_kill - 1) / rps
        
        headshot_damage = damage * headshot_mult
        shots_headshot = math.ceil(health / headshot_damage)
        headshot_ttk = (shots_headshot - 1) / rps if shots_headshot > 0 else 0
        
        results = {
            "Shots to Kill (Body)": f"{shots_to_kill} shots",
            "TTK (Body)": f"{body_ttk:.3f} seconds",
            "Shots to Kill (Headshot)": f"{shots_headshot} shots",
            "TTK (Headshot)": f"{headshot_ttk:.3f} seconds"
        }
        
        return jsonify({"success": True, "results": results})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "error": "Route not found"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"success": False, "error": "Server error"}), 500

if __name__ == '__main__':
    app.run(debug=True)
