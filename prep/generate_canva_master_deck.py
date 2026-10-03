#!/usr/bin/env python3
"""
Generate TrackPoint_Canva_Master_Deck.pptx
Recreating and expanding the user's Canva theme into a complete, 20-slide,
High-Distinction presentation with real web application screenshots,
covering the full lifecycle, enterprise architecture, security, risk contingency,
and business ROI for PRT631 Capstone Examination.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_deck():
    output_path = "prep/TrackPoint_Canva_Master_Deck.pptx"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Exact Canva Color Palette
    DARK_BG = RGBColor(11, 19, 43)        # #0b132b (Canva Deep Dark Navy)
    LIGHT_BG = RGBColor(255, 255, 255)    # #ffffff (Canva Clean White)
    CARD_DARK = RGBColor(22, 34, 58)      # #16223a (Dark card)
    CARD_LIGHT = RGBColor(248, 250, 252)  # #f8fafc (Light slate card)
    CARD_SLATE = RGBColor(51, 65, 85)     # #334155 (Canva slate card)
    
    AMBER = RGBColor(245, 158, 11)        # #f59e0b (Canva Brand Amber/Gold)
    NAVY = RGBColor(15, 23, 42)           # #0f172a (Primary dark navy)
    TEXT_DARK = RGBColor(15, 23, 42)      # #0f172a (Charcoal text)
    TEXT_LIGHT = RGBColor(255, 255, 255)  # White text
    TEXT_MUTED = RGBColor(100, 116, 139)  # #64748b (Muted slate text)
    TEXT_MUTED_LIGHT = RGBColor(148, 163, 184) # #94a3b8
    BORDER_LIGHT = RGBColor(226, 232, 240)# #e2e8f0
    BORDER_DARK = RGBColor(30, 41, 59)
    GREEN = RGBColor(16, 185, 129)        # #10b981 (Success green)

    def set_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, number_str, title_str, dark=False):
        # Number prefix + Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.733), Inches(0.7))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        
        # Number in amber
        p_num = p
        p_num.text = f"{number_str}   "
        p_num.font.size = Pt(15)
        p_num.font.bold = True
        p_num.font.color.rgb = AMBER
        
        run_title = p_num.add_run()
        run_title.text = title_str
        run_title.font.size = Pt(22)
        run_title.font.bold = True
        run_title.font.color.rgb = TEXT_LIGHT if dark else TEXT_DARK
        
        # Canva gold underline bar
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.15), Inches(11.733), Inches(0.04))
        bar.fill.solid()
        bar.fill.fore_color.rgb = AMBER
        bar.line.fill.background()

    def add_card(slide, left, top, width, height, bg_color=CARD_LIGHT, border_color=BORDER_LIGHT):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.2)
        else:
            card.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 1: COVER SLIDE (Canva Dark Split)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    s1.notes_slide.notes_text_frame.text = 'Good day examiners and colleagues. Today, I am proud to present TrackPoint—an enterprise fleet dispatch, Stuart Highway GPS telematics, and automated invoicing platform engineered for NorthLine Freight & Logistics in Darwin. This capstone project addresses the severe operational, geographical, and technological challenges of remote Northern Territory linehaul freight, replacing fragile 1990s paper processes with a unified, offline-first digital architecture.'
    
    set_bg(s1, DARK_BG)
    
    # Category Tag
    tb_cat = s1.shapes.add_textbox(Inches(0.8), Inches(0.9), Inches(5.8), Inches(0.35))
    tf_cat = tb_cat.text_frame
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = "PRT631   /   CAPSTONE EXAMINATION"
    p_cat.font.size = Pt(12)
    p_cat.font.bold = True
    p_cat.font.color.rgb = AMBER
    
    # Gold decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(1.4), Inches(0.06))
    bar.fill.solid()
    bar.fill.fore_color.rgb = AMBER
    bar.line.fill.background()

    # Main Content Box
    tb1 = s1.shapes.add_textbox(Inches(0.8), Inches(1.55), Inches(5.8), Inches(5.2))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    
    p_title = tf1.paragraphs[0]
    p_title.text = "TrackPoint"
    p_title.font.size = Pt(48)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_LIGHT
    
    p_sub = tf1.add_paragraph()
    p_sub.text = "Intelligent Fleet Dispatch, Outback Telematics & Automated Invoicing"
    p_sub.font.size = Pt(18)
    p_sub.font.bold = True
    p_sub.font.color.rgb = RGBColor(226, 232, 240)
    
    p_space = tf1.add_paragraph()
    p_space.text = "\nTarget Organization: NorthLine Freight & Logistics (Darwin, NT)"
    p_space.font.size = Pt(13)
    p_space.font.color.rgb = AMBER
    
    p_meta = tf1.add_paragraph()
    p_meta.text = "Presenter: Mahir Sadman Rushad | Student ID: S395312\nCourse: Master of Information Technology\nInstitution: Charles Darwin University (Casuarina Campus)\nLive App: https://trackpoint-platform.vercel.app"
    p_meta.font.size = Pt(11)
    p_meta.font.color.rgb = TEXT_MUTED_LIGHT
    
    # Right Image: Outback Road Train
    if os.path.exists("prep/assets/road_train_outback.jpg"):
        s1.shapes.add_picture("prep/assets/road_train_outback.jpg", Inches(6.8), Inches(0.8), Inches(5.7), Inches(5.8))

    # =========================================================================
    # SLIDE 2: BUSINESS SETTING & REGIONAL CONTEXT (Canva Light Style)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    s2.notes_slide.notes_text_frame.text = 'To understand the necessity of TrackPoint, we must look at the regional operating environment. NorthLine operates triple road trains hauling up to 85 tonnes along the 1,500-kilometer Stuart Highway corridor between Darwin, Katherine, Alice Springs, and southern intermodal terminals in Sydney and Adelaide. In this harsh environment—marked by tropical monsoonal flooding in the Top End and 45-degree desert heat—equipment downtime at remote iron ore and gold mines costs upwards of $50,000 an hour. Yet over 800 kilometers of this vital route completely lack cellular mobile coverage.'
    
    set_bg(s2, LIGHT_BG)
    add_header(s2, "02", "Business Setting & Regional Context")
    
    tb2 = s2.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(5.6), Inches(5.2))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    
    p = tf2.paragraphs[0]
    p.text = "1,500 km"
    p.font.size = Pt(64)
    p.font.bold = True
    p.font.color.rgb = AMBER
    
    p_sub = tf2.add_paragraph()
    p_sub.text = "A freight corridor where distance, climate and connectivity become severe operational constraints."
    p_sub.font.size = Pt(18)
    p_sub.font.bold = True
    p_sub.font.color.rgb = TEXT_DARK
    
    p_route = tf2.add_paragraph()
    p_route.text = "\nDARWIN  ➔  KATHERINE  ➔  ALICE SPRINGS  ➔  SYDNEY"
    p_route.font.size = Pt(11)
    p_route.font.bold = True
    p_route.font.color.rgb = AMBER
    
    p_body = tf2.add_paragraph()
    p_body.text = "• Extreme Outback Conditions: Tropical wet-season monsoonal flooding in the Top End, 45°C extreme heat, and severe dust storms across the Red Centre.\n• High-Consequence Freight: Solitary lifeline for remote Katherine & Tanami mining basins (where equipment downtime exceeds $50,000/hr), regional hospitals, and cattle stations.\n• Telecommunications Barrier: Over 800 kilometers of the route lack continuous cellular coverage, severing conventional fleet systems."
    p_body.font.size = Pt(12)
    p_body.font.color.rgb = RGBColor(71, 85, 105)

    if os.path.exists("prep/assets/australia_corridor_map.jpg"):
        s2.shapes.add_picture("prep/assets/australia_corridor_map.jpg", Inches(6.8), Inches(1.5), Inches(5.7), Inches(5.2))

    # =========================================================================
    # SLIDE 3: THE PROBLEM STATEMENT (3 Metric Cards)
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    s3.notes_slide.notes_text_frame.text = 'These harsh conditions created three critical operational bottlenecks for NorthLine:\nFirst, a 15-hour tracking blind spot where dispatchers lose all visibility of drivers and freight between depots.\nSecond, a 45-minute dispatch bottleneck where loading teams manually juggle physical whiteboards and phone check-ins, creating dock queuing and compliance risks under Heavy Vehicle National Law.\nAnd third, a 14-day paper billing lag caused by physical carbon-copy dockets being lost, soiled, or delayed in truck cabs, trapping over $400,000 in unbilled working capital.'
    
    set_bg(s3, LIGHT_BG)
    add_header(s3, "03", "The Problem Statement: 3 Operational Bottlenecks")
    
    card_w = Inches(3.64)
    card_h = Inches(5.2)
    top_y = Inches(1.6)
    
    # Card 1: Navy
    add_card(s3, Inches(0.8), top_y, card_w, card_h, NAVY, border_color=None)
    tb = s3.shapes.add_textbox(Inches(1.0), top_y + Inches(0.4), card_w - Inches(0.4), card_h - Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "15+ HRS"
    p.font.size = Pt(38)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Communication Gaps"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_LIGHT
    p3 = tf.add_paragraph()
    p3.text = "\n• Cellular blind spots sever driver and cargo visibility along the Stuart Highway.\n• Dispatchers cannot pinpoint road train locations between remote waypoints.\n• Clients call constantly asking: 'Where is our urgent mining machinery?'"
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(203, 213, 225)
    
    # Card 2: Slate
    add_card(s3, Inches(4.84), top_y, card_w, card_h, CARD_SLATE, border_color=None)
    tb = s3.shapes.add_textbox(Inches(5.04), top_y + Inches(0.4), card_w - Inches(0.4), card_h - Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "45 MIN"
    p.font.size = Pt(38)
    p.font.bold = True
    p.font.color.rgb = TEXT_LIGHT
    p2 = tf.add_paragraph()
    p2.text = "Per Dispatch Allocation"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = AMBER
    p3 = tf.add_paragraph()
    p3.text = "\n• Manual physical whiteboards and phone check-ins slow vehicle dispatching.\n• High risk of overloading Gross Combination Mass (GCM) limits.\n• Zero automated validation of driver fatigue hours under Heavy Vehicle National Law (HVNL)."
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(226, 232, 240)
    
    # Card 3: Amber
    add_card(s3, Inches(8.88), top_y, card_w, card_h, AMBER, border_color=None)
    tb = s3.shapes.add_textbox(Inches(9.08), top_y + Inches(0.4), card_w - Inches(0.4), card_h - Inches(0.8))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "$400K"
    p.font.size = Pt(38)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p2 = tf.add_paragraph()
    p2.text = "Cash Trapped in Transit"
    p2.font.size = Pt(16)
    p2.font.bold = True
    p2.font.color.rgb = NAVY
    p3 = tf.add_paragraph()
    p3.text = "\n• Physical paper dockets take 14 days to return to Darwin for manual billing.\n• Carbon copies get lost, damaged by dust, or rain-soaked.\n• Crippling billing delays severely impair operating cash flow and working capital."
    p3.font.size = Pt(12)
    p3.font.color.rgb = NAVY

    # =========================================================================
    # SLIDE 4: PROPOSED SOLUTION — UNIFIED ECOSYSTEM (Dark Theme)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    s4.notes_slide.notes_text_frame.text = 'TrackPoint solves this crisis by deploying a unified, offline-first cloud ecosystem. Instead of disjointed spreadsheets and phone calls, TrackPoint establishes a single source of operational truth connecting all five key stakeholder groups: B2B Enterprise Customers, Operations Dispatchers, Linehaul Drivers, Receiving Dock Quality Assurance leads, and Financial Billing auditors.'
    
    set_bg(s4, DARK_BG)
    add_header(s4, "04", "Proposed Solution — Unified TrackPoint Ecosystem", dark=True)
    
    # Center Hub Box (Amber)
    hub = add_card(s4, Inches(4.66), Inches(3.0), Inches(4.0), Inches(1.8), AMBER, border_color=None)
    tb = s4.shapes.add_textbox(Inches(4.8), Inches(3.2), Inches(3.7), Inches(1.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "TRACKPOINT\nOFFLINE-FIRST CLOUD"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.alignment = PP_ALIGN.CENTER
    p_sub = tf.add_paragraph()
    p_sub.text = "Single Source of Truth across Edge & Cloud"
    p_sub.font.size = Pt(10)
    p_sub.font.color.rgb = NAVY
    p_sub.alignment = PP_ALIGN.CENTER

    # 4 Surrounding Pillars
    pillars = [
        ("CUSTOMERS", "• Self-service instant booking\n• Live Stuart Hwy tracking map\n• Automated SMS milestone alerts", Inches(0.8), Inches(1.8)),
        ("DRIVERS", "• Outback glare-resistant UI\n• HTML5 glass e-POD signature\n• Offline local data buffering", Inches(8.53), Inches(1.8)),
        ("DISPATCHERS", "• Sub-5s vehicle auto-matching\n• GCM & corridor fatigue checks\n• Audited manual override reason codes", Inches(0.8), Inches(4.5)),
        ("FINANCE & AUDIT", "• Instant ATO tax invoicing\n• Itemized 10% GST calculation\n• 7-year immutable audit archive", Inches(8.53), Inches(4.5))
    ]
    
    for title, desc, left, top in pillars:
        add_card(s4, left, top, Inches(4.0), Inches(1.8), CARD_DARK, AMBER)
        tb = s4.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), Inches(3.6), Inches(1.5))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = AMBER
        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(10.5)
        p_desc.font.color.rgb = TEXT_LIGHT

    # Bottom caption
    tb_foot = s4.shapes.add_textbox(Inches(0.8), Inches(6.6), Inches(11.733), Inches(0.4))
    p = tb_foot.text_frame.paragraphs[0]
    p.text = "One unified operational platform — resilient at the outback edge, consistent and compliant in the cloud."
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(148, 163, 184)
    p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 5: ENTERPRISE ARCHITECTURE (TOGAF 4-Layer)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    s5.notes_slide.notes_text_frame.text = 'In strict accordance with enterprise architecture standards, TrackPoint is structured using the TOGAF 4-Layer framework:\nAt the Business Layer, we govern Chain of Responsibility compliance, SLA commitments, and automated order-to-cash workflows.\nAt the Application Layer, we provide granular Role-Based Access Control, an automated vehicle dispatch engine, and digital proof of delivery.\nAt the Data Layer, we maintain normalized MongoDB Atlas schemas and edge LocalStorage queues.\nAnd at the Technology Layer, we leverage Vercel serverless edge computing and resilient stateless REST polling.'
    
    set_bg(s5, LIGHT_BG)
    add_header(s5, "05", "Enterprise Architecture — TOGAF 4-Layer Alignment")
    
    layers = [
        ("01  BUSINESS LAYER", AMBER, NAVY, 
         "Chain of Responsibility (CoR) Governance • Heavy Vehicle National Law (HVNL) Compliance • SLA Contract Monitoring • Order-to-Cash Automation • Driver Fatigue Oversight"),
        ("02  APPLICATION LAYER", NAVY, TEXT_LIGHT, 
         "Role-Based Access Control (RBAC) • Sub-5s Vehicle Auto-Match Engine • Freight Tier Dynamic Pricing • Corridor GPS Telemetry Visualizer • e-POD Digital Glass Signature Module"),
        ("03  DATA LAYER", NAVY, TEXT_LIGHT, 
         "Normalized MongoDB Atlas Document Store • Prisma ORM Data Access • Strict Schemas (Consignments, Vehicles, GPS Pings, Audit Logs, Invoices) • Client LocalStorage Edge Queue"),
        ("04  TECHNOLOGY LAYER", CARD_SLATE, TEXT_LIGHT, 
         "Vercel Serverless Edge Runtime • Next.js 15 App Router • React 19 • Leaflet GIS Engine • Chart.js Analytics • Resilient Stateless REST Polling • TLS 1.3 Transport Encryption")
    ]
    
    start_y = 1.6
    bar_h = 1.15
    spacing = 0.18
    
    for i, (title, bg, fg, body) in enumerate(layers):
        curr_y = start_y + i * (bar_h + spacing)
        add_card(s5, Inches(0.8), Inches(curr_y), Inches(11.733), Inches(bar_h), bg, border_color=None)
        tb = s5.shapes.add_textbox(Inches(1.1), Inches(curr_y + 0.1), Inches(11.1), Inches(bar_h - 0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = fg
        p_body = tf.add_paragraph()
        p_body.text = body
        p_body.font.size = Pt(11)
        p_body.font.color.rgb = fg

    # =========================================================================
    # SLIDE 6: TECHNICAL ARCHITECTURE & DEEP STACK (Canva Card Style)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    s6.notes_slide.notes_text_frame.text = 'Our technical stack was engineered specifically for durability and resilience:\nWe built the frontend and API layers using Next.js 15 App Router with React 19 and full TypeScript type safety to eliminate runtime exceptions.\nTailwind CSS provides high-contrast UI theming tailored for extreme sun glare inside truck cabins.\nPrisma ORM handles typed data access, while Leaflet.js provides high-performance GIS tracking.\nCrucially, we replaced brittle WebSocket connections with lightweight 15-second stateless REST polling to prevent reconnection storms when driving through weak cellular fringes.'
    
    set_bg(s6, LIGHT_BG)
    add_header(s6, "06", "Technical Architecture & Deep Engineering Stack")
    
    tech_cards = [
        ("EXPERIENCE", "Next.js 15 (App Router) • React 19 • TypeScript", "Strict type safety eliminating runtime crashes; high-contrast Tailwind CSS for outback sun glare.", CARD_LIGHT, NAVY),
        ("SERVICES", "Prisma ORM • Dispatch & Dynamic Invoicing Engines", "Modular backend services enforcing Gross Combination Mass (GCM) rules and instant GST billing.", NAVY, TEXT_LIGHT),
        ("DATA", "MongoDB Atlas Cloud • LocalStorage Offline Queue", "Flexible document storage with high-speed geospatial indexing, coupled with edge browser buffering.", CARD_LIGHT, NAVY),
        ("INSIGHT", "Leaflet.js GIS Mapping • Chart.js Real-time Telemetry", "Interactive NT corridor visualization and executive SLA tracking (96.4% on-time delivery rate).", NAVY, TEXT_LIGHT),
        ("PLATFORM", "Vercel Serverless Edge • Stateless 15s REST Polling", "Resilient serverless architecture; REST polling prevents WebSocket reconnect storms in 3G zones.", CARD_LIGHT, NAVY)
    ]
    
    start_y = 1.5
    bar_h = 0.95
    spacing = 0.15
    for i, (category, title, desc, bg, text_c) in enumerate(tech_cards):
        curr_y = start_y + i * (bar_h + spacing)
        add_card(s6, Inches(0.8), Inches(curr_y), Inches(11.733), Inches(bar_h), bg, border_color=BORDER_LIGHT if bg==CARD_LIGHT else None)
        tb = s6.shapes.add_textbox(Inches(1.1), Inches(curr_y + 0.1), Inches(11.1), Inches(bar_h - 0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"{category}   "
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = AMBER if bg == NAVY else RGBColor(180, 83, 9)
        
        run = p.add_run()
        run.text = f"|   {title}"
        run.font.size = Pt(13)
        run.font.bold = True
        run.font.color.rgb = text_c
        
        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(10.5)
        p_desc.font.color.rgb = RGBColor(148, 163, 184) if bg == NAVY else RGBColor(71, 85, 105)

    # =========================================================================
    # SLIDE 7: CORE INNOVATION — OUTBACK OFFLINE-FIRST ENGINE (Dark)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    s7.notes_slide.notes_text_frame.text = 'Here we showcase our primary technical breakthrough: the Outback Offline-First Engine.\nMost web applications crash when connection is lost. TrackPoint implements a 4-stage resilient state machine:\nWhen a driver reaches a remote cattle station or mine with zero mobile signal, the device captures the GPS coordinates, timestamp, and recipient glass signature.\nThis payload is instantly buffered into browser LocalStorage, and a high-visibility badge alerts the driver that data is safely secured locally.\nThe moment the vehicle encounters a roadside cell tower, a background reconciliation worker syncs the data to MongoDB Atlas using an idempotent transaction UUID—guaranteeing zero data loss and zero duplicate records.'
    
    set_bg(s7, DARK_BG)
    add_header(s7, "07", "Core Innovation — Outback Offline-First Engine", dark=True)
    
    tb_sub = s7.shapes.add_textbox(Inches(0.8), Inches(1.4), Inches(11.733), Inches(0.5))
    p = tb_sub.text_frame.paragraphs[0]
    p.text = "NO SIGNAL? NO LOST WORK."
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.alignment = PP_ALIGN.CENTER
    
    steps = [
        ("1  CAPTURE", "GPS + e-POD", "Driver captures digital signature, GPS location, and timestamp even with 0 bars of reception.", CARD_SLATE, TEXT_LIGHT),
        ("2  BUFFER", "LocalStorage Queue", "Data is instantly buffered into encrypted browser client storage. UI displays active 'Offline Stored' badge.", AMBER, NAVY),
        ("3  SYNC", "Idempotent Replay", "The moment the road train passes a roadside cellular tower, a background worker triggers synchronization.", CARD_SLATE, TEXT_LIGHT),
        ("4  CONFIRM", "Cloud Truth", "MongoDB Atlas validates the unique Client Transaction UUID, commits data, and generates the tax invoice.", GREEN, TEXT_LIGHT)
    ]
    
    step_w = Inches(2.7)
    step_h = Inches(3.8)
    spacing = Inches(0.3)
    start_x = Inches(0.8)
    
    for i, (num_title, sub, body, bg, txt_c) in enumerate(steps):
        curr_x = start_x + i * (step_w + spacing)
        add_card(s7, curr_x, Inches(2.1), step_w, step_h, bg, border_color=None)
        tb = s7.shapes.add_textbox(curr_x + Inches(0.15), Inches(2.3), step_w - Inches(0.3), step_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = num_title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = txt_c
        p_sub = tf.add_paragraph()
        p_sub.text = sub
        p_sub.font.size = Pt(15)
        p_sub.font.bold = True
        p_sub.font.color.rgb = txt_c
        p_body = tf.add_paragraph()
        p_body.text = f"\n{body}"
        p_body.font.size = Pt(11)
        p_body.font.color.rgb = txt_c

    tb_foot = s7.shapes.add_textbox(Inches(0.8), Inches(6.3), Inches(11.733), Inches(0.5))
    p = tb_foot.text_frame.paragraphs[0]
    p.text = "Guarantees zero lost dockets, zero duplicated billing transactions, and 100% data integrity along the 1,500km route."
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = RGBColor(148, 163, 184)
    p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 8: END-TO-END FREIGHT LIFECYCLE OVERVIEW (5 Core Stages)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    s8.notes_slide.notes_text_frame.text = 'Now, let us examine the complete 5-stage freight lifecycle implemented in TrackPoint.\nWe take freight through a continuous, closed-loop pipeline:\nStage 1: Self-Service Customer Booking.\nStage 2: Sub-5-second Auto-Match Dispatching.\nStage 3: Real-Time Stuart Highway Corridor Telematics.\nStage 4: Receiving Dock Arrival and Mandatory Quality Inspection.\nAnd Stage 5: Electronic Proof of Delivery resulting in instantaneous ATO-compliant Tax Invoicing.'
    
    set_bg(s8, LIGHT_BG)
    add_header(s8, "08", "System Lifecycle: The 5-Stage Freight Pipeline")
    
    cycle_cards = [
        ("STAGE 1", "Customer Booking", "Client self-service portal, 6 freight tiers, instant dynamic price & distance calculation.", AMBER, NAVY),
        ("STAGE 2", "Auto-Match Dispatch", "Sub-5s algorithm checks proximity, Gross Combination Mass, and HVNL fatigue rules.", NAVY, TEXT_LIGHT),
        ("STAGE 3", "Corridor Telematics", "Live Stuart Hwy GPS tracking, speed monitoring, and temperature alerts via Leaflet.", CARD_SLATE, TEXT_LIGHT),
        ("STAGE 4", "Receiving Dock QC", "Mandatory gate arrival audit: seal verification, temp compliance, and damage check.", NAVY, TEXT_LIGHT),
        ("STAGE 5", "e-POD & ATO Invoicing", "Digital glass signature capture & instantaneous 10% GST tax invoice generation.", GREEN, TEXT_LIGHT)
    ]
    
    col_w = Inches(2.15)
    col_h = Inches(4.8)
    col_spacing = Inches(0.24)
    start_x = Inches(0.8)
    
    for i, (stage, title, desc, bg, txt_c) in enumerate(cycle_cards):
        curr_x = start_x + i * (col_w + col_spacing)
        add_card(s8, curr_x, Inches(1.6), col_w, col_h, bg, border_color=None)
        tb = s8.shapes.add_textbox(curr_x + Inches(0.12), Inches(1.8), col_w - Inches(0.24), col_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = stage
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = txt_c
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(15)
        p2.font.bold = True
        p2.font.color.rgb = txt_c
        p3 = tf.add_paragraph()
        p3.text = f"\n{desc}"
        p3.font.size = Pt(11)
        p3.font.color.rgb = txt_c

    # =========================================================================
    # SLIDE 9: LIFECYCLE 1 — CUSTOMER BOOKING PORTAL (With Real Screenshot)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    s9.notes_slide.notes_text_frame.text = 'Here on screen is our live B2B Customer Portal, shown through the perspective of Sandra Wilson from Katherine Mining Supplies.\nClients choose from 6 enterprise freight tiers—including Heavy Machinery and Express Hot-Shot—with real-time automated distance and dynamic rate calculation.\nClients have live visibility of their road train on the Stuart Highway map, eliminating dozens of anxious phone calls and allowing depot forklift operators to stage loading bays right on time.'
    
    set_bg(s9, LIGHT_BG)
    add_header(s9, "09", "Stage 1: B2B Customer Portal & Freight Booking")
    
    # Left text card
    add_card(s9, Inches(0.8), Inches(1.5), Inches(4.8), Inches(5.3), CARD_LIGHT, BORDER_LIGHT)
    tb = s9.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.4), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CLIENT SELF-SERVICE PORTAL"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Sandra Wilson (Katherine Mining Supplies)"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p3 = tf.add_paragraph()
    p3.text = "\n• 6 Enterprise Freight Tiers: General Freight, Heavy Machinery, Dangerous Goods, Express Hot-Shot, and Cold-Chain Reefer.\n• Dynamic Rate Engine: Calculates distance, weight, and transit times on the fly.\n• Live Stuart Hwy Tracking: Interactive map showing road train progress toward Katherine depot.\n• Replaces Anxiety Calls: Client depot teams can stage forklifts right when the road train arrives."
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(71, 85, 105)
    
    # Right Screenshot
    if os.path.exists("prep/screenshots/customer.png"):
        add_card(s9, Inches(5.8), Inches(1.5), Inches(6.733), Inches(5.3), NAVY, None)
        s9.shapes.add_picture("prep/screenshots/customer.png", Inches(5.9), Inches(1.6), Inches(6.533), Inches(5.1))

    # =========================================================================
    # SLIDE 10: LIFECYCLE 2 — DISPATCH CONTROL & AUTO-MATCH ENGINE
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    s10.notes_slide.notes_text_frame.text = 'Next is the Operations Command Center in Darwin, used by lead dispatcher Priya Sharma.\nOur Sub-5-Second Auto-Match Engine analyzes vehicle availability, trailer capabilities, and current location.\nCrucially, it calculates cargo mass against vehicle Gross Combination Mass (GCM) limits to prevent dangerous highway axle overloading.\nTo maintain strict Heavy Vehicle National Law compliance, any manual override requires selecting an auditable reason code such as driver fatigue or scheduled maintenance.'
    
    set_bg(s10, LIGHT_BG)
    add_header(s10, "10", "Stage 2: Operations Dispatch & Auto-Matching")
    
    add_card(s10, Inches(0.8), Inches(1.5), Inches(4.8), Inches(5.3), CARD_LIGHT, BORDER_LIGHT)
    tb = s10.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.4), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "SUB-5-SECOND AUTO-MATCH ENGINE"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Lead Dispatcher: Priya Sharma"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p3 = tf.add_paragraph()
    p3.text = "\n• Intelligent Fleet Matching: Scans active fleet in MongoDB Atlas, evaluating vehicle capabilities, trailer type, and current location.\n• Gross Combination Mass (GCM) Checks: Validates axle load limits to prevent dangerous highway overloading.\n• HVNL Chain of Responsibility: Enforces mandatory reason codes (e.g. driver fatigue, vehicle maintenance) for any manual override.\n• Efficiency Leap: Reduces vehicle allocation time from 45 minutes down to under 5 seconds."
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(71, 85, 105)
    
    if os.path.exists("prep/screenshots/admin_dispatch.png"):
        add_card(s10, Inches(5.8), Inches(1.5), Inches(6.733), Inches(5.3), NAVY, None)
        s10.shapes.add_picture("prep/screenshots/admin_dispatch.png", Inches(5.9), Inches(1.6), Inches(6.533), Inches(5.1))

    # =========================================================================
    # SLIDE 11: LIFECYCLE 3 — STUART HWY CORRIDOR GIS TELEMATICS
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    s11.notes_slide.notes_text_frame.text = 'This is the live Stuart Highway Corridor Telematics Map, powered by Leaflet.js and OpenStreetMap.\nDispatchers monitor all commercial vehicles across our four main Northern Territory hubs: Darwin, Katherine, Tennant Creek, and Alice Springs.\nThe map plots real-time road train velocity, reefer temperature sensor pings, and waypoint milestones, instantly flagging unexpected route stoppages or schedule exceptions.'
    
    set_bg(s11, LIGHT_BG)
    add_header(s11, "11", "Stage 3: Stuart Hwy Telematics & Corridor Fleet Map")
    
    add_card(s11, Inches(0.8), Inches(1.5), Inches(4.8), Inches(5.3), CARD_LIGHT, BORDER_LIGHT)
    tb = s11.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.4), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "CORRIDOR TELEMETRICS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Leaflet.js + OpenStreetMap GIS"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p3 = tf.add_paragraph()
    p3.text = "\n• Real-Time Highway Tracking: Monitors triple road trains across 4 Northern Territory corridors (Darwin, Katherine, Tennant Creek, Alice Springs).\n• Telemetry Indicators: Live speed tracking, reefer temperature sensor pings, and waypoint milestones.\n• Resilient REST Polling: 15-second stateless polling ensures stable telemetry even through fluctuating 3G coverage.\n• Exception Management: Instant alerts if vehicles stop unexpectedly or deviate from schedule."
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(71, 85, 105)
    
    if os.path.exists("prep/screenshots/admin_fleet.png"):
        add_card(s11, Inches(5.8), Inches(1.5), Inches(6.733), Inches(5.3), NAVY, None)
        s11.shapes.add_picture("prep/screenshots/admin_fleet.png", Inches(5.9), Inches(1.6), Inches(6.533), Inches(5.1))

    # =========================================================================
    # SLIDE 12: LIFECYCLE 4 — DRIVER MOBILE CONSOLE & SUNLIGHT UI
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    s12.notes_slide.notes_text_frame.text = 'For the linehaul driver in the cabin—such as Dave Miller in Truck NL-14—we designed an ergonomic mobile handset console.\nThe interface features large touch targets and glare-optimized contrast designed for high-vibration driving in intense Australian sunlight.\nIt features a sequential manifest workflow and an automated rest-break timer enforcing mandatory NHVR fatigue stops along the 1,500km journey.'
    
    set_bg(s12, DARK_BG)
    add_header(s12, "12", "Stage 4: Linehaul Driver Handset & Cabin UI", dark=True)
    
    add_card(s12, Inches(0.8), Inches(1.5), Inches(7.5), Inches(5.3), CARD_DARK, AMBER)
    tb = s12.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(6.9), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "FIELD ERGONOMICS FOR OUTBACK ROAD TRAIN DRIVERS"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Driver: Dave Miller | Vehicle: NL-14 (Triple Road Train)"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_LIGHT
    p3 = tf.add_paragraph()
    p3.text = "\n• Sunlight Glare Optimization: High-contrast typography and color badges specifically designed for harsh Australian sun glare in truck cabins.\n• Sequential Touch Controls: Big, one-tap buttons designed for high-vibration driving conditions.\n• NHVR Compliance: Integrated rest-break timer enforcing mandatory fatigue stops along the Stuart Highway.\n• Offline-Ready State: Visual indicator confirms local buffering when traversing cellular dead-zones."
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(226, 232, 240)
    
    if os.path.exists("prep/screenshots/driver_active_mobile.png"):
        add_card(s12, Inches(8.8), Inches(1.5), Inches(3.733), Inches(5.3), NAVY, AMBER)
        s12.shapes.add_picture("prep/screenshots/driver_active_mobile.png", Inches(9.2), Inches(1.65), Inches(2.933), Inches(5.0))

    # =========================================================================
    # SLIDE 13: LIFECYCLE 5 — RECEIVING DOCK ARRIVAL & MANDATORY QC PROTOCOL
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    s13.notes_slide.notes_text_frame.text = 'A major innovation in TrackPoint is our Receiving Dock Arrival and Quality Assurance Protocol, led by Marcus Vance at Receiving Bay 3.\nBefore a consignment can be closed, receiving teams must clear three non-negotiable gates:\nFirst, confirming that the container security seal is intact.\nSecond, verifying cold-chain temperature logs.\nAnd third, certifying cargo integrity without physical transit damage.\nThis timestamped audit log permanently eliminates disputes between transport carriers and consignees.'
    
    set_bg(s13, LIGHT_BG)
    add_header(s13, "13", "Stage 5: Receiving Dock Arrival & Mandatory QC Audit")
    
    add_card(s13, Inches(0.8), Inches(1.5), Inches(4.8), Inches(5.3), CARD_LIGHT, BORDER_LIGHT)
    tb = s13.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.4), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "RECEIVING DOCK QA PROTOCOL"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Dock Inspector: Marcus Vance (Bay 3 Lead)"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p3 = tf.add_paragraph()
    p3.text = "\n• 3 Non-Negotiable Inspection Gates:\n  1. Security Seal Verification: Checks tamper-evident seals before cargo discharge.\n  2. Cold-Chain Compliance: Confirms reefer temperature logged within safe threshold.\n  3. Cargo Integrity Audit: Inspects for transit damage, shifting, or hazardous leaks.\n• Eliminates Disputes: Timestamps dock arrival and generates signed inspection records before final sign-off."
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(71, 85, 105)
    
    if os.path.exists("prep/screenshots/qc_dashboard.png"):
        add_card(s13, Inches(5.8), Inches(1.5), Inches(6.733), Inches(5.3), NAVY, None)
        s13.shapes.add_picture("prep/screenshots/qc_dashboard.png", Inches(5.9), Inches(1.6), Inches(6.533), Inches(5.1))

    # =========================================================================
    # SLIDE 14: LIFECYCLE 6 — DIGITAL GLASS e-POD (Offline Signature)
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    s14.notes_slide.notes_text_frame.text = "Upon passing dock inspection, the driver captures the consignee's Electronic Proof of Delivery using this interactive HTML5 digital glass signature pad.\nThe recipient's signature vector, legal name, and precise GPS geostamp are committed into an immutable audit package.\nEven in remote outback dead zones with zero bars of 4G, this transaction is guaranteed safe in local storage, eliminating lost or damaged paper dockets."
    
    set_bg(s14, DARK_BG)
    add_header(s14, "14", "Stage 6: Digital Glass e-POD & Offline Confirmation", dark=True)
    
    add_card(s14, Inches(0.8), Inches(1.5), Inches(7.5), Inches(5.3), CARD_DARK, AMBER)
    tb = s14.shapes.add_textbox(Inches(1.1), Inches(1.7), Inches(6.9), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "HTML5 CANVAS GLASS SIGNATURE CAPTURE"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Proof-of-Delivery at Remote Stations (0 Bars 4G)"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_LIGHT
    p3 = tf.add_paragraph()
    p3.text = "\n• Interactive Touch Signature: Recipient signs directly onto the driver's rugged tablet screen.\n• Complete Audit Vector: Binds the digital signature, recipient name, GPS coordinates, and UTC timestamp into an immutable JSON payload.\n• LocalStorage Buffering: Securely stored on-device even if the outstation has zero mobile coverage.\n• Zero Docket Loss: Completely eliminates paper loss, smudged ink, and weeks of delivery verification delays."
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(226, 232, 240)
    
    if os.path.exists("prep/screenshots/driver_mobile.png"):
        add_card(s14, Inches(8.8), Inches(1.5), Inches(3.733), Inches(5.3), NAVY, AMBER)
        s14.shapes.add_picture("prep/screenshots/driver_mobile.png", Inches(9.2), Inches(1.65), Inches(2.933), Inches(5.0))

    # =========================================================================
    # SLIDE 15: LIFECYCLE 7 — AUTOMATED ATO TAX INVOICING
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    s15.notes_slide.notes_text_frame.text = "The exact millisecond that delivery signature is confirmed, TrackPoint's automated billing engine generates an official Australian Tax Invoice.\nIt features itemized 10% GST calculation, verified ABN numbers, and embeds the recipient's digital signature directly onto the invoice record.\nThis collapses NorthLine's billing cycle from 14 days down to zero seconds, shrinking Days Sales Outstanding by 31% and unlocking $400,000 in trapped working capital."
    
    set_bg(s15, LIGHT_BG)
    add_header(s15, "15", "Stage 7: Automated ATO Tax Invoicing & Billing")
    
    add_card(s15, Inches(0.8), Inches(1.5), Inches(4.8), Inches(5.3), CARD_LIGHT, BORDER_LIGHT)
    tb = s15.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.4), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "INSTANT BILLING ENGINE"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "From 14 Days to Zero Seconds"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p3 = tf.add_paragraph()
    p3.text = "\n• Instant Generation: Triggered automatically the millisecond e-POD signature is committed.\n• Australian Tax Office (ATO) Compliance: Itemized 10% GST calculation, valid ABN numbers, and remittance slips.\n• Embedded Proof-of-Delivery: Embeds the recipient's glass signature directly onto the generated invoice PDF.\n• Unlocks Working Capital: Slashes Days Sales Outstanding (DSO) by 31%, immediately unlocking $400,000 in trapped revenue."
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(71, 85, 105)
    
    if os.path.exists("prep/screenshots/admin_invoices.png"):
        add_card(s15, Inches(5.8), Inches(1.5), Inches(6.733), Inches(5.3), NAVY, None)
        s15.shapes.add_picture("prep/screenshots/admin_invoices.png", Inches(5.9), Inches(1.6), Inches(6.533), Inches(5.1))

    # =========================================================================
    # SLIDE 16: LIFECYCLE 8 — EXECUTIVE FLEET ANALYTICS
    # =========================================================================
    s16 = prs.slides.add_slide(blank_layout)
    s16.notes_slide.notes_text_frame.text = "Senior logistics executives monitor operational health through our Executive Analytics Hub.\nUsing real-time Chart.js visualizations, management tracks NorthLine's 96.4% on-time delivery SLA, depot bay turnaround velocity, and fleet utilization rates.\nThe system automatically logs delivery exceptions—categorizing delays by monsoonal weather, road detours, or mechanical servicing—providing actionable data for continuous operational improvement."
    
    set_bg(s16, LIGHT_BG)
    add_header(s16, "16", "Stage 8: Executive Analytics & Operational Intelligence")
    
    add_card(s16, Inches(0.8), Inches(1.5), Inches(4.8), Inches(5.3), CARD_LIGHT, BORDER_LIGHT)
    tb = s16.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(4.4), Inches(4.9))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "OPERATIONAL SLA DASHBOARD"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "Chart.js Real-Time Intelligence"
    p2.font.size = Pt(12)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_DARK
    p3 = tf.add_paragraph()
    p3.text = "\n• 96.4% On-Time Delivery: Quantified SLA tracking across all NT corridor delivery runs.\n• Depot Capacity Utilisation: Real-time loading bay turnarounds across Darwin and Katherine terminals.\n• Exception Root-Cause Logs: Analyzes delays by weather monsoons, roadwork detours, and mechanical servicing.\n• Executive Decision Support: Eliminates guesswork for senior logistics managers."
    p3.font.size = Pt(11)
    p3.font.color.rgb = RGBColor(71, 85, 105)
    
    if os.path.exists("prep/screenshots/admin_analytics.png"):
        add_card(s16, Inches(5.8), Inches(1.5), Inches(6.733), Inches(5.3), NAVY, None)
        s16.shapes.add_picture("prep/screenshots/admin_analytics.png", Inches(5.9), Inches(1.6), Inches(6.533), Inches(5.1))

    # =========================================================================
    # SLIDE 17: SECURITY ARCHITECTURE & REGULATORY COMPLIANCE
    # =========================================================================
    s17 = prs.slides.add_slide(blank_layout)
    s17.notes_slide.notes_text_frame.text = 'Security and legal governance are woven into every tier of TrackPoint.\nWe enforce strict Role-Based Access Control partitioning customer, dispatcher, driver, QC, and finance privileges.\nClient commercial data and driver identities are protected under the Australian Privacy Principles.\nOur Chain of Responsibility audit logging ensures legal defensibility under the Heavy Vehicle National Law, while all invoices and proof-of-delivery records are immutably archived for 7 years in accordance with Section 286 of the Corporations Act.'
    
    set_bg(s17, LIGHT_BG)
    add_header(s17, "17", "Security Architecture, HVNL Compliance & Governance")
    
    sec_cards = [
        ("RBAC", "Least-Privilege Access", "Strict Role-Based Access Control partitioning Customer, Dispatcher, Driver, QC Inspector, and Auditor privileges.", CARD_LIGHT),
        ("APP", "Australian Privacy Principles", "Customer commercial pricing and driver personal data encrypted at rest and in transit via TLS 1.3.", CARD_LIGHT),
        ("HVNL", "Chain of Responsibility", "Tamper-evident audit logs enforcing driver rest breaks and mandatory dispatch override reason codes.", CARD_LIGHT),
        ("7 YEARS", "ATO Archival Standards", "Immutable 7-year retention of invoices and electronic signatures under Corporations Act Sec 286.", CARD_LIGHT)
    ]
    
    card_w = Inches(5.7)
    card_h = Inches(2.4)
    positions = [
        (Inches(0.8), Inches(1.6)),
        (Inches(6.8), Inches(1.6)),
        (Inches(0.8), Inches(4.3)),
        (Inches(6.8), Inches(4.3))
    ]
    
    for i, (title, sub, body, card_bg) in enumerate(sec_cards):
        left, top = positions[i]
        add_card(s17, left, top, card_w, card_h, card_bg, BORDER_LIGHT)
        tb = s17.shapes.add_textbox(left + Inches(0.2), top + Inches(0.15), card_w - Inches(0.4), card_h - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(22)
        p.font.bold = True
        p.font.color.rgb = AMBER
        p2 = tf.add_paragraph()
        p2.text = sub
        p2.font.size = Pt(13)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_DARK
        p3 = tf.add_paragraph()
        p3.text = f"\n{body}"
        p3.font.size = Pt(11)
        p3.font.color.rgb = RGBColor(71, 85, 105)

    # =========================================================================
    # SLIDE 18: THREAT ANALYSIS, RISK & EMERGENCY CONTINGENCY PLAN
    # =========================================================================
    s18 = prs.slides.add_slide(blank_layout)
    s18.notes_slide.notes_text_frame.text = 'To satisfy PRT631 Requirement 6, we conducted a rigorous threat analysis and built automated contingency plans:\nFor prolonged outback cellular blackspots, our offline buffer and satellite SMS check-in ensure operational continuity.\nFor wet-season monsoonal road closures, TrackPoint provides dynamic detour routing and integration with the Adelaide-to-Darwin freight railway.\nFor cloud infrastructure resilience, Vercel serverless edge failover and hourly automated MongoDB Atlas snapshots provide a Recovery Point Objective of under 15 minutes.'
    
    set_bg(s18, LIGHT_BG)
    add_header(s18, "18", "Threat Analysis, Risk Management & Contingency Plan")
    
    risks = [
        ("Prolonged Outback Cellular Outage", "Loss of real-time telemetry along remote highway stretches.", "Offline LocalStorage queue stores GPS & signatures; background worker replays when signal restores; emergency satellite SMS check-in.", AMBER),
        ("Wet Season Monsoonal Flooding", "Stuart Highway closures causing stranded road trains.", "Dynamic detour routing protocols; automatic rerouting to Adelaide-Darwin rail intermodal link; customer delay notifications.", NAVY),
        ("Database or Server Cloud Outage", "Inability to process dispatches or generate invoices.", "Vercel multi-region serverless failover; MongoDB Atlas automated hourly snapshots; point-in-time recovery with < 15 min RPO.", CARD_SLATE),
        ("Driver Credential Compromise", "Unauthorized access to delivery manifests or POD data.", "Cryptographic JWT session expiration; bcrypt password hashing; instant dispatcher remote token revocation.", NAVY)
    ]
    
    start_y = 1.5
    bar_h = 1.15
    spacing = 0.16
    for i, (threat, impact, contingency, tag_color) in enumerate(risks):
        curr_y = start_y + i * (bar_h + spacing)
        add_card(s18, Inches(0.8), Inches(curr_y), Inches(11.733), Inches(bar_h), CARD_LIGHT, BORDER_LIGHT)
        tb = s18.shapes.add_textbox(Inches(1.1), Inches(curr_y + 0.1), Inches(11.1), Inches(bar_h - 0.2))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"THREAT: {threat}"
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = AMBER
        
        p_body = tf.add_paragraph()
        p_body.text = f"• Risk Impact: {impact}\n• Contingency Plan: {contingency}"
        p_body.font.size = Pt(10.5)
        p_body.font.color.rgb = TEXT_DARK

    # =========================================================================
    # SLIDE 19: PROJECT IMPLEMENTATION PLAN (12-Week Agile Delivery)
    # =========================================================================
    s19 = prs.slides.add_slide(blank_layout)
    s19.notes_slide.notes_text_frame.text = "The platform was executed across a disciplined 12-week Agile implementation roadmap:\nSprints 1 through 3 progressed from initial stakeholder analysis at NorthLine's Darwin terminal to core telematics and offline signature engineering.\nSprint 4 culminated in a live production pilot on the Darwin-to-Katherine corridor, supported by driver usability training and change management workshops to ensure 100% field adoption."
    
    set_bg(s19, DARK_BG)
    add_header(s19, "19", "Project Implementation Plan — 12-Week Agile Roadmap", dark=True)
    
    plan_phases = [
        ("01", "INCEPTION", "WEEKS 1–3", "• Stakeholder requirement analysis with NorthLine Darwin depot.\n• HVNL Chain of Responsibility legal validation.\n• Architecture backlog & Prisma schema design."),
        ("02", "CORE TELEMATICS", "WEEKS 4–6", "• Next.js 15 serverless scaffolding.\n• Customer booking portal & freight pricing engine.\n• Dispatcher command board & auto-matching."),
        ("03", "e-POD + OFFLINE", "WEEKS 7–9", "• HTML5 glass signature canvas development.\n• LocalStorage offline buffer & idempotent sync.\n• Receiving dock QC inspection module."),
        ("04", "PRODUCTION PILOT", "WEEKS 10–12", "• Darwin-to-Katherine road train live pilot test.\n• Driver change management & tablet UX training.\n• Executive handover & production deployment.")
    ]
    
    card_w = Inches(2.7)
    card_h = Inches(4.8)
    spacing = Inches(0.3)
    start_x = Inches(0.8)
    
    for i, (num, title, weeks, body) in enumerate(plan_phases):
        curr_x = start_x + i * (card_w + spacing)
        add_card(s19, curr_x, Inches(1.6), card_w, card_h, CARD_DARK, AMBER)
        tb = s19.shapes.add_textbox(curr_x + Inches(0.15), Inches(1.8), card_w - Inches(0.3), card_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = num
        p.font.size = Pt(36)
        p.font.bold = True
        p.font.color.rgb = AMBER
        p2 = tf.add_paragraph()
        p2.text = title
        p2.font.size = Pt(14)
        p2.font.bold = True
        p2.font.color.rgb = TEXT_LIGHT
        p_w = tf.add_paragraph()
        p_w.text = weeks
        p_w.font.size = Pt(11)
        p_w.font.bold = True
        p_w.font.color.rgb = AMBER
        p3 = tf.add_paragraph()
        p3.text = f"\n{body}"
        p3.font.size = Pt(10.5)
        p3.font.color.rgb = RGBColor(203, 213, 225)

    # =========================================================================
    # SLIDE 20: QUANTIFIED ROI, CONCLUSION & Q&A DEFENSE (Dark Closing)
    # =========================================================================
    s20 = prs.slides.add_slide(blank_layout)
    s20.notes_slide.notes_text_frame.text = 'In conclusion, TrackPoint delivers $205,000 in recurring net annual savings, eliminates paper docket loss, and achieves a full financial payback in just 2.4 years.\nThe project 100% fulfills all PRT631 capstone objectives and is deployed live today on Vercel at trackpoint-platform.vercel.app.\nLooking ahead, our architecture is ready for Phase 2 AI weather rerouting and Phase 3 IoT cold-chain trailer sensors.\nThank you very much for your time. I am now delighted to answer any questions from the panel.'
    
    set_bg(s20, DARK_BG)
    add_header(s20, "20", "Business Impact, Quantified ROI & Conclusion", dark=True)
    
    # Left stats cards
    tb = s20.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(6.8), Inches(5.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "MEASURED OPERATIONAL & FINANCIAL OUTCOMES"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p2 = tf.add_paragraph()
    p2.text = "\n• $205,000 Net Annual Savings: From eliminating paper docket printing/handling, automating dispatch, and reducing accounting disputes.\n• 31% Reduction in DSO: Slashes billing lag from 14 days to instant, unlocking $400,000 in trapped working capital.\n• 96.4% On-Time Delivery Rate: Achieved through sub-5s automated dispatch and live corridor visibility.\n• 2.4-Year Full Payback: Rapid investment breakeven beating enterprise hurdle rates."
    p2.font.size = Pt(12)
    p2.font.color.rgb = RGBColor(226, 232, 240)
    
    p3 = tf.add_paragraph()
    p3.text = "\nFUTURE ENHANCEMENTS ROADMAP"
    p3.font.size = Pt(13)
    p3.font.bold = True
    p3.font.color.rgb = AMBER
    p4 = tf.add_paragraph()
    p4.text = "• Phase 2 AI Route Optimization: Dynamic flood rerouting for Top End monsoonal wet seasons.\n• Phase 3 BLE IoT Telematics: Wireless reefer sensors for automated cold-chain alerts."
    p4.font.size = Pt(11)
    p4.font.color.rgb = RGBColor(203, 213, 225)

    # Right Payback Card
    add_card(s20, Inches(8.0), Inches(1.5), Inches(4.533), Inches(5.2), CARD_DARK, AMBER)
    tb_pay = s20.shapes.add_textbox(Inches(8.2), Inches(2.0), Inches(4.133), Inches(4.2))
    tf_pay = tb_pay.text_frame
    tf_pay.word_wrap = True
    p = tf_pay.paragraphs[0]
    p.text = "2.4"
    p.font.size = Pt(72)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.alignment = PP_ALIGN.CENTER
    p2 = tf_pay.add_paragraph()
    p2.text = "YEAR PAYBACK"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = TEXT_LIGHT
    p2.alignment = PP_ALIGN.CENTER
    p3 = tf_pay.add_paragraph()
    p3.text = "\nProduction Prototype Deployed:"
    p3.font.size = Pt(11)
    p3.font.color.rgb = AMBER
    p3.alignment = PP_ALIGN.CENTER
    p4 = tf_pay.add_paragraph()
    p4.text = "https://trackpoint-platform.vercel.app\n\nTHANK YOU\nFloor Open for Examination Q&A"
    p4.font.size = Pt(13)
    p4.font.bold = True
    p4.font.color.rgb = TEXT_LIGHT
    p4.alignment = PP_ALIGN.CENTER

    prs.save(output_path)
    print(f"Successfully generated 20-slide Master Presentation: {output_path}")

if __name__ == "__main__":
    build_deck()
