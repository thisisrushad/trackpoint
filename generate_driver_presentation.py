#!/usr/bin/env python3
"""
TrackPoint — Driver Mobile Handset & In-Cab Portal Presentation Generator (.pptx)
Generates an 11-slide, high-design 16:9 widescreen presentation presenting:
- Outstation Driver Persona: Dave Miller (Mack Titan #NL-14, 85t GCM Road Train)
- In-Cab Reality: 1,500km Stuart Highway, 45°C Top End Heat & Outstation Cellular Blackspots
- Screen-by-Screen Walkthrough (Active Drop, e-POD HTML5 Canvas, Offline Dead-Zone Simulator, Manifest Queue, Corridor Navigation, NHVR Safety)
- LocalStorage / IndexedDB Dead-Zone Buffering & Live Production Links
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# --- Color Palette (Tailored Slate/Navy Dark Mode with Cyan/Emerald/Gold Accents) ---
BG_DARK = RGBColor(11, 19, 32)         # #0B1320 Deep Space Navy
BG_CARD = RGBColor(17, 29, 51)         # #111D33 Container Card Navy
BG_CARD_LIGHT = RGBColor(24, 39, 68)   # #182744 Highlight Card
BORDER_BLUE = RGBColor(56, 189, 248)   # #38BDF8 Sky Blue Accent
BORDER_MUTED = RGBColor(51, 65, 85)    # #334155 Border slate
TEXT_WHITE = RGBColor(248, 250, 252)   # #F8FAFC Heading text
TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8 Secondary text
TEXT_CYAN = RGBColor(56, 189, 248)     # #38BDF8 Highlight Cyan
TEXT_GREEN = RGBColor(52, 211, 153)    # #34D399 Emerald Green
TEXT_GOLD = RGBColor(251, 191, 36)     # #FBBF24 Amber Gold
TEXT_ROSE = RGBColor(244, 114, 182)    # #F472B6 Rose Pink
ACCENT_BLUE = RGBColor(2, 132, 199)    # #0284C7 Primary Blue
ACCENT_GREEN = RGBColor(5, 150, 105)   # #059669 Primary Green

def build_driver_presentation(output_path="TrackPoint_Driver_Portal_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def add_slide_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, category, title, subtitle=None):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_c = cat_box.text_frame
        tf_c.word_wrap = True
        p_c = tf_c.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = TEXT_CYAN
        p_c.font.name = "Arial"

        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.55))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(21)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.font.name = "Arial"

        if subtitle:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.25), Inches(11.7), Inches(0.4))
            tf_s = sub_box.text_frame
            tf_s.word_wrap = True
            p_s = tf_s.paragraphs[0]
            p_s.text = subtitle
            p_s.font.size = Pt(11)
            p_s.font.color.rgb = TEXT_MUTED
            p_s.font.name = "Arial"

    def add_card(slide, left, top, width, height, bg_color=BG_CARD, border_color=BORDER_MUTED):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: Title Slide (Driver Mobile Handset)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s1)
    add_card(s1, 1.0, 1.0, 11.333, 5.5, BG_CARD, BORDER_BLUE)

    tbox1 = s1.shapes.add_textbox(Inches(1.5), Inches(1.4), Inches(10.333), Inches(4.7))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "TRACKPOINT MOBILE PLATFORM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf1.add_paragraph()
    p.text = "Driver Mobile Handset & In-Cab Portal"
    p.font.size = Pt(30)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf1.add_paragraph()
    p.text = "Offline-First e-POD Glass Signing, NHVR Fatigue Diary & Stuart Highway Navigation"
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = TEXT_GOLD

    p = tf1.add_paragraph()
    p.text = "\n• Primary Persona: Dave Miller — Senior Linehaul Driver (Truck #NL-14, Mack Titan 85t GCM)\n" \
             "• Operational Environment: 1,500km Stuart Highway, 45°C Sun Glare, Remote Cellular Blackspots\n" \
             "• Core Capabilities: HTML5 Signature Canvas, LocalStorage Buffering, Manifest Queue, NHVR Rest Countdown\n" \
             "• Live Production Handset: https://trackpoint-platform.vercel.app/driver"
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: Driver Persona & Outback Operating Environment
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s2)
    add_header(s2, "Outback Driver Profile", "Who Uses the Driver Handset & What Are Their Operating Conditions?",
               "Piloting 85-tonne multi-combination road trains across 1,500km of remote highway")

    # Left: Persona Card
    add_card(s2, 0.8, 1.8, 5.6, 5.0, BG_CARD, BORDER_BLUE)
    tb2_l = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.6))
    tf2_l = tb2_l.text_frame
    tf2_l.word_wrap = True

    p = tf2_l.paragraphs[0]
    p.text = "🚛 Primary Persona: Dave Miller"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf2_l.add_paragraph()
    p.text = "Vehicle: Mack Titan 685hp Tri-Drive (Truck #NL-14)\nConfiguration: Triple Road Train (85t GCM, 53.5m Length)\nRoute: Darwin ↔ Katherine ↔ Tennant Creek ↔ Alice Springs"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_CYAN

    p = tf2_l.add_paragraph()
    p.text = "\nDaily Operational Realities:\n" \
             "• Drives up to 12 hours a day across extreme outback heat (45°C).\n" \
             "• Navigates hundreds of kilometers between roadhouses with zero cellular reception.\n" \
             "• Unloads multi-ton manifests across mine sites, cattle stations, and hospital clinics.\n" \
             "• Operates mobile handset with heavy work gloves in direct cockpit sun glare."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Right: Environmental Hazards
    add_card(s2, 6.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_MUTED)
    tb2_r = s2.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf2_r = tb2_r.text_frame
    tf2_r.word_wrap = True

    p = tf2_r.paragraphs[0]
    p.text = "🏜️ Outback In-Cab Challenges"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf2_r.add_paragraph()
    p.text = "Why Standard Mobile Apps Failed in the NT:"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    p = tf2_r.add_paragraph()
    p.text = "\n1. Complete Cellular Dead-Zones:\n   Standard cloud apps freeze and wipe unsaved data when leaving cell tower range.\n\n" \
             "2. Severe Sun Glare & Work Gloves:\n   Delicate desktop-style buttons are impossible to tap with dusty rigger gloves in 45°C sun.\n\n" \
             "3. Paper Docket Loss (6.5%):\n   Carbon-copy slips get oil-stained, blown out of truck cabs, or signed with illegible scrawls."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 3: Legacy In-Cab Pain Points Solved
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s3)
    add_header(s3, "Driver Pain Points", "The 4 In-Cab Operational Headaches Solved by TrackPoint",
               "Replacing paper logbooks and broken apps with a rugged, offline-first digital handset")

    pains = [
        ("1. Dead-Zone App Freezes", "Zero 4G in Outback Blackspots", "Standard logistics apps crash in outback signal blackspots, forcing drivers to revert to messy manual paperwork.", TEXT_ROSE),
        ("2. Lost & Soiled Paper Dockets", "6.5% POD Loss & Disputes", "Paper delivery slips get oil-soaked, lost in sleeper cabs, or signed with illegible scrawls that clients dispute.", TEXT_ROSE),
        ("3. Manual Paper Logbooks", "Complex NHVR Rest Calculations", "Drivers had to calculate complex 5.25h work / 15m rest rules by hand, risking heavy fines during police road checks.", TEXT_GOLD),
        ("4. Roadhouse Decoupling Confusion", "Axle Load Mismanagement", "Unloading multi-combination trailers without clear run-sheets caused axle weight imbalances and dangerous road sway.", TEXT_GOLD)
    ]

    for idx, (title, sub, desc, col) in enumerate(pains):
        x = 0.8 + (idx % 2) * 6.0
        y = 1.8 + (idx // 2) * 2.6
        add_card(s3, x, y, 5.7, 2.3, BG_CARD, BORDER_MUTED)
        tb = s3.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = sub.upper()
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_CYAN

        p = tf.add_paragraph()
        p.text = desc
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 4: Driver Handset Navigation & Design Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s4)
    add_header(s4, "In-Cab Handset Architecture", "Driver Mobile UI & Navigation Structure",
               "High-contrast, glove-friendly mobile architecture built with Vanilla CSS and HTML5 Canvas")

    menus = [
        ("1. Active Drop & e-POD", "/driver/active", "In-cab terminal, HTML5 touch drawing canvas, and dead-zone local storage buffer.", TEXT_GREEN),
        ("2. Manifest Queue", "/driver/manifest", "Sequential Stuart Highway run-sheet, pallet weights & trailer position tags.", TEXT_CYAN),
        ("3. Corridor GPS Map", "/driver/navigation", "High-contrast map marking decoupling pads, fuel roadhouses & flood detours.", TEXT_GOLD),
        ("4. Fatigue & Safety", "/driver/safety", "NHVR 5.25h rest countdown clock, daily pre-start circle-check & incident logger.", TEXT_ROSE)
    ]

    for idx, (title, route, desc, col) in enumerate(menus):
        x = 0.8 + idx * 2.95
        add_card(s4, x, 1.8, 2.8, 5.0, BG_CARD, BORDER_MUTED)
        tb = s4.shapes.add_textbox(Inches(x + 0.15), Inches(2.0), Inches(2.5), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = route
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p = tf.add_paragraph()
        p.text = f"\n{desc}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED

        p = tf.add_paragraph()
        p.text = "\n\nIn-Cab Design:\n• Oversized Touch Targets\n• Sunlight-Readable CSS\n• Zero-Lag Touch Pad"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_CYAN

    # =========================================================================
    # SLIDE 5: Screen 1 — Active Drop & e-POD Signature Workflow (/driver/active)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s5)
    add_header(s5, "Screen Walkthrough 1", "Active Drop & HTML5 Glass Signature Workflow (/driver/active)",
               "Capturing legally binding proof of delivery in remote receiving docks (FR-07)")

    add_card(s5, 0.8, 1.8, 6.0, 5.0, BG_CARD, BORDER_BLUE)
    tb5_l = s5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.6), Inches(4.6))
    tf5_l = tb5_l.text_frame
    tf5_l.word_wrap = True

    p = tf5_l.paragraphs[0]
    p.text = "✍️ What That Page Does"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf5_l.add_paragraph()
    p.text = "• Serves as the driver's primary tool for completing freight dropoffs.\n" \
             "• Displays active drop details: customer name, destination, manifest goods, and weight.\n" \
             "• Hosts the HTML5 Touch Drawing Canvas (<canvas>) for digital glass signing.\n" \
             "• Captures recipient's full printed name and optional employee badge ID.\n" \
             "• Encodes signature into a high-resolution PNG data URL with UTC timestamp."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    p = tf5_l.add_paragraph()
    p.text = "\n👀 What to Expect on Screen"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf5_l.add_paragraph()
    p.text = "• Ultra-clean signature drawing pad with 'Clear' and 'Confirm' buttons.\n" \
             "• High-contrast green button: 'Complete Drop & Generate e-POD'."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED

    add_card(s5, 7.1, 1.8, 5.4, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb5_r = s5.shapes.add_textbox(Inches(7.3), Inches(2.0), Inches(5.0), Inches(4.6))
    tf5_r = tb5_r.text_frame
    tf5_r.word_wrap = True

    p = tf5_r.paragraphs[0]
    p.text = "⚡ Lifecycle Bridge: Stage 4 ➔ Stage 5"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf5_r.add_paragraph()
    p.text = "Transforming Physical Handover to Immediate Invoicing:"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_GOLD

    p = tf5_r.add_paragraph()
    p.text = "\n1. 100% Elimination of Lost Paper Dockets:\n   Zero paper slips to carry, lose, or soil.\n\n" \
             "2. Instant Invoicing Trigger:\n   Commits the e-POD payload to MongoDB, instantly firing automated tax invoice generation.\n\n" \
             "3. 3-Way Reconciliation:\n   Embeds the signature directly into the PDF invoice for instant customer payment."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 6: Screen 2 — Outback Offline Dead-Zone Simulator & Local Buffering
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s6)
    add_header(s6, "Screen Walkthrough 2", "Outback Offline Dead-Zone Buffering & Simulator",
               "LocalStorage and IndexedDB local caching guaranteeing zero data loss in signal blackspots (NFR-04)")

    add_card(s6, 0.8, 1.8, 11.733, 5.0, BG_CARD, BORDER_BLUE)
    tb6 = s6.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.6))
    tf6 = tb6.text_frame
    tf6.word_wrap = True

    p = tf6.paragraphs[0]
    p.text = "📡 How TrackPoint Conquers Outback Cellular Blackspots"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf6.add_paragraph()
    p.text = "• The Offline Problem: Hundreds of kilometers between roadhouses on the Stuart Highway have zero 4G/5G reception.\n" \
             "• Client-Side State Interceptor: The driver handset monitors navigator.onLine and includes an interactive 'Simulate Outback Offline Dead-Zone' toggle.\n" \
             "• Local Storage Buffer: When offline, drawn signatures, signee names, and UTC timestamps are serialized and buffered securely into browser LocalStorage / IndexedDB.\n" \
             "• Zero App Crashes: Drivers can inspect cargo manifests and capture signatures without an active internet connection.\n" \
             "• Background Auto-Sync: The moment the vehicle enters 4G coverage or depot Wi-Fi, a background worker pushes buffered payloads to PUT /api/jobs/[id] in MongoDB Atlas.\n" \
             "• Lifecycle Value: Guarantees 0% data loss and uninterrupted operations in Australia's most remote outstations."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 7: Screen 3 — My Manifest Queue (/driver/manifest)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s7)
    add_header(s7, "Screen Walkthrough 3", "My Daily Manifest Queue & Run-Sheet (/driver/manifest)",
               "Sequential drop management preventing road train axle load imbalances")

    add_card(s7, 0.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_BLUE)
    tb7_l = s7.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf7_l = tb7_l.text_frame
    tf7_l.word_wrap = True

    p = tf7_l.paragraphs[0]
    p.text = "📋 What That Page Does"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf7_l.add_paragraph()
    p.text = "• Displays Dave Miller's sequential daily run-sheet across the Stuart Highway.\n" \
             "• Lists sequential drops: Drop 1 (Katherine Mining), Drop 2 (Mataranka Fuel), Drop 3 (Tennant Creek), Drop 4 (Alice Springs).\n" \
             "• Details individual pallet weights, gross tonnes, and dangerous goods placards.\n" \
             "• Allows driver to tap any queued consignment to load it into active navigation."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    add_card(s7, 6.8, 1.8, 5.733, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb7_r = s7.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.6))
    tf7_r = tb7_r.text_frame
    tf7_r.word_wrap = True

    p = tf7_r.paragraphs[0]
    p.text = "⚖️ Road Train Mass Management"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf7_r.add_paragraph()
    p.text = "Lifecycle Phase: Stage 2 Staging & Stage 3 Linehaul\n\n" \
             "• Trailer Position Tracking: Maps cargo to Lead A-Trailer, B-Trailer, or Dog C-Trailer.\n\n" \
             "• Prevents Axle Imbalances: Ensures sequential unloading does not leave rear trailers dangerously overloaded.\n\n" \
             "• Lifecycle Value: Prevents dangerous trailer sway, rollover risk, and $10,000+ NHVR mass overload fines."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 8: Screen 4 — Stuart Highway Corridor Map (/driver/navigation)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s8)
    add_header(s8, "Screen Walkthrough 4", "Stuart Highway Corridor Navigation (/driver/navigation)",
               "Heavy-vehicle navigation highlighting road train decoupling pads and 24h fuel stops")

    add_card(s8, 0.8, 1.8, 11.733, 5.0, BG_CARD, BORDER_BLUE)
    tb8 = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.6))
    tf8 = tb8.text_frame
    tf8.word_wrap = True

    p = tf8.paragraphs[0]
    p.text = "🗺️ Outback-Specific Heavy Vehicle Navigation"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf8.add_paragraph()
    p.text = "• Stuart Highway Corridor Waypoints: Darwin Berrimah ➔ Adelaide River ➔ Katherine ➔ Mataranka ➔ Daly Waters ➔ Tennant Creek ➔ Barrow Creek ➔ Alice Springs.\n\n" \
             "• Road Train Decoupling Pads: Highlights approved locations where drivers can legally break down triple road trains into singles before entering regional townships.\n\n" \
             "• Heavy Rig Rest Areas: Marks 24-hour diesel refueling facilities and high-capacity truck parking bays.\n\n" \
             "• Wet-Season Hazard Overlays: Visual warnings for monsoonal river flooding, bushfire detours, and wandering cattle hazards.\n\n" \
             "• Lifecycle Value: Enhances driver situational awareness and ensures rigs never run out of diesel on 400km unserviced stretches."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 9: Screen 5 — Fatigue Clock & Pre-Start Safety (/driver/safety)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s9)
    add_header(s9, "Screen Walkthrough 5", "Fatigue Clock & Rig Safety Checklist (/driver/safety)",
               "Automated NHVR work/rest compliance and digital pre-trip mechanical circle-checks")

    add_card(s9, 0.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_BLUE)
    tb9_l = s9.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf9_l = tb9_l.text_frame
    tf9_l.word_wrap = True

    p = tf9_l.paragraphs[0]
    p.text = "⏱️ NHVR Electronic Fatigue Clock"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf9_l.add_paragraph()
    p.text = "• Standard Hours Countdown: Tracks remaining driving time before mandatory rest.\n\n" \
             "• 5.25h / 15m Rule Enforcement: Counts down the mandatory 15-minute rest break required after every 5 hours 15 minutes of continuous driving.\n\n" \
             "• 12-Hour Daily Cap: Alerts driver and Darwin Ops Control when approaching maximum legal daily shift limits."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    add_card(s9, 6.8, 1.8, 5.733, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb9_r = s9.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.6))
    tf9_r = tb9_r.text_frame
    tf9_r.word_wrap = True

    p = tf9_r.paragraphs[0]
    p.text = "🔍 Pre-Start Mechanical Check"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf9_r.add_paragraph()
    p.text = "• Mandatory Circle-Check: Digital sign-off covering prime mover brakes, steering, tires, trailer kingpin couplings, and air lines.\n\n" \
             "• Reefer Temp Validation: Validates refrigerated unit setpoints (-18°C / +4°C) before departure.\n\n" \
             "• Mobile Incident Logger: Direct mobile submission of mechanical defects or animal strikes to Darwin maintenance."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 10: Quantified Driver & Safety Impact
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s10)
    add_header(s10, "Driver Impact & Transformation", "Measurable Operational Transformation in the Cockpit",
               "Empowering drivers with digital simplicity, fault tolerance, and airtight safety compliance")

    metrics = [
        ("Lost POD Dockets", "6.5% Lost/Soiled", "0.0% Lost (Glass e-POD)", "100% Clean Proof of Delivery", TEXT_GREEN),
        ("Outstation Reliability", "App Crashes in Dead-Zones", "Offline Buffer Active", "Zero Data Loss Anywhere", TEXT_CYAN),
        ("Fatigue Compliance", "Paper Logbook Errors", "Automated NHVR Clock", "100% Legal CoR Adherence", TEXT_GOLD),
        ("Drop-Off Time", "15 Min Paper Search", "< 2 Min Glass Sign-Off", "- 86% Handover Friction", TEXT_GREEN)
    ]

    for idx, (metric, before, after, gain, col) in enumerate(metrics):
        x = 0.8 + (idx % 2) * 6.0
        y = 1.8 + (idx // 2) * 2.6
        add_card(s10, x, y, 5.7, 2.3, BG_CARD, BORDER_MUTED)
        tb = s10.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = metric.upper()
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = TEXT_MUTED

        p = tf.add_paragraph()
        p.text = f"{before}  ➔  {after}"
        p.font.size = Pt(20)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p = tf.add_paragraph()
        p.text = f"Impact: {gain}"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = col

    # =========================================================================
    # SLIDE 11: Live Production Handset Verification
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s11)
    add_header(s11, "Live Driver Handset Demo", "Experience the Live Driver Mobile Handset in Production",
               "Optimized for mobile viewports, touch drawing, and offline dead-zone simulation")

    add_card(s11, 1.0, 1.8, 11.333, 5.0, BG_CARD, BORDER_BLUE)
    tb11 = s11.shapes.add_textbox(Inches(1.3), Inches(2.1), Inches(10.7), Inches(4.4))
    tf11 = tb11.text_frame
    tf11.word_wrap = True

    p = tf11.paragraphs[0]
    p.text = "🚀 Production Endpoints & Live Handset Flow"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf11.add_paragraph()
    p.text = "• Driver Mobile Handset URL: https://trackpoint-platform.vercel.app/driver\n" \
             "• Active Drop & e-POD Pad: https://trackpoint-platform.vercel.app/driver/active\n" \
             "• Manifest Queue Run-Sheet: https://trackpoint-platform.vercel.app/driver/manifest\n" \
             "• Stuart Highway Corridor Navigation: https://trackpoint-platform.vercel.app/driver/navigation\n" \
             "• NHVR Fatigue & Pre-Start Safety: https://trackpoint-platform.vercel.app/driver/safety"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_CYAN

    p = tf11.add_paragraph()
    p.text = "\nRecommended Live Handset Demo Steps:\n" \
             "1. Open /driver/active and click 'Simulate Outback Offline Dead-Zone' to show the red offline mode.\n" \
             "2. Draw a digital signature on the HTML5 touch canvas pad and click 'Complete Drop'.\n" \
             "3. Switch the toggle back to 'Online 4G' to demonstrate instant background sync to MongoDB Atlas."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    prs.save(output_path)
    print(f"[SUCCESS] Driver Presentation generated: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Driver_Portal_Presentation.pptx"
    build_driver_presentation(out_file)
