================================================================================
                    CC APP - COMPREHENSIVE GUIDE
                 Unit Converter, Calculator & Game Tools
================================================================================

TABLE OF CONTENTS
================================================================================
1. Introduction & Overview
2. Current Features
3. Technical Architecture
4. User Guide
5. Developer Guide
6. Known Issues & Limitations
7. Planned Updates & Future Features
8. Performance Optimization Tips
9. Troubleshooting
10. Changelog

================================================================================
1. INTRODUCTION & OVERVIEW
================================================================================

CC App is a comprehensive web-based utility application designed to provide:
  - Fast unit conversions across multiple categories
  - Advanced mathematical calculations
  - Gaming-specific calculators (DPS, TTK, reload optimization)
  - Function graphing with auto-scaling
  - Persistent settings and history via localStorage
  - Dark/Light theme support
  - Responsive design for desktop and tablet use

TECHNOLOGY STACK:
  Backend:     Python 3.x + Flask
  Frontend:    HTML5 + CSS3 + Vanilla JavaScript
  Data:        localStorage API for client-side persistence
  Analytics:   Google Analytics (GA4)
  Deployment:  Compatible with any Python WSGI server

================================================================================
2. CURRENT FEATURES
================================================================================

2.1 STANDARD UNIT CONVERTER
────────────────────────────────────────────────────────────────────────────────
Categories Supported:
  • Length: meter, kilometer, centimeter, millimeter, inch, foot, yard, mile
  • Mass: kilogram, gram, milligram, metric ton, ounce, pound, stone
  • Time: second, minute, hour, day, week, year
  • Temperature: Celsius, Fahrenheit, Kelvin (with offset conversions)
  • Area: square meter, hectare, acre, square km, square foot, square inch
  • Volume: cubic meter, liter, milliliter, gallon, pint, quart, cup, barrel
  • Speed: m/s, km/h, mph, knot, ft/s

API Endpoints:
  POST /api/convert - Single unit conversion
  POST /api/convert-all - Convert to all units in category
  Payload: {category, from_unit, value}
  Response: {success, result/results}

2.2 MISCELLANEOUS CONVERTER
────────────────────────────────────────────────────────────────────────────────
Categories Supported:
  • Angle: degree ↔ radian conversion
  • Sound Intensity: W/m² ↔ dB logarithmic conversion
  • Power: watt, kilowatt, megawatt, horsepower
  • Pressure: pascal, bar, atmosphere, psi, torr, kilopascal
  • Data: bit, byte, kilobyte, megabyte, gigabyte, terabyte (binary & decimal)
  • Frequency: hertz, kilohertz, megahertz, gigahertz, terahertz
  • RPM: revolutions per minute, per second, hertz, radians per second
  • Firearm ROF: rounds per minute, per second, per hour

API Endpoints:
  POST /api/convert-misc - Convert misc units
  Payload: {category, from_unit, value}
  Response: {success, results}

Special Handling:
  - Sound Intensity uses logarithmic conversion (dB = 10 * log10(I/I0))
  - Angle supports both degree and radian with π precision
  - RPM handles both linear and angular velocity conversions

2.3 CALCULATOR
────────────────────────────────────────────────────────────────────────────────
Features:
  • Basic arithmetic: +, -, *, /
  • Power operator: ^ (converted to ** for Python eval)
  • Memory functions: M+, M-, MR, MC
  • Calculation history with timestamps
  • localStorage persistence
  • Keyboard support (0-9, operators, Enter to equals, C to clear)
  • Error handling with 1-second timeout recovery

Data Storage:
  - calcMemory: Current memory value
  - calcHistory: Array of {expr, result, timestamp}
  - Max history items: Unlimited (consider implementing cap at 1000)

API Endpoint:
  POST /api/calculate - Evaluate mathematical expression
  Payload: {expr}
  Response: {success, result}
  Note: Uses Python eval() with restricted __builtins__ for safety

2.4 GRAPHING CALCULATOR
────────────────────────────────────────────────────────────────────────────────
Features:
  • Plot functions: y = f(x)
  • 500-point sampling for smooth curves
  • Auto-scaling Y-axis option
  • Manual Y-axis range control
  • Grid lines (customizable via settings)
  • Responsive canvas scaling
  • Expression validation with error messages

Supported Functions:
  - Trigonometric: sin, cos, tan, asin, acos, atan
  - Logarithmic: log (base 10), ln (natural log)
  - Exponential: exp, sqrt, pow
  - Utility: abs, floor, ceil, round
  - Constants: pi, e
  - Operators: +, -, *, /, ^ (power)

API Endpoint:
  POST /api/graph-sample - Generate plot points
  Payload: {expr, xmin, xmax, samples}
  Response: {success, xs, ys}

Canvas Rendering:
  - Width/Height: Responsive to container
  - Margin: 50px on all sides
  - Grid: 10x10 divisions
  - Line Width: 2px (function), 0.5px (grid), 1px (axes)
  - Color scheme: Matches theme (dark/light)

2.5 GAME CALCULATOR
────────────────────────────────────────────────────────────────────────────────
Subsections:

a) RPM & ROF Converter
   - Standard RPM: RPM ↔ RPS ↔ Hz ↔ rad/s
   - Firearm ROF: RPM ↔ RPS ↔ RPH
   - Bidirectional conversions

b) Reload Time Calculator
   Inputs: Magazine Size, Reload Time (s), Rounds Per Second (RPS)
   Outputs:
     - Fire Rate (RPM, RPS)
     - Time to Empty Magazine
     - Time Per Shot
     - Full Cycle Time (Fire + Reload)
     - Sustained RPM (accounting for reload)

c) Weapon Swap & Rotation
   Inputs: Weapon 1 Reload Time, Weapon 2 Reload Time, Swap Time
   Outputs:
     - Sequential vs Simultaneous timing
     - Time Saved by Optimized Swap
     - Efficiency Gain (%)

d) DPS Calculator
   Inputs: Damage/Shot, Fire Rate (RPM), Magazine Size, Reload Time, Accuracy (%)
   Outputs:
     - Damage Per Magazine
     - DPS (no reload)
     - DPS (sustained with reload)
     - Bullets Per Second (Accurate)

e) TTK Calculator (Time To Kill)
   Inputs: Target Health, Damage/Shot, Fire Rate (RPM), Headshot Multiplier
   Outputs:
     - Body Shot TTK
     - Headshot TTK
     - Mixed TTK (1 HS + body shots)
     - Time Saved by Headshotting

2.6 SETTINGS & PREFERENCES
────────────────────────────────────────────────────────────────────────────────
Customizable Options:
  • Theme: Dark, Light, Auto (system preference)
  • Default Converter Category
  • Decimal Places for Display
  • Enable/Disable Features (Enter to Convert, History, Sounds)
  • Graph Resolution (Low/Medium/High)
  • Grid Lines Toggle

Data Management:
  • Export Settings: Download as JSON file
  • Import Settings: Upload JSON configuration
  • Clear History: Remove all calculation records
  • Reset All: Restore factory defaults

Storage Location: localStorage (domain-specific, ~5-10MB limit)

2.7 USER INTERFACE
────────────────────────────────────────────────────────────────────────────────
Design Philosophy:
  - Glassmorphism with backdrop blur effects
  - Gradient accents (blue-purple theme)
  - Responsive grid layouts
  - Smooth transitions and hover effects
  - Accessibility-focused color contrast

Components:
  - Navigation Header: Fixed with 8 main buttons
  - Page System: Single-page app with page swapping
  - Form Groups: Consistent styling with labels
  - Result Cards: Grid layout with hover effects
  - Calculator Grid: 4-column button layout
  - Graph Canvas: Responsive to container width

Breakpoints:
  - Mobile: < 768px (single-column layouts)
  - Tablet: 768px - 1024px (2-column layouts)
  - Desktop: > 1024px (3+ column layouts)

================================================================================
3. TECHNICAL ARCHITECTURE
================================================================================

3.1 BACKEND STRUCTURE
────────────────────────────────────────────────────────────────────────────────

File: app.py (Main Flask Application)

Key Components:

a) FACTORS Dictionary
   - Organized by category (LENGTH, MASS, TIME, AREA, VOLUME, SPEED, 
     PRESSURE, POWER, DATA)
   - Base unit: 1.0 (meter, kilogram, second, etc.)
   - Conversion factors: Relative to base unit
   - Example: "kilometer (km)": 1000 (1 km = 1000 m)

b) Conversion Functions
   - linear_convert(value, from_unit, to_unit, factors)
     Linear conversions: result = value * from_factor / to_factor
   
   - convert_temperature(from_unit, to_unit, value)
     Celsius as intermediate: from_unit → Celsius → to_unit
   
   - format_number(v)
     Smart formatting: handles scientific notation (>1e6, <1e-3)
     Strips trailing zeros and decimal points

c) Misc Conversion Functions
   - convert_misc_angle(from_unit, to_unit, value)
     degree ↔ radian via π/180
   
   - convert_misc_sound_intensity(from_unit, to_unit, value)
     Uses logarithmic reference I0 = 1e-12 W/m²
     dB = 10 * log10(I/I0)
   
   - convert_misc_frequency(from_unit, to_unit, value)
     Base: hertz. Factors: k^n where k=1000, n=1,2,3...
   
   - convert_misc_rpm(from_unit, to_unit, value)
     Bidirectional conversion with normalization
   
   - convert_firearm_rof(from_unit, to_unit, value)
     Specialized for firearm rate of fire

d) API Routes
   
   GET / → Render index.html
   
   POST /api/convert
     Input validation → Category lookup → Conversion → Format result
     Error handling: 400 response with error message
   
   POST /api/convert-all
     Single from_unit → Multiple to_units in category
     Response: Dictionary of {to_unit: formatted_result}
   
   POST /api/convert-misc
     Route to appropriate conversion function based on category
     Special handling for logarithmic conversions
   
   POST /api/calculate
     Expression parsing: ^ → **
     eval() with restricted namespace: only __builtins__ = {}
     Safe mathematical evaluation
   
   POST /api/graph-sample
     Generate x,y points for graphing
     Safe function compilation with Function constructor
     Skip invalid points (NaN, Infinity)
   
   404 Handler: Return JSON error
   500 Handler: Return JSON error

3.2 FRONTEND STRUCTURE
────────────────────────────────────────────────────────────────────────────────

File: static/script.js (Main JavaScript)

Organization (by section):

a) Page Navigation
   - showPage(pageId): Hide all, show one
   - goToX() helpers: Convenience functions for each page
   - window.scrollTo(0, 0): Scroll on page change

b) Settings Management
   - applyTheme(): Apply dark/light theme to body
   - resetSettings(): Confirm → Clear localStorage → Reload
   - localStorage hooks: theme, calcMemory, calcHistory

c) Converter Functions
   - updateUnits(): Populate unit dropdown from category
   - convertUnits(): Client-side or API call
   - convertTemperature(): Special handling for offset conversions
   - convertMisc(): Similar to convertUnits but for misc categories

d) Calculator Logic
   - calcInput(val): Append to display (with . and () validation)
   - calcScientific(func): Apply sin, cos, log, etc.
   - calcEquals(): eval() expression and format result
   - addToHistory(): Push to calcHistory array and persist
   - Memory functions: M+, M-, MR, MC
   - renderHistory(): Generate HTML from calcHistory array

e) Graphing Functions
   - graphPlot(): Validate inputs → Call /api/graph-sample → drawGraph()
   - _graph_sample(): Generate 500 points via eval()
   - _graph_autoscale(): Find Y bounds with 10% padding
   - _graph_draw(): Render canvas with grid, axes, plot line
   - toggleAutoY(): Enable/disable Y-range inputs

f) Game Calculator
   - convertGameRpm/Firearm(): Convert between game units
   - calculateReloadStats(): Compute cycle times and sustained RPM
   - calculateWeaponSwap(): Optimization analysis
   - calculateDPS(): Multi-factor damage per second
   - calculateTTK(): Time to eliminate target

g) Settings Export/Import
   - exportSettings(): Collect all settings → JSON → Download
   - importSettings(): File input → Parse JSON → Apply settings

3.3 FILE STRUCTURE
────────────────────────────────────────────────────────────────────────────────

/app.py                          Main Flask application
/templates/index.html            Single-page HTML template
/static/
  ├── script.js                  Main JavaScript (14KB, ~400 lines)
  └── style.css                  Main stylesheet (10KB, ~600 lines)

Optional Future Additions:
  /static/lib/                   Third-party libraries
  /config.py                     Environment-specific settings
  /requirements.txt              Python dependencies
  /.env                          Environment variables
  /tests/                        Unit and integration tests

================================================================================
4. USER GUIDE
================================================================================

4.1 GETTING STARTED
────────────────────────────────────────────────────────────────────────────────

Installation:
  1. Install Python 3.7+ and Flask
  2. Clone or download repository
  3. Install dependencies: pip install flask
  4. Run: python app.py
  5. Open browser: http://localhost:5000

First Use:
  1. Click "Home" to see feature overview
  2. Select desired tool from buttons
  3. All data is saved locally via browser storage

4.2 UNIT CONVERTER TUTORIAL
────────────────────────────────────────────────────────────────────────────────

Step-by-Step:
  1. Click "🔄 Unit Converter" or nav button
  2. Select Category (default: Length)
  3. Choose "From" unit (source unit)
  4. Enter numerical value
  5. Press "Convert" button or hit Enter
  6. View all results in grid below

Tips:
  - Supports decimal and exponential notation (e.g., 1.5, 1e-5)
  - Results auto-format: removes trailing zeros
  - Scientific notation for very large/small numbers (>1e6, <1e-3)
  - Temperature conversions maintain precision (2 decimal places)

Example Conversion:
  Category: Length
  From: kilometer (km)
  Value: 5
  Result: Displays 5 km in all length units
  - meter (m): 5000
  - mile (mi): 3.10686

4.3 CALCULATOR USAGE
────────────────────────────────────────────────────────────────────────────────

Basic Operations:
  - Click number buttons or use keyboard (0-9)
  - Click operator (+, -, *, ÷) or type
  - Power: Click ^ or type ^
  - Equals: Click = or press Enter
  - Clear: Click C or press ESC

Memory Functions (M+, M-, MR, MC):
  - M+: Add display value to memory
  - M-: Subtract display value from memory
  - MR: Recall memory value to display
  - MC: Clear memory (set to 0)
  - Memory Display: Shows current M value

History Features:
  - Auto-recorded after each calculation
  - Click any history item to recall result
  - "Clear History" button to reset
  - Persists across sessions (unless cleared)

Scientific Functions (Optional):
  - sin, cos, tan, asin, acos, atan
  - log (base 10), ln (natural log)
  - sqrt, exp, abs
  - Constants: π (pi), e

Keyboard Shortcuts:
  - Enter: Calculate
  - C: Clear display
  - Backspace: Delete last character (if implemented)

Example Calculation:
  Expression: 2 + 3 * 4 ^ 2
  Expected: 2 + 3 * 16 = 2 + 48 = 50

4.4 GRAPHING TUTORIAL
────────────────────────────────────────────────────────────────────────────────

Basic Graphing:
  1. Enter expression (default: sin(x))
  2. Set X-range (min/max)
  3. Choose Y-range: Auto or Manual
  4. Click "Plot" or press Enter
  5. View rendered graph with axes and grid

Expression Syntax:
  Supported: sin(x), cos(x), x^2, sqrt(x), etc.
  Invalid: [x], |x|, x! (use abs, not |, no factorial)
  Compound: sin(x) + cos(2*x), x^2 - 5*x + 6

Auto-Y Mode:
  - Calculates Y bounds from plotted points
  - Adds 10% padding for visualization
  - Useful when Y-range is unknown

Manual Y-Range:
  - Uncheck "Auto Y" to enable
  - Specify ymin and ymax
  - Useful for zooming/focusing

Common Functions to Plot:
  - Linear: y = 2*x + 1
  - Quadratic: y = x^2
  - Cubic: y = x^3 - 3*x
  - Sine: y = sin(x)
  - Exponential: y = exp(x)
  - Logarithmic: y = log(x)
  - Rational: y = 1/x (note: discontinuity at x=0)

Troubleshooting Graph Issues:
  - "Expression error": Check syntax (e.g., sin(x) not sin x)
  - "No valid points": Try different X-range
  - "Invalid x range": Ensure xmin < xmax
  - Discontinuities appear: Normal for functions like 1/x, tan(x)

4.5 GAME CALCULATOR GUIDE
────────────────────────────────────────────────────────────────────────────────

RPM Converter:
  Standard RPM:
    - Convert between rotational units
    - Example: 1200 RPM = 20 RPS = 20 Hz ≈ 75.4 rad/s
  
  Firearm ROF:
    - Convert between firing rate units
    - Rounds per Minute ↔ Rounds per Second ↔ Rounds per Hour

Reload Calculator:
  Inputs:
    - Magazine Size: How many rounds per magazine (typical: 10-100)
    - Reload Time: Time to swap magazines (typical: 1.5-3.0 seconds)
    - Rounds Per Second: Fire rate (typical: 5-20 RPS)
  
  Useful Metrics:
    - Full Cycle Time: Total time for one mag + reload
    - Sustained RPM: Real-world fire rate accounting for reloads
  
  Example: 30-round mag, 2.5s reload, 10 RPS
    - Time to empty: 3.0 seconds
    - Cycle time: 5.5 seconds
    - Sustained RPM: 327 rounds/min (vs. theoretical 600)

Weapon Swap Analysis:
  Inputs:
    - Two weapon reload times
    - Weapon swap time (draw/holster)
  
  Output: Time saved by swapping during reload
  
  Scenario: Weapon 1 (2s reload), Weapon 2 (2.5s), 0.7s swap
    - Sequential: 2 + 0.7 + 2.5 = 5.2s
    - Optimized: 2.5 + 0.7 = 3.2s (swap during longer reload)
    - Time saved: 2.0 seconds (38% efficiency gain)

DPS Calculator:
  Inputs:
    - Damage per shot (game-specific value)
    - Fire rate in RPM
    - Magazine size
    - Reload time
    - Accuracy percentage (0-100%)
  
  Key Metrics:
    - DPS (no reload): Theoretical damage per second
    - DPS (sustained): Real damage per second with reloads
    - Damage per magazine: Total magazine output
  
  Example: 50 DMG, 600 RPM, 30-round mag, 2s reload, 85% accuracy
    - Fire rate: 10 RPS
    - DPS (no reload): 425 DPS
    - DPS (sustained): 170 DPS (accounting for reload)

TTK Calculator (Time To Kill):
  Inputs:
    - Target health
    - Damage per shot
    - Fire rate (RPM)
    - Headshot multiplier (e.g., 1.5x, 2.0x)
  
  Outputs:
    - Body shot TTK: Time for all body shots
    - Headshot TTK: Time if all shots are headshots
    - Mixed TTK: One headshot + remaining body shots
    - Time saved by headshotting
  
  Example: 100 HP target, 25 DMG/shot, 600 RPM, 2.0x headshot
    - Fire rate: 10 RPS, 0.1s per shot
    - Body TTK: 0.4 seconds (5 shots)
    - Headshot TTK: 0.2 seconds (2 shots + partial)
    - Time saved: 0.2 seconds

4.6 MISC CONVERTER GUIDE
────────────────────────────────────────────────────────────────────────────────

Angle Conversion:
  - Degrees ↔ Radians
  - 180° = π radians
  - Example: 90° = π/2 ≈ 1.5708 rad

Sound Intensity:
  - W/m² (absolute): Energy flux
  - dB (relative): Logarithmic scale (reference = 1e-12 W/m²)
  - Formula: dB = 10 * log10(I / I0)
  - Note: Input must be positive for W/m²

Power Conversions:
  - Watt (SI unit)
  - 1 HP = 745.7 W
  - 1 kW = 1000 W
  - Used in: Electrical (circuits), Mechanical (engines), Thermal (heating)

Pressure Conversions:
  - Pascal (Pa): SI unit
  - 1 atm = 101,325 Pa ≈ 1 bar
  - 1 psi ≈ 6,895 Pa
  - Used in: Weather (atmospheres), Gauges (psi), Science (Pa)

Data Units:
  - Decimal (SI): 1 KB = 1000 bytes, 1 MB = 1000² bytes
  - Binary: 1 KiB = 1024 bytes, 1 MiB = 1024² bytes
  - Common mistake: Confusing MB (megabytes) with Mb (megabits)
  - Conversion: 1 byte = 8 bits

Frequency:
  - Base unit: Hertz (Hz)
  - 1 kHz = 1000 Hz
  - 1 MHz = 1,000,000 Hz
  - Used in: Audio (Hz), Radio (MHz/GHz), Light (THz)

4.7 SETTINGS MANAGEMENT
────────────────────────────────────────────────────────────────────────────────

Theme Selection:
  - Dark: Easier on eyes at night, default
  - Light: Better for bright environments
  - Auto: Respects system preference (OS settings)
  - Changes apply immediately to all elements

Export Settings:
  1. Click "⚙️ Settings"
  2. Scroll to "Data & Privacy"
  3. Click "📥 Export Settings"
  4. Save JSON file (backup)
  5. File: cc-app-settings.json

Import Settings:
  1. Click "⚙️ Settings"
  2. Click "📤 Import Settings"
  3. Select previously exported JSON
  4. All settings restored (except GUI feedback may take 1-2s)
  5. Settings persist after page reload

Calculator History Persistence:
  - Automatically saved after each calculation
  - Cleared only by explicit "Clear History" button
  - Exported with settings JSON

Reset All Settings:
  - Warning confirmation required
  - Clears localStorage completely
  - Resets theme to dark
  - Reloads page

================================================================================
5. DEVELOPER GUIDE
================================================================================

5.1 SETUP & DEPLOYMENT
────────────────────────────────────────────────────────────────────────────────

Local Development:
  1. Clone repository
  2. Install Python 3.7+
  3. Create virtual environment: python -m venv venv
  4. Activate: venv\Scripts\activate (Windows)
  5. Install: pip install flask
  6. Run: python app.py
  7. Access: http://localhost:5000

Production Deployment Options:

  a) Heroku (free tier may no longer be available)
     - Add Procfile: web: gunicorn app:app
     - Add requirements.txt
     - Deploy via git

  b) PythonAnywhere
     - Upload files via web interface
     - Configure WSGI
     - Set up custom domain

  c) AWS/Azure/GCP
     - Deploy to EC2, App Service, or Cloud Run
     - Use environment variables for config
     - Set up HTTPS with SSL

  d) Docker
     Dockerfile template:
     ```
     FROM python:3.9-slim
     WORKDIR /app
     COPY requirements.txt .
     RUN pip install -r requirements.txt
     COPY . .
     CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]
     ```

5.2 CODE STRUCTURE & CONVENTIONS
────────────────────────────────────────────────────────────────────────────────

Python (Backend):
  - Variables: snake_case (convert_temperature)
  - Constants: SCREAMING_SNAKE_CASE (FACTORS, MISC_UNITS)
  - Functions: Clear, single-purpose (convert_misc_angle)
  - Comments: Above functions explaining purpose and parameters
  - Error handling: Try-except with meaningful messages

JavaScript (Frontend):
  - Variables: camelCase (calcDisplay, graphState)
  - Constants: UPPER_CASE (conversionData, miscConversionData)
  - Functions: Clear, single-responsibility (showPage, convertUnits)
  - Organization: Group related functions with comments
  - Comments: Minimal, code should be self-documenting

CSS:
  - Colors: CSS custom properties (--primary, --bg, etc.)
  - Naming: BEM-like approach (btn-primary, calc-grid)
  - Responsive: Mobile-first with min-width media queries
  - Units: rem for sizing, px for borders

5.3 EXTENDING THE APPLICATION
────────────────────────────────────────────────────────────────────────────────

Adding a New Unit Category:

  Backend (Python):
  1. Add to FACTORS dictionary in app.py
     FACTORS["NEWCATEGORY"] = {
       "unit_name": conversion_factor_to_base,
       ...
     }

  2. Update /api/convert if needed (special handling)

  Frontend (JavaScript):
  1. Add to conversionData object
     'NewCategory': {
       'Unit Name': conversion_factor,
       ...
     }

  2. Update category dropdown in HTML (if using client-side)

  3. Optional: Add route in goToX() if new page needed

Adding a New Conversion Function:

  1. Create function: def convert_new_type(from_unit, to_unit, value)
  2. Handle edge cases (zero, negative, division by zero)
  3. Add to appropriate route (/api/convert-misc)
  4. Test with various inputs

Adding a New Game Calculator Feature:

  1. Create HTML section with form inputs
  2. Create JavaScript function: function calculateNewMetric()
  3. Populate results into results div
  4. Add to game calc page

Adding a New Setting:

  1. Add HTML control to Settings page
  2. Add localStorage getter/setter
  3. Apply setting in applyTheme() or other functions
  4. Include in export/import functions

5.4 API DOCUMENTATION
────────────────────────────────────────────────────────────────────────────────

POST /api/convert
  Description: Convert single unit
  Request:
  {
    "category": "Length",
    "from_unit": "meter (m)",
    "to_unit": "foot (ft)",
    "value": 10
  }
  Response (Success):
  {
    "success": true,
    "result": "32.8084"
  }
  Response (Error):
  {
    "success": false,
    "error": "Invalid category"
  }
  Status Code: 200 (success) or 400 (error)

POST /api/convert-all
  Description: Convert to all units in category
  Request:
  {
    "category": "Length",
    "from_unit": "meter (m)",
    "value": 1
  }
  Response (Success):
  {
    "success": true,
    "results": {
      "meter (m)": "1",
      "kilometer (km)": "0.001",
      "foot (ft)": "3.28084",
      ...
    }
  }
  Status Code: 200 or 400

POST /api/convert-misc
  Description: Miscellaneous conversions
  Request:
  {
    "category": "Angle",
    "from_unit": "degree (°)",
    "value": 90
  }
  Response (Success):
  {
    "success": true,
    "results": {
      "degree (°)": "90",
      "radian (rad)": "1.5708"
    }
  }
  Status Code: 200 or 400

POST /api/calculate
  Description: Evaluate mathematical expression
  Request:
  {
    "expr": "2 + 3 * 4"
  }
  Response (Success):
  {
    "success": true,
    "result": "14"
  }
  Response (Error):
  {
    "success": false,
    "error": "invalid syntax"
  }
  Note: Uses Python eval() - sanitized for safety
  Status Code: 200 or 400

POST /api/graph-sample
  Description: Generate points for graphing
  Request:
  {
    "expr": "sin(x)",
    "xmin": -10,
    "xmax": 10,
    "samples": 600
  }
  Response (Success):
  {
    "success": true,
    "xs": [-10, -9.96..., 10],
    "ys": [0.544..., 0.509..., -0.544...]
  }
  Response (Error):
  {
    "success": false,
    "error": "Expression error: ..."
  }
  Status Code: 200 or 400

5.5 TESTING & QUALITY ASSURANCE
────────────────────────────────────────────────────────────────────────────────

Unit Tests (Recommended):
  - Test each conversion function with known values
  - Test edge cases: zero, negative, very large/small numbers
  - Test error conditions: invalid input, division by zero

Example Test (Python):
  def test_length_conversion():
    assert linear_convert(1, "meter (m)", "kilometer (km)", FACTORS["LENGTH"]) == 0.001
    assert linear_convert(1000, "meter (m)", "kilometer (km)", FACTORS["LENGTH"]) == 1
    assert linear_convert(1, "foot (ft)", "meter (m)", FACTORS["LENGTH"]) ≈ 0.3048

Integration Tests:
  - Test API endpoints with curl or Postman
  - Test form submissions and responses
  - Test localStorage persistence

Browser Testing:
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)
  - Mobile browsers (Chrome Android, Safari iOS)

Performance Testing:
  - Graph rendering with 1000+ samples
  - Calculator with long expression strings
  - Large history arrays (1000+ items)
  - Settings export/import with large JSON

Accessibility Testing:
  - Color contrast (WCAG AA minimum)
  - Keyboard navigation (Tab, Enter, Escape)
  - Screen reader compatibility

5.6 DEBUGGING & TROUBLESHOOTING
────────────────────────────────────────────────────────────────────────────────

Browser Console Errors:
  1. Open DevTools (F12)
  2. Check Console tab for errors
  3. Common issues:
     - CORS errors: Check API endpoints
     - localStorage errors: Check browser storage limits
     - eval() errors: Check expression syntax

Backend Debugging:
  1. Enable Flask debug mode: app.run(debug=True)
  2. Watch terminal for errors
  3. Use print() statements
  4. Set up logging: logging.basicConfig(level=DEBUG)

Performance Issues:
  - Graph stuttering: Reduce samples (POST to /api/graph-sample)
  - Slow conversions: Check FACTORS dictionary size
  - Memory leaks: Monitor calcHistory growth

Network Issues:
  - API timeouts: Increase timeout in fetch() calls
  - Failed requests: Check network tab in DevTools
  - CORS errors: Configure Flask CORS headers if needed

================================================================================
6. KNOWN ISSUES & LIMITATIONS
================================================================================

6.1 CURRENT LIMITATIONS
────────────────────────────────────────────────────────────────────────────────

Calculation Precision:
  - JavaScript floating-point rounding errors
  - Example: 0.1 + 0.2 ≠ 0.3 (known JavaScript issue)
  - Workaround: Round to 6-8 decimal places for display

Graph Discontinuities:
  - Functions with asymptotes (tan, 1/x) show visual artifacts
  - No automatic detection of discontinuities
  - Workaround: Manual X-range adjustment

Historical Data:
  - localStorage limit: ~5-10MB per domain
  - No automatic cleanup of old entries
  - Large history arrays may slow down exports

Temperature Conversion:
  - Only supports three scales (Celsius, Fahrenheit, Kelvin)
  - Rankine scale not included

Mobile Experience:
  - Some features cramped on small screens
  - Touch-friendly buttons need larger hit targets
  - Calculator might be difficult on very small screens

API Security:
  - Uses eval() which could be exploited (mitigated by restricted namespace)
  - No authentication or rate limiting
  - No input sanitization for malicious expressions

6.2 KNOWN BUGS (IF ANY)
────────────────────────────────────────────────────────────────────────────────

(To be populated as bugs are discovered)

Example Format:
  Bug: Graph doesn't clear on rapid plot requests
  Severity: Low
  Workaround: Click "Clear" manually
  Status: Open / In Progress / Fixed (version X.X.X)

6.3 BROWSER COMPATIBILITY
────────────────────────────────────────────────────────────────────────────────

Supported:
  ✓ Chrome 90+
  ✓ Firefox 88+
  ✓ Safari 14+
  ✓ Edge 90+
  ✓ Chrome Mobile (Android)
  ✓ Safari (iOS 14+)

Partially Supported:
  ~ IE 11 (no CSS Grid, limited backdrop-filter)

Not Supported:
  ✗ IE 10 and below
  ✗ Ancient mobile browsers

Features with Compatibility Issues:
  - backdrop-filter: Fallback to solid background on unsupported browsers
  - CSS Grid: Fallback to flexbox (manual breakpoints)
  - localStorage: Disabled in private/incognito mode

================================================================================
7. PLANNED UPDATES & FUTURE FEATURES
================================================================================

7.1 SHORT-TERM UPDATES (1-3 MONTHS)
────────────────────────────────────────────────────────────────────────────────

HIGH PRIORITY:

1. Enhanced Error Handling
   - Better user feedback for invalid inputs
   - Server-side input validation
   - Rate limiting to prevent abuse
   - Request/response timeouts

2. Mobile Optimization
   - Swipe gestures for page navigation
   - Touch-friendly button sizing (min 44x44px)
   - Responsive layout refinements
   - Mobile-specific calculator layout

3. History Limit Implementation
   - Cap calcHistory at 1000 items (FIFO)
   - Prevent localStorage bloat
   - Add option to auto-cleanup old entries

4. Unit Standardization
   - Use server-side FACTORS dictionary for all conversions
   - Remove duplicate data in JavaScript
   - Single source of truth

5. Keyboard Shortcuts
   - Backspace to delete in calculator
   - Ctrl+C to copy results
   - Ctrl+V to paste values
   - Quick keys to switch pages (Alt+C for calculator, etc.)

MEDIUM PRIORITY:

6. Additional Unit Categories
   - Density: kg/m³, g/cm³, lb/ft³
   - Energy: Joule, calorie, Wh, BTU
   - Torque: N·m, ft·lb
   - Viscosity: Pa·s, cP
   - Temperature Difference (not absolute)

7. Advanced Calculator Features
   - Trigonometric angle input mode (degrees vs radians)
   - Percentage calculations
   - Factorial function (n!)
   - Combinations and permutations (nCr, nPr)
   - Degree/Radian converter in calculator

8. Enhanced Graphing
   - Multiple functions on single graph (y1, y2, etc.)
   - Color-coded function lines
   - Polar coordinates support
   - Parametric equations (x(t), y(t))
   - Interactive graph (click to evaluate)

9. Unit Favorites/Presets
   - Save frequently used conversion pairs
   - Quick-access conversion templates
   - Custom unit conversions
   - Conversion history with quick-replay

10. Improved UI/UX
    - Dark mode refinements (true black for OLED)
    - Animation polish and micro-interactions
    - Accessibility improvements (ARIA labels)
    - High contrast mode option

7.2 MEDIUM-TERM FEATURES (3-6 MONTHS)
────────────────────────────────────────────────────────────────────────────────

HIGH PRIORITY:

11. Advanced Game Calculator
    - Armor/Mitigation calculations
    - Crit/Headshot probability weighting
    - Burst vs sustained comparison
    - Multiple enemy DPS (combined)
    - Weapon damage falloff (distance-based)
    - TTK against moving targets (prediction)

12. Scientific Calculator Mode
    - Matrix operations (determinant, inverse)
    - Complex number support
    - Statistical functions (mean, median, std dev)
    - Differentiation/Integration approximation
    - Unit-aware calculations

13. Offline Support
    - Service Worker for offline functionality
    - Cached static assets
    - Sync data when online
    - Works in airplane mode

14. User Accounts (Optional)
    - Cloud sync of settings and history
    - Share conversion templates
    - Cross-device synchronization
    - Privacy-first approach (no ads)

15. Export Features
    - Export results as CSV
    - Export graphs as PNG/SVG
    - Batch conversions from file
    - Print-friendly layouts

MEDIUM PRIORITY:

16. Data Visualization Improvements
    - 3D graphing (x, y, z)
    - Heatmaps for data distributions
    - Interactive legends
    - Logarithmic axis support
    - Graph annotations

17. Currency Converter
    - Real-time exchange rates (API)
    - Multiple currency bases
    - Historical exchange rates
    - Crypto support

18. Chemistry Calculator
    - Molar mass calculations
    - Stoichiometry
    - pH/pOH conversions
    - Atomic mass unit conversions

19. Cooking/Recipe Tools
    - Ingredient unit conversions
    - Scaling recipes
    - Nutrition calculator
    - Common cooking measurements

20. Code Integration
    - JavaScript/Python code generation
    - Copy formula as code
    - LaTeX export for academic use

7.3 LONG-TERM ROADMAP (6+ MONTHS)
────────────────────────────────────────────────────────────────────────────────

VISION:

21. AI-Assisted Calculations
    - Natural language input ("convert 5 miles to kilometers")
    - Smart unit detection from text
    - Handwriting recognition (mobile)
    - Voice input for calculations
    - Voice feedback for results

22. Personalized Learning Mode
    - Tutorial walkthroughs
    - Unit system explanations
    - Interactive lessons
    - Progress tracking
    - Gamification elements

23. Mobile Apps
    - Native iOS app (React Native or Swift)
    - Native Android app (React Native or Kotlin)
    - Offline-first architecture
    - Widget support (quick conversions)

24. Integration & APIs
    - Webhooks for integration with other apps
    - JSON API with authentication
    - Zapier/IFTTT integration
    - Spreadsheet plugin (Google Sheets, Excel)

25. Real-Time Collaboration
    - Shared conversion sessions
    - Live graphing collaboration
    - Comments and annotations
    - Shared favorites

26. Advanced Analytics
    - Usage statistics dashboard
    - Most-used conversions
    - Performance metrics
    - Suggestions for optimization

27. Specialized Tools
    - Medicine/Pharmacy dosing calculator
    - Astronomy calculations
    - Projectile motion simulator
    - Electrical engineering tools
    - Structural engineering tools

28. Machine Learning Features
    - Predict unit based on usage history
    - Recommend relevant conversions
    - Anomaly detection (impossible conversions)
    - Pattern recognition for complex calculations

================================================================================
8. PERFORMANCE OPTIMIZATION TIPS
================================================================================

8.1 FRONTEND OPTIMIZATION
────────────────────────────────────────────────────────────────────────────────

JavaScript:
  1. Lazy load data (only convert when needed)
  2. Cache FACTORS if downloaded from server
  3. Debounce convertUnits on input (wait 300ms)
  4. Use Web Workers for heavy graph calculations
  5. Minimize JSON size (compress keys, values)
  6. Use typed arrays for large numerical data

CSS:
  1. Minimize use of transforms (use will-change: transform)
  2. Reduce repaints: avoid width/height animations
  3. Lazy load stylesheets for features not on homepage
  4. Minify CSS for production
  5. Use critical inline CSS for above-fold content

HTML:
  1. Defer non-critical scripts
  2. Async load third-party scripts (analytics)
  3. Minimize DOM nodes (don't render all results at once)
  4. Use data attributes instead of inline styles

Assets:
  1. Gzip compression on server
  2. Image optimization (SVG for icons, WebP for images)
  3. Minify JavaScript and CSS
  4. Bundle related code

localStorage:
  1. Compress data before storing (JSON.stringify is verbose)
  2. Set size limits (cap history at 1000 items)
  3. Clear old entries periodically
  4. Monitor usage with navigator.storage

8.2 BACKEND OPTIMIZATION
────────────────────────────────────────────────────────────────────────────────

Python/Flask:
  1. Use gunicorn or uWSGI in production (not Flask dev server)
  2. Enable caching headers on static files
  3. Minify JSON responses
  4. Use connection pooling if querying databases
  5. Cache conversion factors in memory (dict lookup is fast)

API Response Time:
  1. Most conversions: < 10ms
  2. Graph sampling: < 500ms
  3. Target all responses: < 1000ms

Database Considerations:
  If adding features like user accounts:
  1. Index frequently queried fields
  2. Use connection pooling (SQLAlchemy)
  3. Implement query caching
  4. Archive old history data

8.3 MONITORING & METRICS
────────────────────────────────────────────────────────────────────────────────

Metrics to Track:
  1. API response time (histogram)
  2. Graph render time (p50, p95, p99)
  3. Page load time (total, FCP, LCP)
  4. JavaScript error rate
  5. localStorage usage
  6. User actions per session

Tools:
  - Google Analytics for user analytics
  - Sentry for error tracking
  - Lighthouse for performance audits
  - WebPageTest for detailed analysis

================================================================================
9. TROUBLESHOOTING
================================================================================

9.1 COMMON USER ISSUES
────────────────────────────────────────────────────────────────────────────────

Issue: "Conversion not working"
  Solution:
  - Refresh page (F5)
  - Check internet connection
  - Clear browser cache (Ctrl+Shift+Delete)
  - Try different browser
  - Check console for errors (F12)

Issue: "Settings not saving"
  Solution:
  - Check if localStorage is enabled
  - Not in private/incognito mode
  - Check browser storage quota (Settings > Storage)
  - Try export/import functionality

Issue: "Graph shows no points"
  Solution:
  - Check expression syntax (e.g., sin(x) not sin x)
  - Verify X-range is valid (min < max)
  - Try simpler function first (e.g., x^2)
  - Check console for specific error message

Issue: "Calculator showing NaN or Infinity"
  Solution:
  - Expression syntax error
  - Division by zero (e.g., 5/0)
  - Invalid operation (e.g., sqrt(-1))
  - Try clearing display with C button

Issue: "Page elements not aligned properly (mobile)"
  Solution:
  - Rotate phone to landscape
  - Clear browser cache
  - Try different browser
  - Report as bug if persists

9.2 COMMON DEVELOPER ISSUES
────────────────────────────────────────────────────────────────────────────────

Issue: "Flask app won't start"
  Solution:
  - Check Python 3.7+ installed
  - Check Flask installed (pip install flask)
  - Check port 5000 not in use (netstat -tuln)
  - Check app.py in correct directory
  - Run: python app.py from project root

Issue: "API endpoint returning 404"
  Solution:
  - Check Flask route definition matches URL
  - Check request method (GET vs POST)
  - Check URL spelling
  - Check app.py has latest code

Issue: "JavaScript errors in console"
  Solution:
  - Check static/ files paths are correct
  - Check browser DevTools shows files as 200 (not 404)
  - Check Flask config: url_for() references
  - Use source maps for debugging minified code

Issue: "CORS errors when fetching API"
  Solution:
  - API on same domain as frontend (no CORS needed)
  - If different domain, add to app.py:
    from flask_cors import CORS
    CORS(app)
  - Or add manual CORS headers in routes

Issue: "localStorage not working"
  Solution:
  - Check not in private/incognito mode
  - Check localStorage not full
  - Check localStorage API available (check console)
  - Try clearing browser data

9.3 PERFORMANCE TROUBLESHOOTING
────────────────────────────────────────────────────────────────────────────────

Issue: "Graph rendering slowly"
  Problem: 1000+ points causing lag
  Solution:
  - Reduce samples parameter (POST to /api/graph-sample)
  - Use Web Worker for calculations
  - Profile with Chrome DevTools (Performance tab)
  - Optimize _graph_draw() rendering loop

Issue: "Calculator history growing too large"
  Problem: App slowing down after many calculations
  Solution:
  - Implement history limit (1000 items)
  - Auto-cleanup old entries
  - Use database instead of array for large histories
  - Compress history before storing

Issue: "API responses slow"
  Problem: >1000ms response time
  Solution:
  - Profile with Flask debug toolbar
  - Check /api/graph-sample samples parameter
  - Cache FACTORS dictionary (avoid repeated parsing)
  - Use production server (gunicorn, not Flask dev)
  - Check server CPU/memory usage

================================================================================
10. CHANGELOG
================================================================================

VERSION HISTORY:

v1.0.0 (Initial Release)
  - Unit Converter (7 categories)
  - Basic Calculator
  - Misc Converter (6 categories)
  - Graphing Calculator
  - Game Calculator (5 tools)
  - Settings with theme
  - localStorage persistence
  - Dark/Light theme support
  - Responsive design

v1.1.0 (Planned)
  - Mobile optimization
  - Enhanced error messages
  - Keyboard shortcuts
  - Additional unit categories
  - History limit (1000 items)
  - Backspace support in calculator

v1.2.0 (Planned)
  - Favorites/Presets
  - Enhanced graphing
  - Scientific calculator mode
  - More gaming features
  - Accessibility improvements

v2.0.0 (Planned)
  - Offline support (PWA)
  - User accounts (optional)
  - Cloud sync
  - Mobile apps
  - Advanced AI features

================================================================================
11. CONCLUSION & SUPPORT
================================================================================

CC App is designed to be:
  ✓ Fast: Most operations < 100ms
  ✓ Accurate: High-precision conversions
  ✓ Accessible: Works offline, persists data
  ✓ Extensible: Easy to add new features
  ✓ User-friendly: Intuitive interface

For Support:
  - Check TROUBLESHOOTING section
  - Review API documentation
  - Inspect browser console (F12)
  - Check GitHub issues (if applicable)

For Feature Requests:
  - See PLANNED UPDATES section
  - Follow contribution guidelines
  - Discuss in issues/discussions

For Bug Reports:
  - Provide browser and version
  - Include console error messages
  - Describe steps to reproduce
  - Include screenshots if possible

================================================================================
END OF GUIDE
================================================================================

Last Updated: 2024
Document Version: 1.0
Maintained By: Development Team
License: [Add appropriate license]

================================================================================
