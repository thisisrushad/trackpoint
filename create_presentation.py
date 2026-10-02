#!/usr/bin/env python3
"""
TrackPoint Enterprise Presentation Generator (.pptx)
Creates a comprehensive, high-design 16:9 widescreen presentation presenting:
- All 6 NorthLine Logistics Services
- Why each was needed & Traditional Industry Pain Points
- Step-by-Step Technical & Business Solutions in TrackPoint
- Full Business Model, Technology Architecture, and Quantified ROI
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# --- Color Palette ---
BG_DARK = RGBColor(11, 19, 32)         # #0B1320 Deep Space Navy
BG_CARD = RGBColor(17, 29, 51)         # #111D33 Container Card Navy
BG_CARD_LIGHT = RGBColor(27, 42, 71)   # #1B2A47 Slightly lighter card
BORDER_BLUE = RGBColor(56, 189, 248)   # #38BDF8 Sky Blue Accent
BORDER_MUTED = RGBColor(51, 65, 85)    # #334155 Border slate
TEXT_WHITE = RGBColor(248, 250, 252)   # #F8FAFC Heading text
TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8 Secondary text
TEXT_CYAN = RGBColor(56, 189, 248)    # #38BDF8 Highlight Cyan
TEXT_GREEN = RGBColor(52, 211, 153)   # #34D399 Emerald Green
TEXT_GOLD = RGBColor(251, 191, 36)    # #FBBF24 Amber Gold
TEXT_ROSE = RGBColor(244, 114, 182)   # #F472B6 Rose Pink
ACCENT_BLUE = RGBColor(2, 132, 199)   # #0284C7 Primary Blue
ACCENT_GREEN = RGBColor(5, 150, 105)  # #059669 Primary Green
ACCENT_GOLD = RGBColor(217, 119, 6)   # #D97706 Primary Gold

def create_presentation(output_path="TrackPoint_Executive_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # Blank slide

    def add_blank_dark_slide():
        slide = prs.slides.add_slide(blank_layout)
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return slide

    def add_header(slide, category, title, subtitle=None):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEXT_CYAN
        p_cat.font.name = "Arial"

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.6))
        tf_t = title_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(22)
        p_t.font.bold = True
        p_t.font.color.rgb = TEXT_WHITE
        p_t.font.name = "Arial"

        if subtitle:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.7), Inches(0.35))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle
            p_sub.font.size = Pt(11)
            p_sub.font.color.rgb = TEXT_MUTED
            p_sub.font.name = "Arial"

    def add_card(slide, left, top, width, height, bg_color=BG_CARD, border_color=BORDER_MUTED):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1)
        return card

    # =========================================================================
    # SLIDE 1: TITLE SLIDE
    # =========================================================================
    s1 = add_blank_dark_slide()
    
    # Decorative accent card behind title
    add_card(s1, Inches(0.8), Inches(1.2), Inches(11.733), Inches(5.1), BG_CARD, BORDER_BLUE)
    
    # Badge
    b_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.6), Inches(10.5), Inches(0.4))
    p_b = b_box.text_frame.paragraphs[0]
    p_b.text = "ENTERPRISE FLEET TELEMATICS & FREIGHT PLATFORM  •  NORTHERN TERRITORY"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = TEXT_CYAN

    # Title
    t_box = s1.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.5), Inches(1.2))
    p_t = t_box.text_frame.paragraphs[0]
    p_t.text = "TrackPoint"
    p_t.font.size = Pt(44)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE

    # Subtitle
    st_box = s1.shapes.add_textbox(Inches(1.2), Inches(3.3), Inches(10.5), Inches(0.8))
    p_st = st_box.text_frame.paragraphs[0]
    p_st.text = "A Configured Cloud Platform for NorthLine Freight & Logistics\nAutomated Dispatch • 15s Stuart Hwy Telematics • Offline e-POD • Instant Invoicing"
    p_st.font.size = Pt(16)
    p_st.font.color.rgb = TEXT_MUTED

    # 3 Stat Pills on Cover
    p1 = add_card(s1, Inches(1.2), Inches(4.5), Inches(3.2), Inches(1.2), BG_CARD_LIGHT, BORDER_MUTED)
    tb1 = s1.shapes.add_textbox(Inches(1.3), Inches(4.6), Inches(3.0), Inches(1.0))
    p = tb1.text_frame.paragraphs[0]
    p.text = "35 Heavy Vehicles"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_GREEN
    p2 = tb1.text_frame.add_paragraph()
    p2.text = "Road trains, reefers, tankers"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_MUTED

    p2_c = add_card(s1, Inches(4.7), Inches(4.5), Inches(3.2), Inches(1.2), BG_CARD_LIGHT, BORDER_MUTED)
    tb2 = s1.shapes.add_textbox(Inches(4.8), Inches(4.6), Inches(3.0), Inches(1.0))
    p = tb2.text_frame.paragraphs[0]
    p.text = "1,500 km Corridor"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_CYAN
    p2 = tb2.text_frame.add_paragraph()
    p2.text = "Darwin ↔ Alice Springs"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_MUTED

    p3_c = add_card(s1, Inches(8.2), Inches(4.5), Inches(3.8), Inches(1.2), BG_CARD_LIGHT, BORDER_MUTED)
    tb3 = s1.shapes.add_textbox(Inches(8.3), Inches(4.6), Inches(3.6), Inches(1.0))
    p = tb3.text_frame.paragraphs[0]
    p.text = "0s Instant Billing"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_GOLD
    p2 = tb3.text_frame.add_paragraph()
    p2.text = "e-POD triggered ATO invoicing"
    p2.font.size = Pt(10)
    p2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: EXECUTIVE SUMMARY & BUSINESS CONTEXT
    # =========================================================================
    s2 = add_blank_dark_slide()
    add_header(s2, "1. Executive Overview", "The Northern Territory Logistics Landscape", "Understanding NorthLine's operational footprint across Australia's most demanding freight corridor.")
    
    # 3 Column Cards
    col_w = Inches(3.7)
    gap = Inches(0.3)
    
    # Col 1: Geography & Corridor
    c1 = add_card(s2, Inches(0.8), Inches(1.8), col_w, Inches(5.0))
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), col_w - Inches(0.4), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "📍 The Stuart Hwy Corridor"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_CYAN
    
    bullets1 = [
        "1,500 km vital supply artery connecting Darwin, Katherine, Tennant Creek, and Alice Springs.",
        "Lifeline for regional mining basins, pastoral stations, indigenous communities, and defense ports.",
        "Extreme environmental hurdles: 40°C+ heat, monsoonal wet seasons, outstation connectivity dead-zones.",
        "Demands heavy multi-combination road trains (85t GCM) operating under strict HVNL safety regulations."
    ]
    for b in bullets1:
        p = tf.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # Col 2: The Core Business
    c2 = add_card(s2, Inches(0.8) + col_w + gap, Inches(1.8), col_w, Inches(5.0))
    tb = s2.shapes.add_textbox(Inches(1.0) + col_w + gap, Inches(2.0), col_w - Inches(0.4), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🚛 NorthLine Fleet & Depots"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_GREEN

    bullets2 = [
        "35 Commercial Heavy Vehicles: Prime movers, refrigerated reefers, bulk tankers, and metro rigid units.",
        "4 Strategic Logistics Depots: Darwin Head Depot (120 Berrimah Rd), Katherine, Tennant Creek, Alice Springs.",
        "Serving multi-million dollar B2B contracts across mining, agriculture, healthcare, and retail grocery.",
        "Handles over 1,200 commercial consignments monthly across the Top End and Red Centre."
    ]
    for b in bullets2:
        p = tf.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # Col 3: The Mission
    c3 = add_card(s2, Inches(0.8) + (col_w + gap)*2, Inches(1.8), col_w, Inches(5.0))
    tb = s2.shapes.add_textbox(Inches(1.0) + (col_w + gap)*2, Inches(2.0), col_w - Inches(0.4), Inches(4.6))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🎯 The Digital Imperative"
    p.font.bold = True
    p.font.size = Pt(15)
    p.font.color.rgb = TEXT_GOLD

    bullets3 = [
        "Eliminate legacy paper manifests, lost dockets, and manual phone-based dispatch queues.",
        "Provide enterprise shippers 100% live GPS transparency down the Stuart Highway.",
        "Equip drivers with offline digital sign-off tools that never crash in outstation dead-zones.",
        "Achieve same-day billing cash flow through automated e-POD triggered tax invoices."
    ]
    for b in bullets3:
        p = tf.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    # =========================================================================
    # SLIDE 3: TRADITIONAL INDUSTRY PAIN POINTS
    # =========================================================================
    s3 = add_blank_dark_slide()
    add_header(s3, "2. Problem Statement", "The 4 Critical Operational Bottlenecks", "Legacy freight systems crippled visibility, slowed cash flow, and increased compliance risk.")

    card_w = Inches(5.7)
    card_h = Inches(2.35)
    
    # Pain 1
    add_card(s3, Inches(0.8), Inches(1.8), card_w, card_h)
    tb = s3.shapes.add_textbox(Inches(1.0), Inches(1.9), card_w - Inches(0.4), card_h - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🚨 Pain Point 1: Stuart Highway Blind Spots"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_ROSE
    p = tf.add_paragraph()
    p.text = "Once freight departed Darwin, clients and dispatchers had zero real-time visibility for 15+ hours. Shippers called dispatch desks repeatedly for ETAs, causing customer frustration and poor dock scheduling."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(4)

    # Pain 2
    add_card(s3, Inches(6.8), Inches(1.8), card_w, card_h)
    tb = s3.shapes.add_textbox(Inches(7.0), Inches(1.9), card_w - Inches(0.4), card_h - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "⏱️ Pain Point 2: 45-Minute Manual Dispatch Latency"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_ROSE
    p = tf.add_paragraph()
    p.text = "Dispatchers manually matched consignments to drivers using memory, spreadsheets, and whiteboard tags. Uneven truck utilization left trailers running half-empty while emergency hot-shots were delayed."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(4)

    # Pain 3
    add_card(s3, Inches(0.8), Inches(4.35), card_w, card_h)
    tb = s3.shapes.add_textbox(Inches(1.0), Inches(4.45), card_w - Inches(0.4), card_h - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "📵 Pain Point 3: Remote Outstation Cellular Dead-Zones"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_ROSE
    p = tf.add_paragraph()
    p.text = "Standard cloud apps crashed when drivers entered remote outstations between Katherine and Tennant Creek. Drivers reverted to paper dockets that got oil-stained, lost in cabs, or illegibly signed."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(4)

    # Pain 4
    add_card(s3, Inches(6.8), Inches(4.35), card_w, card_h)
    tb = s3.shapes.add_textbox(Inches(7.0), Inches(4.45), card_w - Inches(0.4), card_h - Inches(0.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "💸 Pain Point 4: 14-Day Delayed Billing & High DSO"
    p.font.bold = True
    p.font.size = Pt(13)
    p.font.color.rgb = TEXT_ROSE
    p = tf.add_paragraph()
    p.text = "Finance could not invoice clients until the physical paper POD returned to Darwin headquarters 14 days later. Disputed deliveries delayed payments, creating severe cash flow drag and high DSO."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED
    p.space_before = Pt(4)

    # =========================================================================
    # SLIDE 4: THE TRACKPOINT SOLUTION & ARCHITECTURE
    # =========================================================================
    s4 = add_blank_dark_slide()
    add_header(s4, "3. Platform Solution", "The TrackPoint Cloud Ecosystem", "A unified, role-isolated architecture designed for high resilience and automated freight orchestration.")

    # 4 Portal Columns
    p_w = Inches(2.8)
    p_gap = Inches(0.18)
    
    portals = [
        ("B2B Customer Portal", "/customer", TEXT_CYAN, [
            "Self-service multi-tier booking",
            "15s live Stuart Hwy GPS map",
            "5-stage milestone chain of custody",
            "1-click tax invoice & e-POD PDF"
        ]),
        ("Operations Control", "/admin", TEXT_GREEN, [
            "35 heavy vehicles CAN-bus map",
            "Telematics nearest-vehicle queue",
            "Manual dispatch override modal",
            "Real-time SLA analytics & charts"
        ]),
        ("Driver Mobile Handset", "/driver", TEXT_GOLD, [
            "Glove-friendly card manifest",
            "Offline touch signature canvas",
            "IndexedDB local storage buffer",
            "Auto-sync on cellular reconnect"
        ]),
        ("Finance & Invoicing", "/admin (Invoices)", TEXT_ROSE, [
            "Instant e-POD triggered billing",
            "ATO 10% GST & ABN compliance",
            "Enterprise credit terms (14/30d)",
            "7-year statutory audit archiving"
        ])
    ]

    for i, (p_title, p_route, p_color, p_items) in enumerate(portals):
        left_pos = Inches(0.8) + i * (p_w + p_gap)
        add_card(s4, left_pos, Inches(1.8), p_w, Inches(5.0), BG_CARD, p_color)
        tb = s4.shapes.add_textbox(left_pos + Inches(0.15), Inches(2.0), p_w - Inches(0.3), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = p_color

        p_sub = tf.add_paragraph()
        p_sub.text = f"Route: {p_route}"
        p_sub.font.size = Pt(9)
        p_sub.font.color.rgb = TEXT_MUTED

        for item in p_items:
            p_it = tf.add_paragraph()
            p_it.text = "✓ " + item
            p_it.font.size = Pt(10)
            p_it.font.color.rgb = TEXT_WHITE
            p_it.space_before = Pt(8)

    # =========================================================================
    # SLIDE 5: OVERVIEW OF THE 6 NORTHLINE SERVICES
    # =========================================================================
    s5 = add_blank_dark_slide()
    add_header(s5, "4. Service Portfolio", "NorthLine's 6 Specialized Logistics Services", "Custom-engineered transport solutions covering industrial, medical, agricultural, and port freight.")

    services_grid = [
        ("1. Scheduled Linehaul", "Darwin ↔ Alice Springs corridor with scheduled departures and 5-stage tracking.", TEXT_CYAN),
        ("2. Express Hot-Shot", "Emergency same-day breakdown courier for mining and maritime operations.", TEXT_GOLD),
        ("3. Cold-Chain Logistics", "HACCP-grade climate-controlled reefer freight for fresh produce and perishables.", TEXT_GREEN),
        ("4. Heavy Mining & Pastoral", "Multi-combination road trains (85t GCM) for heavy machinery and cattle freight.", TEXT_ROSE),
        ("5. Dangerous Goods & Medical", "Classified chemical and pharmaceutical transport with unbroken chain-of-custody.", TEXT_CYAN),
        ("6. Metro Container & Port", "Fast East Arm Wharf intermodal drayage and Berrimah depot container staging.", TEXT_GREEN),
    ]

    card_w5 = Inches(3.7)
    card_h5 = Inches(2.35)

    for i, (s_title, s_desc, s_color) in enumerate(services_grid):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8) + col * (card_w5 + Inches(0.3))
        c_top = Inches(1.8) + row * (card_h5 + Inches(0.2))
        
        add_card(s5, c_left, c_top, card_w5, card_h5)
        tb = s5.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.2), card_w5 - Inches(0.4), card_h5 - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p = tf.paragraphs[0]
        p.text = s_title
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = s_color

        p_desc = tf.add_paragraph()
        p_desc.text = s_desc
        p_desc.font.size = Pt(10)
        p_desc.font.color.rgb = TEXT_MUTED
        p_desc.space_before = Pt(6)

        p_badge = tf.add_paragraph()
        p_badge.text = "⚡ Fully Automated in TrackPoint"
        p_badge.font.size = Pt(9)
        p_badge.font.bold = True
        p_badge.font.color.rgb = TEXT_WHITE
        p_badge.space_before = Pt(8)

    # =========================================================================
    # SLIDES 6 TO 11: DEEP DIVES INTO EACH OF THE 6 SERVICES
    # =========================================================================
    service_deep_dives = [
        {
            "num": "Service 01",
            "title": "Scheduled Linehaul Freight",
            "subtitle": "Stuart Highway 1,500km Linehaul Corridor (Darwin ↔ Katherine ↔ Tennant ↔ Alice)",
            "why_needed": [
                "The Stuart Highway is the sole land freight route connecting Top End regional centers.",
                "Regional communities depend on twice-weekly consolidated general cargo deliveries.",
                "High operating costs require maximum trailer payload consolidation to maintain margin."
            ],
            "pain_points": [
                "15-hour transit blind spots caused massive dispatch phone inquiries from anxious receivers.",
                "Receiving warehouses had no accurate arrival time, resulting in idle forklift crews.",
                "Paper manifests were frequently damaged or lost during multi-day outstation road train runs."
            ],
            "solution_steps": [
                "1. Customer books online; system calculates rate based on corridor distance and mass.",
                "2. Dispatcher reviews multi-combination road train allocation in Admin Console.",
                "3. 15s Leaflet GPS telemetry plots vehicle speed (88 km/h) and Stuart Hwy coordinates.",
                "4. 5-Stage milestone chain automatically updates from departure to regional depot staging.",
                "5. Driver completes digital e-POD sign-off at destination dock."
            ],
            "accent": TEXT_CYAN
        },
        {
            "num": "Service 02",
            "title": "Express Hot-Shot Same-Day Courier",
            "subtitle": "Urgent Emergency Industrial & Mining Breakdown Dispatch",
            "why_needed": [
                "Unplanned mining shutdowns (e.g. excavator hydraulic failure) cost up to $50,000 AUD/hour.",
                "Emergency vessel propulsion spares required urgent wharf-to-dock transport in Darwin Port.",
                "Time-critical cargo requires immediate vehicle preemption rather than waiting for scheduled runs."
            ],
            "pain_points": [
                "Standard freight booking took 2–4 hours just to get dispatch confirmation and vehicle assignment.",
                "No live expedited tracking to confirm whether the hot-shot driver had actually departed.",
                "Emergency rate surcharges were disputed after delivery without clear priority timestamp logs."
            ],
            "solution_steps": [
                "1. User selects 'Express Hot-Shot'; system flags order with high-priority visual tag (⚡).",
                "2. Telematics engine locates nearest available dedicated courier van or rigid truck in < 5s.",
                "3. SMS dispatch alert simulated instantly to site supervisor with live tracking URL.",
                "4. Live map displays vehicle speed and uninterrupted transit route directly to the mine site.",
                "5. Priority delivery verified by timestamped receiver signature."
            ],
            "accent": TEXT_GOLD
        },
        {
            "num": "Service 03",
            "title": "Refrigerated & Cold-Chain Logistics",
            "subtitle": "HACCP-Compliant Perishable Produce, Meat & Vaccine Transport",
            "why_needed": [
                "Northern Territory produces high-value horticultural exports (Katherine mangoes, melon crops).",
                "Stuart Highway outback heat regularly exceeds 42°C, risking catastrophic thermal degradation.",
                "Export buyers and health authorities enforce mandatory strict unbroken temperature logs."
            ],
            "pain_points": [
                "Manual paper temperature logs were vulnerable to falsification or missed check times.",
                "Standard dispatchers sometimes mistakenly assigned dry freight trailers to perishable cargo.",
                "Cargo spoilage claims created severe disputes between farmers, carriers, and insurers."
            ],
            "solution_steps": [
                "1. Shipper selects Cold-Chain tier and inputs required temperature range (+2°C to +4°C).",
                "2. System automatically restricts dispatch eligibility exclusively to certified reefer units.",
                "3. Vehicle CAN-bus telematics monitors refrigeration setpoint and engine running status.",
                "4. Driver captures digital e-POD with temperature verification check upon dock handover.",
                "5. Tax invoice and compliance audit generated with unbroken cold-chain pedigree."
            ],
            "accent": TEXT_GREEN
        },
        {
            "num": "Service 04",
            "title": "Heavy Machinery & Pastoral Bulk Transport",
            "subtitle": "Multi-Combination Road Trains (up to 85t GCM) for Mining & Livestock",
            "why_needed": [
                "Top End mining basins (e.g., McArthur River) require multi-tonne slurry pumps and plant parts.",
                "Pastoral cattle stations require multi-deck road trains for livestock rations and fencing supplies.",
                "Oversized transport must strictly obey National Heavy Vehicle Regulator (NHVR) mass limits."
            ],
            "pain_points": [
                "Axle overload violations carried heavy NHVR fines (up to $10,000+) and safety demerits.",
                "Inaccurate tare weight estimates led to road trains breaking down on steep outback inclines.",
                "Manual trailer coupling checks were difficult to track across regional cross-dock yards."
            ],
            "solution_steps": [
                "1. Shippers input exact tonnage, dimensions, and cargo category (e.g. 14.2t Compressor).",
                "2. Platform algorithm enforces road train / heavy combination vehicle assignment.",
                "3. Admin Console calculates gross combination mass and verifies axle load safety margins.",
                "4. Yard Master confirms lashing inspection at Berrimah staging cross-dock before release.",
                "5. Digital e-POD captures receiver crane unload sign-off."
            ],
            "accent": TEXT_ROSE
        },
        {
            "num": "Service 05",
            "title": "Dangerous Goods (DG) & Medical Logistics",
            "subtitle": "Classified Chemicals, Fuel, Explosives & Cryogenic Vaccines",
            "why_needed": [
                "Mining operations require regular bulk deliveries of cyanides, acids, and blasting agents.",
                "Remote indigenous community clinics depend on cold-chain vaccines and surgical supplies.",
                "Governed by the Australian Dangerous Goods (ADG) Code and strict safety placarding laws."
            ],
            "pain_points": [
                "Transporting DG without verified certified driver licenses risks criminal liability under CoR.",
                "Missing emergency response guides (ERGs) during road accidents endangered first responders.",
                "High risk of theft or diversion without a tamper-evident chain-of-custody audit."
            ],
            "solution_steps": [
                "1. Consignment classified under DG / Medical regulations with ADG class code.",
                "2. System validates that only DG-certified drivers and placarded prime movers can be assigned.",
                "3. Driver mobile handset enforces mandatory identity verification of authorized recipient.",
                "4. Delivery requires full printed recipient name, badge number, and digital touch signature.",
                "5. Audit record locked in MongoDB Atlas under 7-year statutory preservation."
            ],
            "accent": TEXT_CYAN
        },
        {
            "num": "Service 06",
            "title": "Intermodal Port Drayage & Metro Staging",
            "subtitle": "East Arm Wharf Container Logistics & Cross-Dock Staging",
            "why_needed": [
                "East Arm Wharf is Darwin's primary maritime container terminal handling international trade.",
                "Import shipping containers must be de-hired and returned quickly to prevent port demurrage fees.",
                "Berrimah Logistics Precinct acts as the regional consolidation hub for all onward rail/road freight."
            ],
            "pain_points": [
                "Shipping lines charge $250+/day per container for demurrage when turnaround is delayed.",
                "Wharf congestion caused long truck queues and missed time-slot vessel bookings.",
                "Lack of container number tracking between port gates and cross-dock unpacking bays."
            ],
            "solution_steps": [
                "1. Shippers schedule 20ft/40ft container pickup from East Arm Wharf terminal.",
                "2. Dedicated short-haul rigid trucks dispatched to meet specific port vessel time-slots.",
                "3. Status milestones track Wharf Gate-Out, Transit, and Berrimah Depot Gate-In.",
                "4. Cross-dock supervisor confirms destuffing and container return within 4-hour SLA.",
                "5. e-POD confirms shipping line container interchange receipt (EIR)."
            ],
            "accent": TEXT_GREEN
        }
    ]

    for sd in service_deep_dives:
        s = add_blank_dark_slide()
        add_header(s, f"4.{sd['num']}", sd["title"], sd["subtitle"])

        c_w = Inches(3.7)
        c_h = Inches(5.0)

        # Col 1: Why Needed
        add_card(s, Inches(0.8), Inches(1.8), c_w, c_h)
        tb = s.shapes.add_textbox(Inches(1.0), Inches(2.0), c_w - Inches(0.4), c_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "🎯 Why It Was Needed"
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = sd["accent"]
        for b in sd["why_needed"]:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_WHITE
            p.space_before = Pt(8)

        # Col 2: The Pain Point
        add_card(s, Inches(0.8) + c_w + Inches(0.3), Inches(1.8), c_w, c_h)
        tb = s.shapes.add_textbox(Inches(1.0) + c_w + Inches(0.3), Inches(2.0), c_w - Inches(0.4), c_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "🚨 Traditional Pain Point"
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_ROSE
        for b in sd["pain_points"]:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_MUTED
            p.space_before = Pt(8)

        # Col 3: How TrackPoint Solved It
        add_card(s, Inches(0.8) + (c_w + Inches(0.3))*2, Inches(1.8), c_w, c_h)
        tb = s.shapes.add_textbox(Inches(1.0) + (c_w + Inches(0.3))*2, Inches(2.0), c_w - Inches(0.4), c_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "✅ TrackPoint Solution Flow"
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_GREEN
        for b in sd["solution_steps"]:
            p = tf.add_paragraph()
            p.text = b
            p.font.size = Pt(9.5)
            p.font.color.rgb = TEXT_WHITE
            p.space_before = Pt(6)

    # =========================================================================
    # SLIDE 12: THE CONSIGNMENT LIFECYCLE (END-TO-END FLOW)
    # =========================================================================
    s12 = add_blank_dark_slide()
    add_header(s12, "5. Operational Workflow", "End-to-End Consignment Lifecycle", "Chronological 5-stage progression from customer order to cash collection.")

    steps = [
        ("Stage 1: Booking", "Customer creates booking online;\ntelematics calculates closest active truck in corridor.", TEXT_CYAN),
        ("Stage 2: Depot Staging", "Berrimah cross-dock verifies\nfreight manifest, axle loads,\nand loads road train.", TEXT_GREEN),
        ("Stage 3: Stuart Hwy", "15s GPS telematics tracks\nvehicle speed, route milestones,\nand outstation telemetry.", TEXT_GOLD),
        ("Stage 4: Regional Dock", "Vehicle arrives at Katherine /\nAlice Springs regional depot;\ncrew unloads cargo.", TEXT_ROSE),
        ("Stage 5: e-POD & Billing", "Receiver signs digital canvas;\nplatform immediately issues\nATO Tax Invoice PDF.", TEXT_CYAN),
    ]

    step_w = Inches(2.22)
    step_gap = Inches(0.15)

    for i, (st_title, st_desc, st_color) in enumerate(steps):
        s_left = Inches(0.8) + i * (step_w + step_gap)
        add_card(s12, s_left, Inches(1.8), step_w, Inches(5.0), BG_CARD, st_color)
        tb = s12.shapes.add_textbox(s_left + Inches(0.1), Inches(2.0), step_w - Inches(0.2), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"0{i+1}"
        p.font.bold = True
        p.font.size = Pt(28)
        p.font.color.rgb = st_color

        p_t = tf.add_paragraph()
        p_t.text = st_title
        p_t.font.bold = True
        p_t.font.size = Pt(12)
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_before = Pt(4)

        p_d = tf.add_paragraph()
        p_d.text = st_desc
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    # =========================================================================
    # SLIDE 13: TECHNOLOGY ARCHITECTURE & INNOVATION
    # =========================================================================
    s13 = add_blank_dark_slide()
    add_header(s13, "6. Tech Stack & Engineering", "Modern Full-Stack Cloud Architecture", "Built for zero downtime, sub-500ms API response, and 100% serverless compatibility.")

    tech_cols = [
        ("Frontend & UI", TEXT_CYAN, [
            "Next.js 15 App Router",
            "React 19 & TypeScript",
            "Vanilla CSS Design System",
            "Leaflet / OpenStreetMap",
            "Chart.js Telematics Analytics",
            "Lucide-React Modern Icons"
        ]),
        ("Backend & APIs", TEXT_GREEN, [
            "Modular Controller-Service Pattern",
            "Next.js Route Handlers",
            "JWT Authentication (HMAC-SHA256)",
            "Role-Based Access Control (RBAC)",
            "15s Telematics Polling (NFR-02)",
            "RESTful JSON Endpoints"
        ]),
        ("Database & Persistence", TEXT_GOLD, [
            "Prisma ORM (v6.19.3)",
            "MongoDB Atlas Cloud Database",
            "35 Heavy Vehicle Records",
            "10 B2B Enterprise Consignments",
            "4 Australian Tax Invoices",
            "Statutory 7-Year Audit Trail"
        ]),
        ("Mobile & Offline Engine", TEXT_ROSE, [
            "HTML5 Signature Canvas",
            "IndexedDB / LocalStorage Buffering",
            "Offline Mode Detection",
            "Auto-Sync on 4G Reconnect",
            "High-Contrast Sunlit Viewport",
            "Glove-Friendly Touch Actions"
        ])
    ]

    tw = Inches(2.8)
    tgap = Inches(0.18)

    for i, (t_title, t_color, t_items) in enumerate(tech_cols):
        t_left = Inches(0.8) + i * (tw + tgap)
        add_card(s13, t_left, Inches(1.8), tw, Inches(5.0), BG_CARD, t_color)
        tb = s13.shapes.add_textbox(t_left + Inches(0.15), Inches(2.0), tw - Inches(0.3), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = t_title
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = t_color

        for item in t_items:
            p_it = tf.add_paragraph()
            p_it.text = "⚡ " + item
            p_it.font.size = Pt(10)
            p_it.font.color.rgb = TEXT_WHITE
            p_it.space_before = Pt(8)

    # =========================================================================
    # SLIDE 14: QUANTIFIED BUSINESS ROI & MEASURABLE IMPACT
    # =========================================================================
    s14 = add_blank_dark_slide()
    add_header(s14, "7. Business Value & ROI", "Transforming NorthLine's Operational Bottom Line", "Measurable performance benchmarks before vs. after TrackPoint deployment.")

    kpis = [
        ("Dispatch Latency", "45 min", "< 5 sec", "- 99.8%", TEXT_CYAN, "Automated nearest-truck telematics algorithm replaces manual whiteboard dispatching."),
        ("Billing Cycle (DSO)", "14 Days", "Instant (0s)", "- 100%", TEXT_GOLD, "Automated ATO tax invoices generated the exact second driver captures e-POD signature."),
        ("On-Time Delivery SLA", "88.2%", "96.4%", "+ 8.2%", TEXT_GREEN, "Real-time Stuart Hwy speed telemetry & milestone monitoring eliminates outstation delays."),
        ("Lost POD Paper Dockets", "6.5% lost", "0% lost", "Zero Loss", TEXT_ROSE, "Offline HTML5 digital signature canvas completely eliminates lost or soiled dockets.")
    ]

    kw = Inches(2.8)
    kgap = Inches(0.18)

    for i, (k_name, k_before, k_after, k_diff, k_col, k_exp) in enumerate(kpis):
        k_left = Inches(0.8) + i * (kw + kgap)
        add_card(s14, k_left, Inches(1.8), kw, Inches(5.0), BG_CARD, k_col)
        tb = s14.shapes.add_textbox(k_left + Inches(0.15), Inches(2.0), kw - Inches(0.3), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = k_name
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = k_col

        p_bef = tf.add_paragraph()
        p_bef.text = f"Before: {k_before}"
        p_bef.font.size = Pt(10)
        p_bef.font.color.rgb = TEXT_MUTED
        p_bef.space_before = Pt(8)

        p_aft = tf.add_paragraph()
        p_aft.text = f"Now: {k_after}"
        p_aft.font.bold = True
        p_aft.font.size = Pt(18)
        p_aft.font.color.rgb = TEXT_WHITE
        p_aft.space_before = Pt(4)

        p_dif = tf.add_paragraph()
        p_dif.text = f"Impact: {k_diff}"
        p_dif.font.bold = True
        p_dif.font.size = Pt(12)
        p_dif.font.color.rgb = k_col
        p_dif.space_before = Pt(4)

        p_exp = tf.add_paragraph()
        p_exp.text = k_exp
        p_exp.font.size = Pt(9.5)
        p_exp.font.color.rgb = TEXT_MUTED
        p_exp.space_before = Pt(10)

    # =========================================================================
    # SLIDE 15: REGULATORY & AUSTRALIAN COMPLIANCE MATRIX
    # =========================================================================
    s15 = add_blank_dark_slide()
    add_header(s15, "8. Regulatory Governance", "Australian Logistics Compliance Matrix", "Meeting statutory legal standards across road transport, taxation, and data privacy.")

    compliances = [
        ("Heavy Vehicle National Law (HVNL) & CoR", TEXT_CYAN, [
            "Chain of Responsibility (CoR) accountability across consignors, dispatchers, and drivers.",
            "Live telematics speed monitoring against highway speed limits (max 100 km/h for road trains).",
            "Fatigue management rest-break tracking across long 1,500km linehaul runs."
        ]),
        ("Australian Taxation Office (ATO) GST Compliance", TEXT_GOLD, [
            "Automatic computation of 10% Australian Goods and Services Tax (GST) on all freight.",
            "Display of NorthLine Freight ABN (88 123 456 789) on every generated tax invoice.",
            "Corporations Act Section 286 statutory 7-year immutable financial record archiving."
        ]),
        ("Australian Dangerous Goods (ADG) Code", TEXT_ROSE, [
            "Placarding and certification validation before dangerous chemical consignments are dispatched.",
            "Mandatory identity verification and digital sign-off from authorized medical/mine personnel.",
            "Real-time emergency hazardous manifest availability during transit."
        ]),
        ("Australian Privacy Principles (APP) & RBAC", TEXT_GREEN, [
            "Strict Role-Based Access Control (NFR-06) segregating customer, driver, and dispatcher data.",
            "JWT encryption preventing commercial freight pricing exposure to unauthorized parties.",
            "Compliance with Privacy Act 1988 regarding consignee contact information."
        ])
    ]

    cw15 = Inches(5.7)
    ch15 = Inches(2.35)

    for i, (c_title, c_color, c_items) in enumerate(compliances):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8) + col * (cw15 + Inches(0.3))
        c_top = Inches(1.8) + row * (ch15 + Inches(0.2))
        
        add_card(s15, c_left, c_top, cw15, ch15)
        tb = s15.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), cw15 - Inches(0.4), ch15 - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = c_title
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = c_color

        for item in c_items:
            p_it = tf.add_paragraph()
            p_it.text = "• " + item
            p_it.font.size = Pt(9.5)
            p_it.font.color.rgb = TEXT_MUTED
            p_it.space_before = Pt(4)

    # =========================================================================
    # SLIDE 16: CONCLUSION & STRATEGIC ROADMAP
    # =========================================================================
    s16 = add_blank_dark_slide()
    add_header(s16, "9. Summary & Vision", "The Future of Northern Territory Freight", "TrackPoint establishes the digital standard for remote Australian heavy linehaul logistics.")

    add_card(s16, Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0), BG_CARD, BORDER_BLUE)
    
    tb = s16.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.9), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "🏆 Key Takeaways & Enterprise Summary"
    p.font.bold = True
    p.font.size = Pt(18)
    p.font.color.rgb = TEXT_WHITE

    conclusions = [
        ("Unified Ecosystem:", "Eliminated 4 disparate software systems into one seamless Next.js cloud portal.", TEXT_CYAN),
        ("Stuart Hwy Telematics:", "100% visibility of 35 heavy vehicles moving through Darwin, Katherine, Tennant, and Alice Springs.", TEXT_GREEN),
        ("Offline Resilience:", "Drivers never drop offline; digital signatures and manifests buffer seamlessly in outstation dead-zones.", TEXT_GOLD),
        ("Zero Billing Friction:", "Instant ATO-compliant tax invoices eliminate the 14-day DSO cash flow lag.", TEXT_ROSE),
        ("Strategic Next Steps:", "Expanding to predictive AI maintenance, integration with Rail Intermodal, and automated fatigue rest alerts.", TEXT_WHITE)
    ]

    for title, desc, col in conclusions:
        p = tf.add_paragraph()
        p.text = f"• {title} "
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = col
        p.space_before = Pt(10)
        
        # Append description in muted color
        # In python-pptx we can add runs
        # Let's recreate paragraph with runs
        p.text = "" # Clear
        run1 = p.add_run()
        run1.text = f"• {title} "
        run1.font.bold = True
        run1.font.size = Pt(12)
        run1.font.color.rgb = col

        run2 = p.add_run()
        run2.text = desc
        run2.font.bold = False
        run2.font.size = Pt(12)
        run2.font.color.rgb = TEXT_MUTED

    # Save presentation
    prs.save(output_path)
    print(f"[SUCCESS] Presentation generated successfully: {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Executive_Presentation.pptx"
    create_presentation(out)
