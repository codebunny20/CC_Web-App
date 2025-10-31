import customtkinter as ctk
import tkinter as tk  # added
import math           # added
import os, json       # NEW

class ConverterApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        # NEW: load persisted settings and apply before building UI
        self._settings_file = os.path.join(os.path.dirname(__file__), "cc_app_settings.json")
        # NEW: extended defaults
        self._settings = {
            "appearance": "System",
            "scaling": 1.0,
            "theme": "blue",                         # NEW
            "start_page": "Home",                    # NEW
            "enter_to_convert": True,                # NEW
            "remember_last_category": True,          # NEW
            "default_category_main": "Length",       # NEW
            "default_category_misc": "Angle"         # NEW
        }
        self._load_settings()
        try:
            # NEW: apply theme before building UI
            ctk.set_default_color_theme(self._settings.get("theme", "blue"))
            ctk.set_appearance_mode(self._settings.get("appearance", "System"))
            ctk.set_widget_scaling(float(self._settings.get("scaling", 1.0)))
        except Exception:
            pass
        self.title("Unit Converter")
        self.geometry("500x600")
        
        # REPLACED: Initialize selected start page (not always Home)
        self._show_start_page()

    def _show_start_page(self):
        page = self._settings.get("start_page", "Home")
        if page == "Converter":
            self.init_converter_page()
        elif page == "Calculator":
            self.init_calculator_page()
        elif page == "Misc":
            self.init_misc_converter_page()
        elif page == "Settings":
            self.init_settings_page()
        elif page == "About":
            self.init_about_page()
        else:
            self.init_home_page()
    
    def init_home_page(self):
        self.home_frame = ctk.CTkFrame(self)
        self.home_frame.pack(expand=True, fill="both")
        
        self.home_label = ctk.CTkLabel(self.home_frame, text="Welcome to the CC App", font=("Arial", 24))
        self.home_label.pack(pady=20)

        # Intro text below the title, left-aligned and wrapped
        self.home_intro_label = ctk.CTkLabel(
            self.home_frame,
            text="Convert units and calculate fast. Use Unit Converter to convert Length, Mass, Time, Temperature, Area, Volume, and Speed. The Calculator handles quick arithmetic. Choose a tool below to get started.",
            justify="left",
            anchor="w"
        )
        self.home_intro_label.pack(fill="x", padx=12, pady=(0, 12))

        # REPLACED: button row with a responsive grid container
        self.home_buttons_frame = ctk.CTkFrame(self.home_frame)
        self.home_buttons_frame.pack(padx=12, pady=10, fill="x")

        # Create buttons (no pack/grid yet)
        btns = [
            ("Unit Converter", self.show_converter_page),
            ("Calculator", self.show_calculator_page),
            ("Misc Converter", self.show_misc_converter_page),
            ("Settings", self.show_settings_page),
            ("About", self.show_about_page),
        ]
        self._home_buttons = []
        for text, cmd in btns:
            b = ctk.CTkButton(self.home_buttons_frame, text=text, command=cmd)
            self._home_buttons.append(b)

        # Initial layout + responsive relayout
        self._layout_home_buttons()
        self.home_buttons_frame.bind("<Configure>", lambda e: self._layout_home_buttons(e.width))

        # Update wraplength for the intro label on resize
        self.home_frame.bind(
            "<Configure>",
            lambda e: self.home_intro_label.configure(wraplength=max(e.width - 24, 240))
        )
    
    # NEW: Responsive layout for Home buttons
    def _layout_home_buttons(self, width=None):
        if not hasattr(self, "_home_buttons") or not self._home_buttons:
            return
        # Clear current grid
        for w in self._home_buttons:
            try:
                w.grid_forget()
            except Exception:
                pass
        if width is None or width <= 1:
            width = max(self.home_buttons_frame.winfo_width(), 360)

        # Decide columns based on available width (1..3 columns)
        min_cell = 160  # min width per button cell
        cols = max(1, min(3, int(width // min_cell)))

        # Configure columns to expand evenly
        for c in range(cols):
            self.home_buttons_frame.grid_columnconfigure(c, weight=1, uniform="home")
        # Place buttons
        for i, btn in enumerate(self._home_buttons):
            r, c = divmod(i, cols)
            btn.grid(row=r, column=c, padx=6, pady=6, sticky="ew")
    
    def show_converter_page(self):
        self.home_frame.pack_forget()
        self.init_converter_page()
    
    def show_calculator_page(self):
        self.home_frame.pack_forget()
        self.init_calculator_page()

    # NEW: Open Misc Converter page
    def show_misc_converter_page(self):
        self.home_frame.pack_forget()
        self.init_misc_converter_page()

    # NEW: Open Settings page
    def show_settings_page(self):
        self.home_frame.pack_forget()
        self.init_settings_page()

    # NEW: Open About page
    def show_about_page(self):
        self.home_frame.pack_forget()
        self.init_about_page()
    
    def init_converter_page(self):
        self.tabview = ctk.CTkTabview(self)
        self.tabview.pack(expand=True, fill="both")
        
        self.converter_tab = self.tabview.add("Unit Converter")
        self.init_converter_tab()
    
    def init_calculator_page(self):
        self.tabview = ctk.CTkTabview(self)
        self.tabview.pack(expand=True, fill="both")
        
        self.calculator_tab = self.tabview.add("Calculator")
        self.init_calculator_tab()
        # NEW: Programmer tab
        self.programmer_tab = self.tabview.add("Programmer")
        self.init_programmer_tab()
        # NEW: Graphing tab
        self.graphing_tab = self.tabview.add("Graphing")
        self.init_graphing_tab()
        
        # NEW: Bottom bar below the tabs so tabs remain visible
        if hasattr(self, "calc_bottom_bar") and self.calc_bottom_bar.winfo_exists():
            self.calc_bottom_bar.destroy()
        self.calc_bottom_bar = ctk.CTkFrame(self)
        self.calc_bottom_bar.pack(side="bottom", fill="x")
        self.back_button = ctk.CTkButton(self.calc_bottom_bar, text="Back", command=self.go_to_home_page)
        self.back_button.pack(side="left", padx=10, pady=8)

    # NEW: Setup Misc Converter page
    def init_misc_converter_page(self):
        self.tabview = ctk.CTkTabview(self)
        self.tabview.pack(expand=True, fill="both")
        self.misc_tab = self.tabview.add("Misc Converter")
        self.init_misc_tab()

    # NEW: Setup Settings page
    def init_settings_page(self):
        self.tabview = ctk.CTkTabview(self)
        self.tabview.pack(expand=True, fill="both")
        self.settings_tab = self.tabview.add("Settings")
        self.init_settings_tab()

    # NEW: Setup About page
    def init_about_page(self):
        self.tabview = ctk.CTkTabview(self)
        self.tabview.pack(expand=True, fill="both")
        self.about_tab = self.tabview.add("About")
        self.init_about_tab()

    # NEW: Misc Converter tab content
    def init_misc_tab(self):
        # Use same layout as the Unit Converter
        content = ctk.CTkScrollableFrame(self.misc_tab)
        content.pack(expand=True, fill="both", padx=10, pady=10)

        self.misc_info_label = ctk.CTkLabel(
            content,
            text="Misc Converter: choose a category, enter a value, and see all results.",
            justify="left",
            anchor="w"
        )
        self.misc_info_label.grid(row=0, column=0, columnspan=2, padx=6, pady=(0, 10), sticky="ew")
        content.bind("<Configure>", lambda e: self.misc_info_label.configure(wraplength=max(e.width - 24, 240)))

        content.grid_columnconfigure(0, weight=0)
        content.grid_columnconfigure(1, weight=1)

        # Category
        self.misc_category_label = ctk.CTkLabel(content, text="Select Category:")
        self.misc_category_label.grid(row=1, column=0, padx=6, pady=6, sticky="w")
        # CHANGED: default from settings
        self.misc_category_var = ctk.StringVar(value=self._settings.get("default_category_misc", "Angle"))
        self.misc_category_dropdown = ctk.CTkOptionMenu(
            content,
            variable=self.misc_category_var,
            values=["Angle", "Sound Intensity", "Power", "Pressure", "Data", "Frequency"],
            command=self.update_misc_units
        )
        self.misc_category_dropdown.grid(row=1, column=1, padx=6, pady=6, sticky="ew")

        # From unit
        self.misc_unit_from_label = ctk.CTkLabel(content, text="From Unit:")
        self.misc_unit_from_label.grid(row=2, column=0, padx=6, pady=6, sticky="w")
        self.misc_unit_from_var = ctk.StringVar(value="")
        self.misc_unit_from_dropdown = ctk.CTkOptionMenu(content, variable=self.misc_unit_from_var, values=[])
        self.misc_unit_from_dropdown.grid(row=2, column=1, padx=6, pady=6, sticky="ew")

        # Input
        self.misc_input_label = ctk.CTkLabel(content, text="Enter Value:")
        self.misc_input_label.grid(row=3, column=0, padx=6, pady=6, sticky="w")
        self.misc_input_entry = ctk.CTkEntry(content)
        self.misc_input_entry.grid(row=3, column=1, padx=6, pady=6, sticky="ew")
        # CHANGED: Enter binding based on settings
        if self._settings.get("enter_to_convert", True):
            self.misc_input_entry.bind("<Return>", lambda e: self.convert_misc())
            self.misc_tab.bind("<Return>", lambda e: self.convert_misc())

        # All results
        self.misc_all_results_label = ctk.CTkLabel(content, text="All Results:")
        self.misc_all_results_label.grid(row=4, column=0, padx=6, pady=(12, 6), sticky="w")
        self.misc_results_frame = ctk.CTkScrollableFrame(content, height=240)
        self.misc_results_frame.grid(row=5, column=0, columnspan=2, padx=6, pady=(0, 6), sticky="nsew")
        content.grid_rowconfigure(5, weight=1)

        # Bottom bar
        bottom_bar = ctk.CTkFrame(self.misc_tab)
        bottom_bar.pack(side="bottom", fill="x")
        ctk.CTkButton(bottom_bar, text="Back", command=self.go_to_home_page).pack(side="left", padx=10, pady=10)
        ctk.CTkButton(bottom_bar, text="Convert", command=self.convert_misc).pack(side="right", padx=10, pady=10)

        # Data and defaults
        self._misc_I0 = 1e-12  # reference intensity (W/m²) for dB conversions
        self.misc_units = {
            "Angle": ["degree (°)", "radian (rad)"],
            "Sound Intensity": ["intensity (W/m²)", "level (dB)"],
            "Power": ["watt (W)", "kilowatt (kW)", "megawatt (MW)", "horsepower (hp)"],
            "Pressure": ["pascal (Pa)", "kilopascal (kPa)", "bar", "atmosphere (atm)", "torr (Torr)", "pound per square inch (psi)"],
        }
        # Add Data units (decimal SI and binary IEC)
        self.misc_units["Data"] = [
            "bit (b)", "byte (B)",
            "kilobit (kb)", "kilobyte (kB)",
            "megabit (Mb)", "megabyte (MB)",
            "gigabit (Gb)", "gigabyte (GB)",
            "terabit (Tb)", "terabyte (TB)",
            "kibibit (Kib)", "kibibyte (KiB)",
            "mebibit (Mib)", "mebibyte (MiB)",
            "gibibit (Gib)", "gibibyte (GiB)",
            "tebibit (Tib)", "tebibyte (TiB)"
        ]
        # Add Frequency units
        self.misc_units["Frequency"] = [
            "hertz (Hz)", "kilohertz (kHz)", "megahertz (MHz)", "gigahertz (GHz)", "terahertz (THz)"
        ]
        self.update_misc_units(self.misc_category_var.get())

    # NEW: Settings tab content
    def init_settings_tab(self):
        content = ctk.CTkScrollableFrame(self.settings_tab)
        content.pack(expand=True, fill="both", padx=10, pady=10)

        info = ctk.CTkLabel(
            content,
            text="Settings: change appearance, theme, scaling, start page, Enter-to-convert, and defaults.",
            justify="left",
            anchor="w"
        )
        info.grid(row=0, column=0, columnspan=2, padx=6, pady=(0, 10), sticky="ew")
        content.bind("<Configure>", lambda e: info.configure(wraplength=max(e.width - 24, 240)))

        content.grid_columnconfigure(0, weight=0)
        content.grid_columnconfigure(1, weight=1)

        # Appearance mode
        ctk.CTkLabel(content, text="Appearance:").grid(row=1, column=0, padx=6, pady=6, sticky="w")
        self.appearance_var = ctk.StringVar(value=self._settings.get("appearance", "System"))  # CHANGED default
        app_menu = ctk.CTkOptionMenu(
            content,
            values=["System", "Light", "Dark"],
            variable=self.appearance_var,
            command=self._apply_appearance
        )
        app_menu.grid(row=1, column=1, padx=6, pady=6, sticky="ew")

        # UI Scaling
        ctk.CTkLabel(content, text="UI Scaling:").grid(row=2, column=0, padx=6, pady=6, sticky="w")
        current_scale_label = f"{int(round(float(self._settings.get('scaling', 1.0)) * 100))}%"
        self.scaling_var = ctk.StringVar(value=current_scale_label)  # CHANGED default
        scale_menu = ctk.CTkOptionMenu(
            content,
            values=["80%", "90%", "100%", "110%", "120%"],
            variable=self.scaling_var,
            command=self._apply_scaling
        )
        scale_menu.grid(row=2, column=1, padx=6, pady=6, sticky="ew")

        # NEW: Theme
        ctk.CTkLabel(content, text="Theme:").grid(row=3, column=0, padx=6, pady=6, sticky="w")
        self.theme_var = ctk.StringVar(value=self._settings.get("theme", "blue"))
        theme_menu = ctk.CTkOptionMenu(
            content,
            values=["blue", "dark-blue", "green"],
            variable=self.theme_var,
            command=self._apply_theme
        )
        theme_menu.grid(row=3, column=1, padx=6, pady=6, sticky="ew")

        # NEW: Start page
        ctk.CTkLabel(content, text="Start Page:").grid(row=4, column=0, padx=6, pady=6, sticky="w")
        self.start_page_var = ctk.StringVar(value=self._settings.get("start_page", "Home"))
        start_menu = ctk.CTkOptionMenu(
            content,
            values=["Home", "Converter", "Calculator", "Misc", "Settings", "About"],
            variable=self.start_page_var,
            command=self._apply_start_page
        )
        start_menu.grid(row=4, column=1, padx=6, pady=6, sticky="ew")

        # NEW: Enter-to-convert
        self.enter_to_convert_var = ctk.BooleanVar(value=bool(self._settings.get("enter_to_convert", True)))
        enter_chk = ctk.CTkCheckBox(
            content,
            text="Press Enter to Convert/Plot",
            variable=self.enter_to_convert_var,
            command=lambda: self._apply_enter_to_convert(self.enter_to_convert_var.get())
        )
        enter_chk.grid(row=5, column=0, columnspan=2, padx=6, pady=6, sticky="w")

        # NEW: Remember last category
        self.remember_last_category_var = ctk.BooleanVar(value=bool(self._settings.get("remember_last_category", True)))
        remember_chk = ctk.CTkCheckBox(
            content,
            text="Remember last selected category",
            variable=self.remember_last_category_var,
            command=lambda: self._apply_remember_last_category(self.remember_last_category_var.get())
        )
        remember_chk.grid(row=6, column=0, columnspan=2, padx=6, pady=6, sticky="w")

        # NEW: Default categories (used when not remembering)
        ctk.CTkLabel(content, text="Default Converter Category:").grid(row=7, column=0, padx=6, pady=6, sticky="w")
        self.default_category_main_var = ctk.StringVar(value=self._settings.get("default_category_main", "Length"))
        default_main_menu = ctk.CTkOptionMenu(
            content,
            values=["Length", "Mass", "Time", "Temperature", "Area", "Volume", "Speed"],
            variable=self.default_category_main_var,
            command=self._apply_default_category_main
        )
        default_main_menu.grid(row=7, column=1, padx=6, pady=6, sticky="ew")

        ctk.CTkLabel(content, text="Default Misc Category:").grid(row=8, column=0, padx=6, pady=6, sticky="w")
        self.default_category_misc_var = ctk.StringVar(value=self._settings.get("default_category_misc", "Angle"))
        default_misc_menu = ctk.CTkOptionMenu(
            content,
            values=["Angle", "Sound Intensity", "Power", "Pressure", "Data", "Frequency"],
            variable=self.default_category_misc_var,
            command=self._apply_default_category_misc
        )
        default_misc_menu.grid(row=8, column=1, padx=6, pady=6, sticky="ew")

        # Bottom bar
        bottom_bar = ctk.CTkFrame(self.settings_tab)
        bottom_bar.pack(side="bottom", fill="x")
        ctk.CTkButton(bottom_bar, text="Back", command=self.go_to_home_page).pack(side="left", padx=10, pady=10)
        # NEW: Reset to defaults
        ctk.CTkButton(bottom_bar, text="Reset Settings", command=self._reset_settings).pack(side="right", padx=10, pady=10)

    # NEW: About tab content
    def init_about_tab(self):
        content = ctk.CTkScrollableFrame(self.about_tab)
        content.pack(expand=True, fill="both", padx=10, pady=10)

        about_text = (
            "CC App — Converter & Calculator\n\n"
            "Convert units across multiple categories and use built-in calculators:\n"
            "• Unit Converter and Misc Converter\n"
            "• Basic, Programmer, and Graphing calculators\n\n"
            "Tips:\n"
            "• Press Enter to convert/plot\n"
            "• Use Back to return to Home\n\n"
            "Built with CustomTkinter and Tkinter."
        )
        lbl = ctk.CTkLabel(content, text=about_text, justify="left", anchor="w")
        lbl.pack(fill="x", padx=6, pady=6)
        content.bind("<Configure>", lambda e: lbl.configure(wraplength=max(e.width - 24, 240)))

        # Bottom bar
        bottom_bar = ctk.CTkFrame(self.about_tab)
        bottom_bar.pack(side="bottom", fill="x")
        ctk.CTkButton(bottom_bar, text="Back", command=self.go_to_home_page).pack(side="left", padx=10, pady=10)

    # NEW: Settings helpers (persist to disk)
    def _apply_appearance(self, mode):
        try:
            ctk.set_appearance_mode(mode)
            self._settings["appearance"] = mode
            self._save_settings()
        except Exception:
            pass

    def _apply_scaling(self, scale_label):
        try:
            v = int(scale_label.strip().replace("%", "")) / 100.0
            ctk.set_widget_scaling(v)
            self._settings["scaling"] = float(v)
            self._save_settings()
        except Exception:
            pass

    # NEW
    def _apply_theme(self, theme_name):
        try:
            ctk.set_default_color_theme(theme_name)
            self._settings["theme"] = theme_name
            self._save_settings()
        except Exception:
            pass

    # NEW
    def _apply_start_page(self, page_name):
        try:
            self._settings["start_page"] = page_name
            self._save_settings()
        except Exception:
            pass

    # NEW
    def _apply_enter_to_convert(self, enabled):
        try:
            self._settings["enter_to_convert"] = bool(enabled)
            self._save_settings()
            self._refresh_enter_bindings()
        except Exception:
            pass

    # NEW
    def _apply_remember_last_category(self, enabled):
        try:
            self._settings["remember_last_category"] = bool(enabled)
            self._save_settings()
        except Exception:
            pass

    # NEW
    def _apply_default_category_main(self, value):
        try:
            self._settings["default_category_main"] = value
            self._save_settings()
        except Exception:
            pass

    # NEW
    def _apply_default_category_misc(self, value):
        try:
            self._settings["default_category_misc"] = value
            self._save_settings()
        except Exception:
            pass

    # NEW: refresh Enter bindings across current pages
    def _refresh_enter_bindings(self):
        def safe_unbind(widget):
            try:
                widget.unbind("<Return>")
            except Exception:
                pass

        def safe_bind(widget, cb):
            try:
                widget.bind("<Return>", cb)
            except Exception:
                pass

        enabled = self._settings.get("enter_to_convert", True)

        # Converter
        if hasattr(self, "input_entry") and self.input_entry.winfo_exists():
            safe_unbind(self.input_entry)
            if enabled:
                safe_bind(self.input_entry, lambda e: self.convert())
        if hasattr(self, "converter_tab") and self.converter_tab.winfo_exists():
            safe_unbind(self.converter_tab)
            if enabled:
                safe_bind(self.converter_tab, lambda e: self.convert())

        # Misc
        if hasattr(self, "misc_input_entry") and self.misc_input_entry.winfo_exists():
            safe_unbind(self.misc_input_entry)
            if enabled:
                safe_bind(self.misc_input_entry, lambda e: self.convert_misc())
        if hasattr(self, "misc_tab") and self.misc_tab.winfo_exists():
            safe_unbind(self.misc_tab)
            if enabled:
                safe_bind(self.misc_tab, lambda e: self.convert_misc())

        # Graphing (bind only on the expression entry)
        if hasattr(self, "expr_entry") and self.expr_entry.winfo_exists():
            safe_unbind(self.expr_entry)
            if enabled:
                safe_bind(self.expr_entry, lambda e: self._graph_plot())

    def _load_settings(self):
        try:
            if os.path.isfile(self._settings_file):
                with open(self._settings_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                # validate and merge
                if data.get("appearance") in {"System", "Light", "Dark"}:
                    self._settings["appearance"] = data["appearance"]
                sc = float(data.get("scaling", 1.0))
                if 0.5 <= sc <= 2.0:
                    self._settings["scaling"] = sc
                if data.get("theme") in {"blue", "dark-blue", "green"}:
                    self._settings["theme"] = data["theme"]
                if data.get("start_page") in {"Home", "Converter", "Calculator", "Misc", "Settings", "About"}:
                    self._settings["start_page"] = data["start_page"]
                if isinstance(data.get("enter_to_convert"), bool):
                    self._settings["enter_to_convert"] = data["enter_to_convert"]
                if isinstance(data.get("remember_last_category"), bool):
                    self._settings["remember_last_category"] = data["remember_last_category"]
                if isinstance(data.get("default_category_main"), str):
                    self._settings["default_category_main"] = data["default_category_main"]
                if isinstance(data.get("default_category_misc"), str):
                    self._settings["default_category_misc"] = data["default_category_misc"]
        except Exception:
            pass

    def _save_settings(self):
        try:
            tmp_path = self._settings_file + ".tmp"
            # Write to temp file first
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(self._settings, f, indent=2)
                f.flush()
                os.fsync(f.fileno())
            # Atomically replace old settings with new
            os.replace(tmp_path, self._settings_file)
        except Exception:
            # Cleanup temp file on failure
            try:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
            except Exception:
                pass

    # NEW: reset to defaults and apply immediately
    def _reset_settings(self):
        self._settings.update({
            "appearance": "System",
            "scaling": 1.0,
            "theme": "blue",
            "start_page": "Home",
            "enter_to_convert": True,
            "remember_last_category": True,
            "default_category_main": "Length",
            "default_category_misc": "Angle"
        })
        self._save_settings()
        try:
            ctk.set_default_color_theme(self._settings["theme"])
            ctk.set_appearance_mode(self._settings["appearance"])
            ctk.set_widget_scaling(self._settings["scaling"])
        except Exception:
            pass
        # Refresh bindings if current pages exist
        self._refresh_enter_bindings()
        # If on settings page, reflect UI state
        try:
            if hasattr(self, "appearance_var"): self.appearance_var.set(self._settings["appearance"])
            if hasattr(self, "scaling_var"): self.scaling_var.set("100%")
            if hasattr(self, "theme_var"): self.theme_var.set(self._settings["theme"])
            if hasattr(self, "start_page_var"): self.start_page_var.set(self._settings["start_page"])
            if hasattr(self, "enter_to_convert_var"): self.enter_to_convert_var.set(self._settings["enter_to_convert"])
            if hasattr(self, "remember_last_category_var"): self.remember_last_category_var.set(self._settings["remember_last_category"])
            if hasattr(self, "default_category_main_var"): self.default_category_main_var.set(self._settings["default_category_main"])
            if hasattr(self, "default_category_misc_var"): self.default_category_misc_var.set(self._settings["default_category_misc"])
        except Exception:
            pass

    # NEW: Misc actions
    def update_misc_units(self, category):
        units = self.misc_units.get(category, [])
        self.misc_unit_from_dropdown.configure(values=units)
        if units:
            self.misc_unit_from_var.set(units[0])
        self._clear_misc_results_list()
        # NEW: remember last misc category if enabled
        try:
            if self._settings.get("remember_last_category", True):
                self._settings["default_category_misc"] = category
                self._save_settings()
            # else keep user's explicit default
        except Exception:
            pass

    def convert_misc(self):
        category = self.misc_category_var.get()
        from_unit = self.misc_unit_from_var.get()
        try:
            value = float(self.misc_input_entry.get())
            self._render_misc_results(category, from_unit, value)
        except ValueError:
            self._show_misc_message("Invalid input")

    # Render results for misc
    def _render_misc_results(self, category, from_unit, value):
        self._clear_misc_results_list()
        units = self.misc_units.get(category, [])
        if not units:
            return

        def fmt(v):
            try:
                if v == 0:
                    return "0"
                abs_v = abs(v)
                if abs_v >= 1e6 or abs_v < 1e-3:
                    return f"{v:.6g}"
                return f"{v:.6f}".rstrip("0").rstrip(".")
            except Exception:
                return str(v)

        for i, u in enumerate(units):
            try:
                conv = self.perform_misc_conversion(category, from_unit, u, value)
                val_label = ctk.CTkLabel(self.misc_results_frame, text=f"{fmt(conv)}")
            except Exception:
                val_label = ctk.CTkLabel(self.misc_results_frame, text="Error")

            unit_label = ctk.CTkLabel(self.misc_results_frame, text=u, anchor="w")
            unit_label.grid(row=i, column=0, padx=6, pady=4, sticky="w")
            val_label.grid(row=i, column=1, padx=6, pady=4, sticky="e")
            self.misc_results_frame.grid_columnconfigure(0, weight=1)
            self.misc_results_frame.grid_columnconfigure(1, weight=0)

    def _show_misc_message(self, text):
        self._clear_misc_results_list()
        msg = ctk.CTkLabel(self.misc_results_frame, text=text, anchor="center")
        msg.grid(row=0, column=0, padx=6, pady=10, sticky="ew")
        self.misc_results_frame.grid_columnconfigure(0, weight=1)

    def _clear_misc_results_list(self):
        if hasattr(self, "misc_results_frame") and self.misc_results_frame.winfo_exists():
            for w in self.misc_results_frame.winfo_children():
                w.destroy()

    def perform_misc_conversion(self, category, from_unit, to_unit, value):
        if category == "Angle":
            return self.convert_misc_angle(from_unit, to_unit, value)
        if category == "Sound Intensity":
            return self.convert_misc_sound_intensity(from_unit, to_unit, value)
        if category == "Power":
            return self.convert_misc_power(from_unit, to_unit, value)
        if category == "Pressure":
            return self.convert_misc_pressure(from_unit, to_unit, value)
        if category == "Data":
            return self.convert_misc_data(from_unit, to_unit, value)
        if category == "Frequency":
            return self.convert_misc_frequency(from_unit, to_unit, value)
        return value

    # Category converters
    def convert_misc_angle(self, from_unit, to_unit, value):
        if from_unit == to_unit:
            return value
        if from_unit == "degree (°)" and to_unit == "radian (rad)":
            return value * math.pi / 180.0
        if from_unit == "radian (rad)" and to_unit == "degree (°)":
            return value * 180.0 / math.pi
        return value

    def convert_misc_sound_intensity(self, from_unit, to_unit, value):
        # Units: "intensity (W/m²)" <-> "level (dB)"
        if from_unit == to_unit:
            return value
        if from_unit == "intensity (W/m²)" and to_unit == "level (dB)":
            if value <= 0:
                raise ValueError("Intensity must be > 0 for dB")
            return 10.0 * math.log10(value / self._misc_I0)
        if from_unit == "level (dB)" and to_unit == "intensity (W/m²)":
            return self._misc_I0 * (10.0 ** (value / 10.0))
        return value

    def convert_misc_power(self, from_unit, to_unit, value):
        # Linear conversions with base unit watt (W)
        power_factors = {
            "watt (W)": 1.0,
            "kilowatt (kW)": 1000.0,
            "megawatt (MW)": 1_000_000.0,
            "horsepower (hp)": 745.6998715822702,  # mechanical hp
        }
        if from_unit == to_unit:
            return value
        return value * power_factors[from_unit] / power_factors[to_unit]

    def convert_misc_pressure(self, from_unit, to_unit, value):
        # Base unit: pascal (Pa)
        pressure_factors = {
            "pascal (Pa)": 1.0,
            "kilopascal (kPa)": 1_000.0,
            "bar": 100_000.0,                 # exact
            "atmosphere (atm)": 101_325.0,    # exact
            "torr (Torr)": 101_325.0 / 760.0, # exact by definition (1 atm = 760 Torr)
            "pound per square inch (psi)": 6_894.757293168361,
        }
        if from_unit == to_unit:
            return value
        return value * pressure_factors[from_unit] / pressure_factors[to_unit]

    def convert_misc_data(self, from_unit, to_unit, value):
        # Base unit: bit (b)
        k = 1000.0
        ki = 1024.0
        factors_to_bit = {
            "bit (b)": 1.0,
            "byte (B)": 8.0,

            # Decimal (SI)
            "kilobit (kb)": k,
            "kilobyte (kB)": 8.0 * k,
            "megabit (Mb)": k**2,
            "megabyte (MB)": 8.0 * (k**2),
            "gigabit (Gb)": k**3,
            "gigabyte (GB)": 8.0 * (k**3),
            "terabit (Tb)": k**4,
            "terabyte (TB)": 8.0 * (k**4),

            # Binary (IEC)
            "kibibit (Kib)": ki,
            "kibibyte (KiB)": 8.0 * ki,
            "mebibit (Mib)": ki**2,
            "mebibyte (MiB)": 8.0 * (ki**2),
            "gibibit (Gib)": ki**3,
            "gibibyte (GiB)": 8.0 * (ki**3),
            "tebibit (Tib)": ki**4,
            "tebibyte (TiB)": 8.0 * (ki**4),
        }
        if from_unit == to_unit:
            return value
        return value * factors_to_bit[from_unit] / factors_to_bit[to_unit]

    def convert_misc_frequency(self, from_unit, to_unit, value):
        # Base unit: hertz (Hz)
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

    def go_to_home_page(self):
        # Destroy the tabview to avoid duplicate widgets on re-entry
        if hasattr(self, "tabview") and self.tabview.winfo_exists():
            self.tabview.destroy()
        # Also destroy the calculator bottom bar if present
        if hasattr(self, "calc_bottom_bar") and self.calc_bottom_bar.winfo_exists():
            self.calc_bottom_bar.destroy()
        self.init_home_page()
    
    def init_converter_tab(self):
        # Build a scrollable content area so everything stays accessible in small windows
        content = ctk.CTkScrollableFrame(self.converter_tab)
        content.pack(expand=True, fill="both", padx=10, pady=10)

        # Info label for Converter page (now inside content, full-width, wrapped)
        self.converter_info_label = ctk.CTkLabel(
            content,
            text="Contents: Convert across Length, Mass, Time, Temperature, Area, Volume, Speed. Enter a value to see all results.",
            justify="left",
            anchor="w"
        )
        self.converter_info_label.grid(row=0, column=0, columnspan=2, padx=6, pady=(0, 10), sticky="ew")
        content.bind(
            "<Configure>",
            lambda e: self.converter_info_label.configure(wraplength=max(e.width - 24, 240))
        )

        content.grid_columnconfigure(0, weight=0)
        content.grid_columnconfigure(1, weight=1)

        # Category (shifted down by one row)
        self.category_label = ctk.CTkLabel(content, text="Select Category:")
        self.category_label.grid(row=1, column=0, padx=6, pady=6, sticky="w")
        # CHANGED: default from settings
        self.category_var = ctk.StringVar(value=self._settings.get("default_category_main", "Length"))
        self.category_dropdown = ctk.CTkOptionMenu(
            content, variable=self.category_var,
            values=["Length", "Mass", "Time", "Temperature", "Area", "Volume", "Speed"],
            command=self.update_units
        )
        self.category_dropdown.grid(row=1, column=1, padx=6, pady=6, sticky="ew")

        # From unit
        self.unit_from_label = ctk.CTkLabel(content, text="From Unit:")
        self.unit_from_label.grid(row=2, column=0, padx=6, pady=6, sticky="w")
        self.unit_from_var = ctk.StringVar(value="meter (m)")
        self.unit_from_dropdown = ctk.CTkOptionMenu(content, variable=self.unit_from_var, values=[])
        self.unit_from_dropdown.grid(row=2, column=1, padx=6, pady=6, sticky="ew")

        # Input
        self.input_label = ctk.CTkLabel(content, text="Enter Value:")
        self.input_label.grid(row=3, column=0, padx=6, pady=6, sticky="w")
        self.input_entry = ctk.CTkEntry(content)
        self.input_entry.grid(row=3, column=1, padx=6, pady=6, sticky="ew")
        # CHANGED: Enter binding based on settings
        if self._settings.get("enter_to_convert", True):
            self.input_entry.bind("<Return>", lambda e: self.convert())
            self.converter_tab.bind("<Return>", lambda e: self.convert())

        # Add "All Results" section
        self.all_results_label = ctk.CTkLabel(content, text="All Results:")
        self.all_results_label.grid(row=4, column=0, padx=6, pady=(12, 6), sticky="w")
        self.results_frame = ctk.CTkScrollableFrame(content, height=240)
        self.results_frame.grid(row=5, column=0, columnspan=2, padx=6, pady=(0, 6), sticky="nsew")
        content.grid_rowconfigure(5, weight=1)

        # Bottom bar pinned to bottom with Back (left) and Convert (right)
        bottom_bar = ctk.CTkFrame(self.converter_tab)
        bottom_bar.pack(side="bottom", fill="x")
        self.back_button = ctk.CTkButton(bottom_bar, text="Back", command=self.go_to_home_page)
        self.back_button.pack(side="left", padx=10, pady=10)
        convert_btn = ctk.CTkButton(bottom_bar, text="Convert", command=self.convert)
        convert_btn.pack(side="right", padx=10, pady=10)

        # Units and defaults
        self.units = {
            "Length": ["meter (m)", "kilometer (km)", "centimeter (cm)", "millimeter (mm)", "inch (in)", "foot (ft)", "yard (yd)", "mile (mi)"],
            "Mass": ["kilogram (kg)", "gram (g)", "milligram (mg)", "metric ton (t)", "ounce (oz)", "pound (lb)", "stone"],
            "Time": ["second (s)", "minute (min)", "hour (h)", "day", "week", "year"],
            "Temperature": ["kelvin (K)", "Celsius (°C)", "Fahrenheit (°F)"],
            "Area": ["square meter (m²)", "hectare (ha)", "acre", "square kilometer (km²)", "square foot (ft²)", "square inch (in²)"],
            "Volume": ["cubic meter (m³)", "liter (L)", "milliliter (mL)", "gallon (US)", "gallon (UK)", "pint (US)", "quart (US)", "cubic foot (ft³)", "cubic inch (in³)"],
            "Speed": ["meter per second (m/s)", "kilometer per hour (km/h)", "mile per hour (mph)", "foot per second (ft/s)", "knot (kn)"]
        }
        # CHANGED: initialize with current selected default
        self.update_units(self.category_var.get())
    
    def init_calculator_tab(self):
        # Info label for Calculator page (left-aligned, wrapped)
        self.calculator_info_label = ctk.CTkLabel(
            self.calculator_tab,
            text="Contents: Basic calculator with keys 0–9, +, -, *, /, C, =.",
            justify="left",
            anchor="w"
        )
        self.calculator_info_label.pack(fill="x", padx=12, pady=(12, 6))
        self.calculator_tab.bind(
            "<Configure>",
            lambda e: self.calculator_info_label.configure(wraplength=max(e.width - 24, 240))
        )

        # Container that expands in both directions
        self.calculator_container = ctk.CTkFrame(self.calculator_tab)
        self.calculator_container.pack(expand=True, fill="both", padx=12, pady=(0, 4))

        # Configure grid: 5 rows (1 display + 4 button rows), 4 columns
        for r in range(5):
            self.calculator_container.grid_rowconfigure(r, weight=1, uniform="calc")
        for c in range(4):
            self.calculator_container.grid_columnconfigure(c, weight=1, uniform="calc")

        # Shared fonts (resized on demand)
        self.display_font = ctk.CTkFont(size=32)
        self.button_font = ctk.CTkFont(size=18, weight="bold")

        # Display spans all columns
        self.calculator_display = ctk.CTkEntry(
            self.calculator_container,
            justify="right",
            font=self.display_font,
            height=50
        )
        self.calculator_display.grid(row=0, column=0, columnspan=4, sticky="nsew", padx=6, pady=(6, 10))

        # Buttons in a 4x4 grid
        buttons = [
            ["7", "8", "9", "/"],
            ["4", "5", "6", "*"],
            ["1", "2", "3", "-"],
            ["C", "0", "=", "+"]
        ]
        self._calc_btns = []
        for r, row in enumerate(buttons, start=1):
            for c, text in enumerate(row):
                btn = ctk.CTkButton(
                    self.calculator_container,
                    text=text,
                    font=self.button_font,
                    command=lambda b=text: self.handle_calculator_input(b)
                )
                btn.grid(row=r, column=c, padx=6, pady=6, sticky="nsew")
                self._calc_btns.append(btn)

        # Resize behavior for windowed/fullscreen
        self.calculator_container.bind("<Configure>", self._on_calc_resize)

    def handle_calculator_input(self, button_text):
        if button_text == "C":
            self.calculator_display.delete(0, "end")
        elif button_text == "=":
            try:
                expression = self.calculator_display.get()
                result = eval(expression)
                self.calculator_display.delete(0, "end")
                self.calculator_display.insert(0, str(result))
            except Exception:
                self.calculator_display.delete(0, "end")
                self.calculator_display.insert(0, "Error")
        else:
            self.calculator_display.insert("end", button_text)
    
    def update_units(self, category):
        units = self.units.get(category, [])
        self.unit_from_dropdown.configure(values=units)
        if units:
            self.unit_from_var.set(units[0])
        # Clear previous all-results when category changes
        self._clear_results_list()
        # NEW: remember last main category if enabled
        try:
            if self._settings.get("remember_last_category", True):
                self._settings["default_category_main"] = category
                self._save_settings()
        except Exception:
            pass
    
    def convert(self):
        category = self.category_var.get()
        from_unit = self.unit_from_var.get()
        try:
            value = float(self.input_entry.get())
            # Populate all results list only
            self._render_all_results(category, from_unit, value)
        except ValueError:
            self._show_message("Invalid input")

    # Build the "all results" list for the selected category
    def _render_all_results(self, category, from_unit, value):
        self._clear_results_list()
        units = self.units.get(category, [])
        if not units:
            return

        def fmt(v):
            try:
                if v == 0:
                    return "0"
                abs_v = abs(v)
                if abs_v >= 1e6 or abs_v < 1e-3:
                    return f"{v:.6g}"
                return f"{v:.6f}".rstrip("0").rstrip(".")
            except Exception:
                return str(v)

        for i, u in enumerate(units):
            try:
                conv = self.perform_conversion(category, from_unit, u, value)
                val_label = ctk.CTkLabel(self.results_frame, text=f"{fmt(conv)}")
            except Exception:
                val_label = ctk.CTkLabel(self.results_frame, text="Error")

            unit_label = ctk.CTkLabel(self.results_frame, text=u, anchor="w")
            unit_label.grid(row=i, column=0, padx=6, pady=4, sticky="w")
            val_label.grid(row=i, column=1, padx=6, pady=4, sticky="e")
            self.results_frame.grid_columnconfigure(0, weight=1)
            self.results_frame.grid_columnconfigure(1, weight=0)

    def _show_message(self, text):
        self._clear_results_list()
        msg = ctk.CTkLabel(self.results_frame, text=text, anchor="center")
        msg.grid(row=0, column=0, padx=6, pady=10, sticky="ew")
        self.results_frame.grid_columnconfigure(0, weight=1)

    def _clear_results_list(self):
        if hasattr(self, "results_frame") and self.results_frame.winfo_exists():
            for w in self.results_frame.winfo_children():
                w.destroy()
    
    def perform_conversion(self, category, from_unit, to_unit, value):
        if category == "Length":
            return self.convert_length(from_unit, to_unit, value)
        elif category == "Mass":
            return self.convert_mass(from_unit, to_unit, value)
        elif category == "Time":
            return self.convert_time(from_unit, to_unit, value)
        elif category == "Temperature":
            return self.convert_temperature(from_unit, to_unit, value)
        elif category == "Area":
            return self.convert_area(from_unit, to_unit, value)
        elif category == "Volume":
            return self.convert_volume(from_unit, to_unit, value)
        elif category == "Speed":  # added
            return self.convert_speed(from_unit, to_unit, value)
        return value
    
    def convert_length(self, from_unit, to_unit, value):
        length_factors = {
            "meter (m)": 1,
            "kilometer (km)": 1000,
            "centimeter (cm)": 0.01,
            "millimeter (mm)": 0.001,
            "inch (in)": 0.0254,            # exact
            "foot (ft)": 0.3048,            # exact
            "yard (yd)": 0.9144,            # exact
            "mile (mi)": 1609.344           # exact international mile
        }
        return value * length_factors[from_unit] / length_factors[to_unit]
    
    def convert_mass(self, from_unit, to_unit, value):
        mass_factors = {
            "kilogram (kg)": 1,
            "gram (g)": 0.001,
            "milligram (mg)": 1e-6,
            "metric ton (t)": 1000,
            "ounce (oz)": 0.028349523125,   # exact (avoirdupois)
            "pound (lb)": 0.45359237,       # exact
            "stone": 6.35029318             # exact (14 lb)
        }
        return value * mass_factors[from_unit] / mass_factors[to_unit]
    
    def convert_time(self, from_unit, to_unit, value):
        time_factors = {
            "second (s)": 1,
            "minute (min)": 60,
            "hour (h)": 3600,
            "day": 86400,
            "week": 604800,
            "year": 31536000               # 365 days; avoid ambiguity
        }
        return value * time_factors[from_unit] / time_factors[to_unit]
    
    def convert_temperature(self, from_unit, to_unit, value):
        # Handle same-unit quickly
        if from_unit == to_unit:
            return value

        # Convert from source to Celsius
        if from_unit == "Celsius (°C)":
            c = value
        elif from_unit == "Fahrenheit (°F)":
            c = (value - 32) * 5/9
        elif from_unit == "kelvin (K)":
            c = value - 273.15
        else:
            return value  # Fallback

        # Convert from Celsius to target
        if to_unit == "Celsius (°C)":
            return c
        elif to_unit == "Fahrenheit (°F)":
            return c * 9/5 + 32
        elif to_unit == "kelvin (K)":
            return c + 273.15
        return value
    
    def convert_area(self, from_unit, to_unit, value):
        area_factors = {
            "square meter (m²)": 1,
            "hectare (ha)": 10000,
            "acre": 4046.8564224,          # exact
            "square kilometer (km²)": 1_000_000,
            "square foot (ft²)": 0.09290304,   # exact
            "square inch (in²)": 0.00064516    # exact (0.0254^2)
        }
        return value * area_factors[from_unit] / area_factors[to_unit]
    
    def convert_volume(self, from_unit, to_unit, value):
        volume_factors = {
            "cubic meter (m³)": 1,
            "liter (L)": 0.001,
            "milliliter (mL)": 1e-6,
            "gallon (US)": 0.003785411784,     # exact (US liquid)
            "gallon (UK)": 0.00454609,         # exact (Imperial)
            "pint (US)": 0.000473176473,       # exact
            "quart (US)": 0.000946352946,      # exact
            "cubic foot (ft³)": 0.028316846592,# exact
            "cubic inch (in³)": 0.000016387064 # exact
        }
        return value * volume_factors[from_unit] / volume_factors[to_unit]

    def convert_speed(self, from_unit, to_unit, value):
        # Base unit: meter per second (m/s)
        speed_factors = {
            "meter per second (m/s)": 1,
            "kilometer per hour (km/h)": 1000/3600,   # exact
            "mile per hour (mph)": 1609.344/3600,     # exact international mile
            "foot per second (ft/s)": 0.3048,         # exact
            "knot (kn)": 1852/3600                    # exact nautical mile per hour
        }
        return value * speed_factors[from_unit] / speed_factors[to_unit]

    def _on_calc_resize(self, event):
        try:
            w, h = max(event.width, 1), max(event.height, 1)
            # Estimate cell size (4 columns x 5 rows total)
            cell_w = w / 4
            cell_h = h / 5
            base = min(cell_w, cell_h)

            # Derive sizes with sane limits
            disp_size = int(min(max(base * 0.35, 18), 48))
            btn_size = int(min(max(base * 0.30, 14), 28))
            entry_h = int(min(max(base * 0.5, 40), 80))

            self.display_font.configure(size=disp_size)
            self.button_font.configure(size=btn_size)
            self.calculator_display.configure(height=entry_h)
            # Also apply to programmer display if exists
            if hasattr(self, "programmer_display"):
                self.programmer_display.configure(height=entry_h)
        except Exception:
            pass

    # NEW: Programmer calculator UI
    def init_programmer_tab(self):
        # Info
        self.programmer_info_label = ctk.CTkLabel(
            self.programmer_tab,
            text="Programmer: integer ops (+, -, *, //), bitwise (AND, OR, XOR, NOT), shifts (SHL, SHR).",
            justify="left",
            anchor="w"
        )
        self.programmer_info_label.pack(fill="x", padx=12, pady=(12, 6))
        self.programmer_tab.bind(
            "<Configure>",
            lambda e: self.programmer_info_label.configure(wraplength=max(e.width - 24, 240))
        )

        # Container
        self.programmer_container = ctk.CTkFrame(self.programmer_tab)
        self.programmer_container.pack(expand=True, fill="both", padx=12, pady=(0, 4))
        for r in range(9):  # display + controls + 7 button rows
            self.programmer_container.grid_rowconfigure(r, weight=1, uniform="prog")
        for c in range(4):
            self.programmer_container.grid_columnconfigure(c, weight=1, uniform="prog")

        # Reuse fonts from standard calculator
        if not hasattr(self, "display_font"):
            self.display_font = ctk.CTkFont(size=32)
        if not hasattr(self, "button_font"):
            self.button_font = ctk.CTkFont(size=18, weight="bold")

        # Display
        self.programmer_display = ctk.CTkEntry(
            self.programmer_container,
            justify="right",
            font=self.display_font,
            height=50
        )
        self.programmer_display.grid(row=0, column=0, columnspan=4, sticky="nsew", padx=6, pady=(6, 10))
        self.programmer_display.insert(0, "0")

        # Controls: base + word size
        self.programmer_base_var = ctk.StringVar(value="DEC")
        self._prog_prev_base = "DEC"
        base_menu = ctk.CTkOptionMenu(
            self.programmer_container,
            values=["BIN", "OCT", "DEC", "HEX"],
            variable=self.programmer_base_var,
            command=self._on_prog_base_change
        )
        base_menu.grid(row=1, column=0, columnspan=2, sticky="nsew", padx=(6, 3), pady=(0, 6))

        self.word_size_var = ctk.IntVar(value=32)
        word_menu = ctk.CTkOptionMenu(
            self.programmer_container,
            values=["8", "16", "32", "64"],
            command=lambda v: self._on_prog_wordsize_change(int(v))
        )
        word_menu.set(str(self.word_size_var.get()))
        word_menu.grid(row=1, column=2, columnspan=2, sticky="nsew", padx=(3, 6), pady=(0, 6))

        # Buttons
        layout = [
            ["A", "B", "C", "D"],
            ["E", "F", "7", "8"],
            ["9", "+", "-", "*"],
            ["4", "5", "6", "/"],
            ["1", "2", "3", "="],
            ["0", "C", "AND", "OR"],
            ["XOR", "NOT", "SHL", "SHR"],
        ]
        self._prog_btns = []
        self._prog_digit_buttons = {}  # label -> widget for digits/hex letters
        for r, row in enumerate(layout, start=2):
            for c, text in enumerate(row):
                btn = ctk.CTkButton(
                    self.programmer_container,
                    text=text,
                    font=self.button_font,
                    command=lambda b=text: self.handle_programmer_input(b)
                )
                btn.grid(row=r, column=c, padx=6, pady=6, sticky="nsew")
                self._prog_btns.append(btn)
                if len(text) == 1 and (text.isdigit() or text in "ABCDEF"):
                    self._prog_digit_buttons[text] = btn

        # Initial enable/disable by base
        self._update_prog_buttons_state()

        # Resize behavior
        self.programmer_container.bind("<Configure>", self._on_calc_resize)

        # State for pending operation
        self._prog_acc = None
        self._prog_op = None

    # NEW: Programmer calculator handlers and helpers
    def handle_programmer_input(self, button_text):
        base = self.programmer_base_var.get()

        def mask():
            return (1 << int(self.word_size_var.get())) - 1

        def parse_current():
            val = self._prog_parse(self.programmer_display.get(), base=base)
            return 0 if val is None else val & mask()

        def show_value(v):
            self.programmer_display.delete(0, "end")
            self.programmer_display.insert(0, self._prog_format(v & mask(), base=base))

        def is_allowed_digit(ch):
            allowed = {
                "BIN": set("01"),
                "OCT": set("01234567"),
                "DEC": set("0123456789"),
                "HEX": set("0123456789ABCDEF"),
            }[base]
            return ch in allowed

        if button_text == "C":
            self._prog_acc = None
            self._prog_op = None
            self.programmer_display.delete(0, "end")
            self.programmer_display.insert(0, "0")
            return

        if button_text == "NOT":
            a = parse_current()
            show_value(~a)
            self._prog_acc = None
            self._prog_op = None
            return

        if button_text == "=":
            if self._prog_op is None or self._prog_acc is None:
                return
            b = parse_current()
            res = self._prog_eval(self._prog_acc, self._prog_op, b, mask())
            if res is None:
                self.programmer_display.delete(0, "end")
                self.programmer_display.insert(0, "Error")
            else:
                show_value(res)
            self._prog_acc = None
            self._prog_op = None
            return

        # Operators
        if button_text in {"+", "-", "*", "/", "AND", "OR", "XOR", "SHL", "SHR"}:
            cur = parse_current()
            if self._prog_op is None or self._prog_acc is None:
                self._prog_acc = cur
                self._prog_op = button_text
            else:
                res = self._prog_eval(self._prog_acc, self._prog_op, cur, mask())
                if res is None:
                    self.programmer_display.delete(0, "end")
                    self.programmer_display.insert(0, "Error")
                    self._prog_acc = None
                    self._prog_op = None
                    return
                self._prog_acc = res
                self._prog_op = button_text
                show_value(res)
            # Prepare for next operand
            self.programmer_display.delete(0, "end")
            self.programmer_display.insert(0, "0")
            return

        # Digits / hex letters
        ch = button_text.upper()
        if len(ch) == 1 and (ch.isdigit() or ch in "ABCDEF") and is_allowed_digit(ch):
            current = self.programmer_display.get().upper()
            if current == "0":
                new_text = ch
            else:
                new_text = current + ch
            self.programmer_display.delete(0, "end")
            self.programmer_display.insert(0, new_text)
            return

        # Anything else is ignored in programmer mode

    def _prog_eval(self, a, op, b, mask):
        try:
            if op == "+":
                return (a + b) & mask
            if op == "-":
                return (a - b) & mask
            if op == "*":
                return (a * b) & mask
            if op == "/":
                if b == 0:
                    return None
                return (a // b) & mask
            if op == "AND":
                return (a & b) & mask
            if op == "OR":
                return (a | b) & mask
            if op == "XOR":
                return (a ^ b) & mask
            if op == "SHL":
                shift = max(0, min(b, mask.bit_length()))
                return (a << shift) & mask
            if op == "SHR":
                shift = max(0, min(b, mask.bit_length()))
                return (a >> shift) & mask
        except Exception:
            return None
        return None

    def _on_prog_base_change(self, new_base):
        # Re-interpret current text from previous base into new base
        val = self._prog_parse(self.programmer_display.get(), base=self._prog_prev_base)
        if val is None:
            val = 0
        self.programmer_display.delete(0, "end")
        self.programmer_display.insert(0, self._prog_format(val, base=new_base))
        self._prog_prev_base = new_base
        self._update_prog_buttons_state()

    def _on_prog_wordsize_change(self, new_bits):
        try:
            self.word_size_var.set(int(new_bits))
            # Re-mask current value
            cur = self._prog_parse(self.programmer_display.get(), base=self.programmer_base_var.get())
            if cur is None:
                cur = 0
            m = (1 << self.word_size_var.get()) - 1
            self.programmer_display.delete(0, "end")
            self.programmer_display.insert(0, self._prog_format(cur & m, base=self.programmer_base_var.get()))
        except Exception:
            pass

    def _update_prog_buttons_state(self):
        base = self.programmer_base_var.get()
        allowed = {
            "BIN": set("01"),
            "OCT": set("01234567"),
            "DEC": set("0123456789"),
            "HEX": set("0123456789ABCDEF"),
        }[base]
        for label, btn in self._prog_digit_buttons.items():
            if label.upper() in allowed:
                btn.configure(state="normal")
            else:
                btn.configure(state="disabled")

    def _prog_parse(self, text, base=None):
        if base is None:
            base = self.programmer_base_var.get()
        s = (text or "").strip().upper()
        if s == "":
            return 0
        try:
            radix = {"BIN": 2, "OCT": 8, "DEC": 10, "HEX": 16}[base]
            return int(s, radix)
        except Exception:
            return None

    def _prog_format(self, value, base=None):
        if base is None:
            base = self.programmer_base_var.get()
        if base == "DEC":
            return str(int(value))
        if base == "HEX":
            return format(int(value), "X")
        if base == "OCT":
            return format(int(value), "o").upper()
        if base == "BIN":
            return format(int(value), "b").upper()
        return str(int(value))

    # NEW: Graphing calculator UI
    def init_graphing_tab(self):
        # Info
        info = ctk.CTkLabel(
            self.graphing_tab,
            text="Graphing: plot y = f(x). Supports sin, cos, tan, exp, log, sqrt, abs, pi, e, etc.",
            justify="left",
            anchor="w"
        )
        info.pack(fill="x", padx=12, pady=(12, 6))
        self.graphing_tab.bind(
            "<Configure>",
            lambda e: info.configure(width=max(e.width - 24, 240))
        )

        # Container
        self.graph_container = ctk.CTkFrame(self.graphing_tab)
        self.graph_container.pack(expand=True, fill="both", padx=12, pady=(0, 4))
        self.graph_container.grid_rowconfigure(1, weight=1)
        self.graph_container.grid_columnconfigure(0, weight=1)

        # Controls row
        controls = ctk.CTkFrame(self.graph_container)
        controls.grid(row=0, column=0, sticky="ew", padx=6, pady=(6, 6))
        for i in range(12):
            controls.grid_columnconfigure(i, weight=1 if i in (1, 3, 5, 7, 9, 11) else 0)

        ctk.CTkLabel(controls, text="y =").grid(row=0, column=0, padx=(6, 4), pady=4, sticky="e")
        self.expr_entry = ctk.CTkEntry(controls)
        self.expr_entry.insert(0, "sin(x)")
        self.expr_entry.grid(row=0, column=1, columnspan=5, padx=(0, 6), pady=4, sticky="ew")
        # CHANGED: Enter binding based on settings
        if self._settings.get("enter_to_convert", True):
            self.expr_entry.bind("<Return>", lambda e: self._graph_plot())

        ctk.CTkLabel(controls, text="x min").grid(row=0, column=6, padx=(6, 4), pady=4, sticky="e")
        self.xmin_entry = ctk.CTkEntry(controls, width=80)
        self.xmin_entry.insert(0, "-10")
        self.xmin_entry.grid(row=0, column=7, padx=(0, 6), pady=4, sticky="ew")

        ctk.CTkLabel(controls, text="x max").grid(row=0, column=8, padx=(6, 4), pady=4, sticky="e")
        self.xmax_entry = ctk.CTkEntry(controls, width=80)
        self.xmax_entry.insert(0, "10")
        self.xmax_entry.grid(row=0, column=9, padx=(0, 6), pady=4, sticky="ew")

        self.auto_y_var = ctk.BooleanVar(value=True)
        self.auto_y_chk = ctk.CTkCheckBox(controls, text="Auto Y", variable=self.auto_y_var, command=self._on_autoY_toggle)
        self.auto_y_chk.grid(row=0, column=10, padx=(6, 4), pady=4, sticky="w")

        # Y range (disabled when Auto Y)
        yframe = ctk.CTkFrame(controls)
        yframe.grid(row=1, column=0, columnspan=12, sticky="ew", padx=6, pady=(4, 0))
        for i in range(8):
            yframe.grid_columnconfigure(i, weight=1 if i in (1, 3) else 0)

        ctk.CTkLabel(yframe, text="y min").grid(row=0, column=0, padx=(0, 4), pady=4, sticky="e")
        self.ymin_entry = ctk.CTkEntry(yframe, width=80)
        self.ymin_entry.insert(0, "-5")
        self.ymin_entry.grid(row=0, column=1, padx=(0, 12), pady=4, sticky="ew")

        ctk.CTkLabel(yframe, text="y max").grid(row=0, column=2, padx=(0, 4), pady=4, sticky="e")
        self.ymax_entry = ctk.CTkEntry(yframe, width=80)
        self.ymax_entry.insert(0, "5")
        self.ymax_entry.grid(row=0, column=3, padx=(0, 12), pady=4, sticky="ew")

        plot_btn = ctk.CTkButton(yframe, text="Plot", command=self._graph_plot)
        plot_btn.grid(row=0, column=4, padx=(6, 6), pady=4, sticky="ew")
        clear_btn = ctk.CTkButton(yframe, text="Clear", command=self._graph_clear)
        clear_btn.grid(row=0, column=5, padx=(0, 6), pady=4, sticky="ew")

        # Message label
        self.graph_msg = ctk.CTkLabel(yframe, text="", anchor="w")
        self.graph_msg.grid(row=0, column=6, columnspan=2, padx=(6, 6), pady=4, sticky="ew")

        # Canvas
        self.graph_canvas = tk.Canvas(self.graph_container, background="#1e1e1e", highlightthickness=0)
        self.graph_canvas.grid(row=1, column=0, sticky="nsew", padx=6, pady=(0, 6))
        self.graph_canvas.bind("<Configure>", self._on_graph_resize)

        # Initial state
        self._graph_state = None
        self._on_autoY_toggle()

    # NEW: Graphing helpers
    def _on_graph_resize(self, event):
        if self._graph_state:
            self._graph_draw(**self._graph_state)

    def _on_autoY_toggle(self):
        state = "disabled" if self.auto_y_var.get() else "normal"
        self.ymin_entry.configure(state=state)
        self.ymax_entry.configure(state=state)

    def _graph_clear(self):
        self.graph_canvas.delete("all")
        self.graph_msg.configure(text="")
        self._graph_state = None

    def _graph_plot(self):
        expr = self.expr_entry.get().strip()
        try:
            xmin = float(self.xmin_entry.get())
            xmax = float(self.xmax_entry.get())
        except Exception:
            self.graph_msg.configure(text="Invalid x-range")
            return
        if not expr:
            self.graph_msg.configure(text="Enter expression")
            return
        if xmax <= xmin:
            self.graph_msg.configure(text="x max must be > x min")
            return

        # Sample points to compute y range if needed
        xs, ys = self._graph_sample(expr, xmin, xmax, samples=max(self.graph_canvas.winfo_width(), 400))
        ys_valid = [y for y in ys if y is not None and math.isfinite(y)]
        if not ys_valid:
            self.graph_msg.configure(text="No valid points")
            return

        if self.auto_y_var.get():
            ymin = min(ys_valid)
            ymax = max(ys_valid)
            pad = (ymax - ymin) * 0.1 or 1.0
            ymin -= pad
            ymax += pad
        else:
            try:
                ymin = float(self.ymin_entry.get())
                ymax = float(self.ymax_entry.get())
            except Exception:
                self.graph_msg.configure(text="Invalid y-range")
                return
            if ymax <= ymin:
                self.graph_msg.configure(text="y max must be > y min")
                return

        self._graph_state = {"expr": expr, "xmin": xmin, "xmax": xmax, "ymin": ymin, "ymax": ymax}
        self._graph_draw(**self._graph_state)
        self.graph_msg.configure(text="")

    def _graph_sample(self, expr, xmin, xmax, samples=600):
        samples = max(50, int(samples))
        dx = (xmax - xmin) / (samples - 1)
        xs, ys = [], []
        for i in range(samples):
            x = xmin + i * dx
            y = self._graph_eval(expr, x)
            xs.append(x)
            ys.append(y if y is None or math.isfinite(y) else None)
        return xs, ys

    def _graph_eval(self, expr, x):
        try:
            env = {
                "x": x,
                "pi": math.pi, "e": math.e,
                "sin": math.sin, "cos": math.cos, "tan": math.tan,
                "asin": math.asin, "acos": math.acos, "atan": math.atan,
                "exp": math.exp, "log": math.log, "log10": math.log10,
                "sqrt": math.sqrt, "abs": abs, "floor": math.floor, "ceil": math.ceil,
                "pow": pow
            }
            return float(eval(expr, {"__builtins__": {}}, env))
        except Exception:
            return None

    def _graph_draw(self, expr, xmin, xmax, ymin, ymax):
        # Canvas geometry
        w = max(self.graph_canvas.winfo_width(), 2)
        h = max(self.graph_canvas.winfo_height(), 2)
        self.graph_canvas.delete("all")

        # Margins and scales
        lm, rm, tm, bm = 40, 20, 20, 30
        cw = max(w - lm - rm, 1)
        ch = max(h - tm - bm, 1)
        sx = cw / (xmax - xmin)
        sy = ch / (ymax - ymin)

        def to_px(x, y):
            px = lm + (x - xmin) * sx
            py = tm + ch - (y - ymin) * sy
            return px, py

        # Background
        self.graph_canvas.create_rectangle(0, 0, w, h, fill="#1e1e1e", outline="")

        # Axes
        axis_color = "#888888"
        if xmin <= 0 <= xmax:
            x0, y_top = to_px(0, ymax)
            _, y_bot = to_px(0, ymin)
            self.graph_canvas.create_line(x0, y_top, x0, y_bot, fill=axis_color)
        if ymin <= 0 <= ymax:
            x_left, y0 = to_px(xmin, 0)
            x_right, _ = to_px(xmax, 0)
            self.graph_canvas.create_line(x_left, y0, x_right, y0, fill=axis_color)

        # Border
        self.graph_canvas.create_rectangle(lm, tm, lm + cw, tm + ch, outline="#444444")

        # Sample and draw
        xs, ys = self._graph_sample(expr, xmin, xmax, samples=cw)
        plot_color = "#22a6f2"
        prev = None
        for x, y in zip(xs, ys):
            if y is None or y < ymin or y > ymax:
                prev = None
                continue
            px, py = to_px(x, y)
            if prev is not None:
                ppx, ppy = prev
                # Skip huge jumps (likely discontinuities)
                if abs(py - ppy) < ch * 2:
                    self.graph_canvas.create_line(ppx, ppy, px, py, fill=plot_color)
            prev = (px, py)

        # Labels
        self.graph_canvas.create_text(lm + 6, tm + 12, anchor="w", fill="#cccccc", text=f"y = {expr}")
        self.graph_canvas.create_text(w - rm, h - bm + 14, anchor="e", fill="#aaaaaa", text=f"x:[{xmin:g},{xmax:g}]  y:[{ymin:g},{ymax:g}]")

if __name__ == "__main__":
    app = ConverterApp()
    app.mainloop()