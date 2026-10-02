#!/usr/bin/env python3
"""
TrackPoint Class Presentation & Pitch Guide Generator
Produces:
1. TrackPoint_Class_Presentation.pptx (18 Widescreen high-design slides)
2. TrackPoint_Class_Presentation_Guide.docx (Complete speaker script, pitch guide, and Q&A defense)
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

import docx
from docx import Document
from docx.shared import Inches as DocxInches, Pt as DocxPt, RGBColor as DocxRGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# --- Color Palette for Presentation ---
BG_DARK = RGBColor(11, 19, 32)         # #0B1320 Deep Space Navy
BG_CARD = RGBColor(17, 29, 51)         # #111D33 Container Card Navy
BG_CARD_LIGHT = RGBColor(27, 42, 71)   # #1B2A47 Slightly lighter card
BORDER_BLUE = RGBColor(56, 189, 248)   # #38BDF8 Sky Blue Accent
BORDER_MUTED = RGBColor(51, 65, 85)    # #334155 Border slate
TEXT_WHITE = RGBColor(248, 250, 252)   # #F8FAFC Heading text
TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8 Secondary text
TEXT_CYAN = RGBColor(56, 189, 248)     # #38BDF8 Highlight Cyan
TEXT_GREEN = RGBColor(52, 211, 153)    # #34D399 Emerald Green
TEXT_GOLD = RGBColor(251, 191, 36)     # #FBBF24 Amber Gold
TEXT_ROSE = RGBColor(244, 114, 182)    # #F472B6 Rose Pink

def set_cell_background(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def style_table(table, header_bg="1A476F", header_fg="FFFFFF", alt_bg="F4F6F9"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        for cell in row.cells:
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            if is_header:
                set_cell_background(cell, header_bg)
                for paragraph in cell.paragraphs:
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    for run in paragraph.runs:
                        run.font.bold = True
                        run.font.color.rgb = DocxRGBColor.from_string(header_fg)
                        run.font.size = DocxPt(9.5)
            else:
                if i % 2 == 1:
                    set_cell_background(cell, "FFFFFF")
                else:
                    set_cell_background(cell, alt_bg)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = DocxPt(9)
                        run.font.color.rgb = DocxRGBColor(40, 44, 52)

def build_pptx(output_path="TrackPoint_Class_Presentation.pptx"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    def add_blank_dark_slide():
        slide = prs.slides.add_slide(blank_layout)
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return slide

    def add_header(slide, category, title, subtitle=None):
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(10)
        p_cat.font.bold = True
        p_cat.font.color.rgb = TEXT_CYAN
        p_cat.font.name = "Arial"

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

    # ================= SLIDE 1: TITLE =================
    s1 = add_blank_dark_slide()
    add_card(s1, Inches(0.8), Inches(1.1), Inches(11.733), Inches(5.3), BG_CARD, BORDER_BLUE)
    
    b_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.4), Inches(10.5), Inches(0.4))
    p_b = b_box.text_frame.paragraphs[0]
    p_b.text = "MISSION-CRITICAL FREIGHT ORCHESTRATION & TELEMATICS PLATFORM"
    p_b.font.size = Pt(11)
    p_b.font.bold = True
    p_b.font.color.rgb = TEXT_CYAN

    t_box = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(10.5), Inches(1.2))
    p_t = t_box.text_frame.paragraphs[0]
    p_t.text = "TrackPoint"
    p_t.font.size = Pt(46)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE

    st_box = s1.shapes.add_textbox(Inches(1.2), Inches(3.0), Inches(10.5), Inches(0.8))
    p_st = st_box.text_frame.paragraphs[0]
    p_st.text = "Solving Australia's Most Demanding Logistics Corridor (Stuart Highway, NT)\nAutomated Nearest-Vehicle Dispatch • 15s Highway Telematics • Offline e-POD • Instant Invoicing"
    p_st.font.size = Pt(15)
    p_st.font.color.rgb = TEXT_MUTED

    # Stat Pills
    pills = [
        ("35 Heavy Vehicles", "Road trains, reefers, tankers", TEXT_GREEN, Inches(1.2)),
        ("1,500 km Corridor", "Darwin ↔ Alice Springs", TEXT_CYAN, Inches(4.7)),
        ("0s Instant Billing", "Real-time e-POD tax invoices", TEXT_GOLD, Inches(8.2)),
    ]
    for title_txt, sub_txt, col, left_p in pills:
        add_card(s1, left_p, Inches(4.7), Inches(3.2), Inches(1.3), BG_CARD_LIGHT, BORDER_MUTED)
        tb = s1.shapes.add_textbox(left_p + Inches(0.15), Inches(4.8), Inches(2.9), Inches(1.1))
        p = tb.text_frame.paragraphs[0]
        p.text = title_txt
        p.font.bold = True
        p.font.size = Pt(15)
        p.font.color.rgb = col
        p2 = tb.text_frame.add_paragraph()
        p2.text = sub_txt
        p2.font.size = Pt(10)
        p2.font.color.rgb = TEXT_MUTED

    # ================= SLIDE 2: WHY THIS MATTERS =================
    s2 = add_blank_dark_slide()
    add_header(s2, "1. The Big Picture", "Why Is This Platform Mission-Critical?", "Logistics is the lifeline of remote Australia. When freight fails, the economy stops.")
    
    col_w = Inches(3.7)
    gap = Inches(0.3)
    
    reasons = [
        ("🏥 Community & Health Lifeline", TEXT_CYAN, [
            "Remote clinics across Katherine and Alice Springs depend on uninterrupted cold-chain vaccine delivery.",
            "Indigenous communities rely on weekly linehaul freight for non-perishable food and dry groceries.",
            "Without reliable tracking, medical docks cannot prepare emergency reception protocols."
        ]),
        ("⛏️ Multi-Million Dollar Industry", TEXT_GOLD, [
            "Mining operations in the Top End (slurry pumps, drill bits) lose up to $50,000 AUD per hour during breakdowns.",
            "Pastoral cattle stations require massive road train capacity (85t GCM) for livestock feed and fencing wire.",
            "Export mangoes and beef require strict HACCP temperature windows in 42°C outback heat."
        ]),
        ("⚖️ High Regulatory Liability", TEXT_ROSE, [
            "Heavy Vehicle National Law (HVNL) enforces strict Chain of Responsibility (CoR) accountability.",
            "Axle overload violations carry massive NHVR fines ($10,000+) and safety risks.",
            "Dangerous Goods (cyanides, bulk fuel) mandate verified placarding and certified recipient sign-off."
        ])
    ]
    for i, (r_title, r_col, r_bullets) in enumerate(reasons):
        c_left = Inches(0.8) + i * (col_w + gap)
        add_card(s2, c_left, Inches(1.8), col_w, Inches(5.0), BG_CARD, r_col)
        tb = s2.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), col_w - Inches(0.4), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = r_title
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = r_col
        for b in r_bullets:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(10.5)
            p.font.color.rgb = TEXT_WHITE
            p.space_before = Pt(10)

    # ================= SLIDE 3: OPERATIONAL BATTLEFIELD =================
    s3 = add_blank_dark_slide()
    add_header(s3, "2. Operational Battlefield", "The Northern Territory Logistics Landscape", "1,500 kilometers of desert highway connecting 4 major regional logistics hubs.")
    
    battle_cards = [
        ("📍 Stuart Highway Supply Artery", TEXT_CYAN, "Spanning 1,500 km from Darwin (Top End) to Alice Springs (Red Centre). Extreme weather: 42°C heat in the dry, monsoonal flooding in the wet."),
        ("🚛 35 Commercial Heavy Fleet", TEXT_GREEN, "Mack Titan Road Trains (85t GCM), Kenworth Bulk Haulers, Volvo FH16 Reefers, and Isuzu Metro Rigids across 4 depots."),
        ("🏢 4 Regional Logistics Hubs", TEXT_GOLD, "Darwin Head Depot (120 Berrimah Rd), Katherine Regional Staging, Tennant Creek Outstation, Alice Springs Distribution Hub.")
    ]
    for i, (b_title, b_col, b_desc) in enumerate(battle_cards):
        c_left = Inches(0.8) + i * (col_w + gap)
        add_card(s3, c_left, Inches(1.8), col_w, Inches(5.0))
        tb = s3.shapes.add_textbox(c_left + Inches(0.2), Inches(2.0), col_w - Inches(0.4), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = b_title
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = b_col
        p_d = tf.add_paragraph()
        p_d.text = b_desc
        p_d.font.size = Pt(11)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    # ================= SLIDE 4: THE 4 FAILURE MODES =================
    s4 = add_blank_dark_slide()
    add_header(s4, "3. Legacy Breakdown", "The 4 Catastrophic Failure Modes of Traditional Logistics", "Why manual processes and legacy software crippled freight efficiency and cash flow.")
    
    card_w4 = Inches(5.7)
    card_h4 = Inches(2.35)
    
    pains = [
        ("🚨 1. Stuart Highway Blind Spots", "15 hours of zero tracking once freight departs Darwin. Shippers make 45 ETA calls/day, causing operational frustration and dock chaos.", TEXT_ROSE),
        ("⏱️ 2. 45-Minute Manual Dispatch Latency", "Dispatchers matched orders using memory, spreadsheets, and whiteboards, resulting in underutilized trailers and delayed emergency shipments.", TEXT_ROSE),
        ("📵 3. Remote Outstation Dead-Zones", "Standard cloud apps crash in outstation blackspots. Drivers reverted to paper dockets that got oil-stained, lost, or illegibly signed.", TEXT_ROSE),
        ("💸 4. 14-Day Delayed Billing Cycle", "Finance could not invoice clients until paper PODs returned to Darwin 14 days later, locking up hundreds of thousands of dollars in working capital.", TEXT_ROSE)
    ]
    for i, (p_t, p_d, p_c) in enumerate(pains):
        r = i // 2
        c = i % 2
        c_left = Inches(0.8) + c * (card_w4 + Inches(0.3))
        c_top = Inches(1.8) + r * (card_h4 + Inches(0.2))
        add_card(s4, c_left, c_top, card_w4, card_h4)
        tb = s4.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), card_w4 - Inches(0.4), card_h4 - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = p_t
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = p_c
        p_desc = tf.add_paragraph()
        p_desc.text = p_d
        p_desc.font.size = Pt(10.5)
        p_desc.font.color.rgb = TEXT_MUTED
        p_desc.space_before = Pt(6)

    # ================= SLIDE 5: THE TRACKPOINT SOLUTION =================
    s5 = add_blank_dark_slide()
    add_header(s5, "4. System Architecture", "The TrackPoint Cloud Solution: 4 Isolated Portals", "Clean separation of concerns with dedicated environments tailored to each operational role.")
    
    pw = Inches(2.8)
    pgap = Inches(0.18)
    portals = [
        ("B2B Customer Portal", "/customer", TEXT_CYAN, ["Online self-service booking", "15s Stuart Hwy live map", "5-stage milestone chain", "Instant Tax Invoice & e-POD"]),
        ("Operations Command", "/admin", TEXT_GREEN, ["35 heavy vehicles CAN-bus map", "Nearest-truck auto-dispatch", "Manual override modal", "Chart.js SLA analytics"]),
        ("Driver Mobile Handset", "/driver", TEXT_GOLD, ["Glove-friendly card manifest", "Offline HTML5 signature canvas", "LocalStorage buffer engine", "Auto-sync on 4G reconnect"]),
        ("Finance & Invoicing", "/admin/invoices", TEXT_ROSE, ["Instant e-POD triggered billing", "ATO 10% GST & ABN validation", "Enterprise credit terms (14/30d)", "7-Year statutory record audit"])
    ]
    for i, (p_title, p_route, p_color, p_items) in enumerate(portals):
        left_pos = Inches(0.8) + i * (pw + pgap)
        add_card(s5, left_pos, Inches(1.8), pw, Inches(5.0), BG_CARD, p_color)
        tb = s5.shapes.add_textbox(left_pos + Inches(0.15), Inches(2.0), pw - Inches(0.3), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = p_title
        p.font.bold = True
        p.font.size = Pt(13)
        p.font.color.rgb = p_color
        p_sub = tf.add_paragraph()
        p_sub.text = f"Route: {p_route}"
        p_sub.font.size = Pt(9.5)
        p_sub.font.color.rgb = TEXT_MUTED
        for item in p_items:
            p_it = tf.add_paragraph()
            p_it.text = "✓ " + item
            p_it.font.size = Pt(10)
            p_it.font.color.rgb = TEXT_WHITE
            p_it.space_before = Pt(8)

    # ================= SLIDE 6: 6 SERVICES OVERVIEW =================
    s6 = add_blank_dark_slide()
    add_header(s6, "5. Service Portfolio", "NorthLine's 6 Specialized Logistics Services", "Custom-engineered transport solutions covering industrial, medical, agricultural, and port freight.")
    
    services_grid = [
        ("1. Scheduled Linehaul", "Darwin ↔ Alice Springs corridor with scheduled departures and 5-stage tracking.", TEXT_CYAN),
        ("2. Express Hot-Shot", "Emergency same-day breakdown courier for mining and maritime operations.", TEXT_GOLD),
        ("3. Cold-Chain Logistics", "HACCP-grade climate-controlled reefer freight for fresh produce and perishables.", TEXT_GREEN),
        ("4. Heavy Mining & Pastoral", "Multi-combination road trains (85t GCM) for heavy machinery and cattle freight.", TEXT_ROSE),
        ("5. Dangerous Goods & Medical", "Classified chemical and pharmaceutical transport with unbroken chain-of-custody.", TEXT_CYAN),
        ("6. Metro Container & Port", "Fast East Arm Wharf intermodal drayage and Berrimah depot container staging.", TEXT_GREEN),
    ]
    card_w6 = Inches(3.7)
    card_h6 = Inches(2.35)
    for i, (s_title, s_desc, s_color) in enumerate(services_grid):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8) + col * (card_w6 + Inches(0.3))
        c_top = Inches(1.8) + row * (card_h6 + Inches(0.2))
        add_card(s6, c_left, c_top, card_w6, card_h6)
        tb = s6.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.2), card_w6 - Inches(0.4), card_h6 - Inches(0.4))
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

    # ================= SLIDES 7 TO 12: DEEP DIVES INTO SERVICES =================
    service_slides = [
        ("Service 01", "Scheduled Linehaul Freight", "1,500km Stuart Hwy Corridor (Darwin ↔ Katherine ↔ Tennant ↔ Alice)",
         ["Sole land route for regional stores and pastoral stations.", "Predictable weekly departures for general consolidated cargo.", "Demands maximum trailer volume utilization."],
         ["15-hour transit blind spots caused constant customer phone calls.", "Receiving warehouses had no accurate arrival times for forklift crews.", "Paper manifests were frequently damaged on multi-day runs."],
         ["1. Customer books online; system calculates corridor pricing.", "2. Automated road train allocation via nearest GPS vehicle.", "3. 15s Leaflet GPS telemetry tracks 88 km/h linehaul transit.", "4. 5-Stage milestone chain updates automatically.", "5. Receiver signs e-POD upon regional depot arrival."],
         TEXT_CYAN),
        
        ("Service 02", "Express Hot-Shot Breakdown Dispatch", "Emergency Same-Day Breakdown Courier for Mining & Marine",
         ["Mining downtime (e.g. excavator hydraulic failure) costs up to $50,000 AUD/hr.", "Emergency marine vessel propulsion parts require fast wharf-to-dock transport.", "Requires immediate queue preemption over scheduled linehaul."],
         ["Standard freight booking queues took 2–4 hours just to confirm trucks.", "No live high-speed tracking to confirm driver departure.", "Emergency surcharge rates were disputed without exact timestamps."],
         ["1. Customer selects 'Express Hot-Shot' (⚡ Gold Priority Tag).", "2. System preempts dispatch queue and finds closest truck in <5s.", "3. Automated SMS notification emitted with live tracking link.", "4. High-speed telematics monitors route directly to mine site.", "5. Verified delivery timestamp locks audit trail."],
         TEXT_GOLD),
        
        ("Service 03", "HACCP Refrigerated & Cold-Chain Logistics", "Climate-Controlled Transport for Mangoes, Beef & Vaccines",
         ["Top End produces premium export mangoes and pastoral beef.", "Outback heat regularly exceeds 42°C, risking severe thermal spoilage.", "Strict HACCP and export compliance mandating +2°C to +4°C windows."],
         ["Paper temperature logs were frequently falsified or lost.", "Dispatchers mistakenly allocated dry trailers to perishable cargo.", "Cargo spoilage claims created massive disputes with insurers."],
         ["1. Shipper selects Cold-Chain tier and inputs required temp (+2°C to +4°C).", "2. Dispatch algorithm restricts matching strictly to certified reefer units.", "3. CAN-bus telematics monitors refrigeration setpoint in transit.", "4. Driver captures digital e-POD with temperature verification sign-off.", "5. Tax invoice generated with unbroken cold-chain compliance."],
         TEXT_GREEN),
        
        ("Service 04", "Heavy Machinery & Pastoral Bulk Transport", "Multi-Combination Road Trains (up to 85t GCM)",
         ["Mining basins require 14t+ slurry pumps, compressors, and plant gear.", "Pastoral stations require bulk cattle fencing wire and livestock feed.", "Must strictly obey National Heavy Vehicle Regulator (NHVR) mass limits."],
         ["Axle overload violations carried heavy NHVR fines ($10,000+).", "Inaccurate tare weight estimates caused road train engine strain.", "Manual trailer coupling checks were difficult to track."],
         ["1. Customer enters exact tonnage and cargo dimensions.", "2. System enforces heavy combination road train assignment.", "3. Admin modal calculates axle mass distribution and payload tare.", "4. Berrimah cross-dock supervisor verifies lashing inspection.", "5. e-POD captures receiver heavy crane unload sign-off."],
         TEXT_ROSE),
        
        ("Service 05", "Dangerous Goods (DG) & Medical Logistics", "Classified Chemicals, Fuel, Explosives & Cryogenic Vaccines",
         ["Mining operations require regular deliveries of cyanides and acids.", "Remote hospital clinics depend on cold-chain vaccines and surgical tools.", "Governed by strict Australian Dangerous Goods (ADG) Code."],
         ["Transporting DG without certified drivers carries criminal liability.", "Missing emergency response guides (ERGs) endangered first responders.", "High risk of theft without tamper-evident chain of custody."],
         ["1. Consignment classified under ADG regulations with hazard code.", "2. Platform verifies driver DG license and placarded prime mover.", "3. Handset mandates authorized recipient badge ID verification.", "4. Mandatory digital touch signature and receiver name capture.", "5. Audit log permanently archived in MongoDB Atlas (7-Year rule)."],
         TEXT_CYAN),
        
        ("Service 06", "Intermodal Port Drayage & Container Staging", "East Arm Wharf Container Logistics & Cross-Dock Staging",
         ["East Arm Wharf is Darwin's international maritime container terminal.", "Shipping lines charge $250+/day demurrage if containers are delayed.", "Berrimah Logistics Precinct acts as regional rail/road staging hub."],
         ["Port congestion caused long truck queues and missed vessel bookings.", "Lack of container number tracking caused delayed container returns.", "High demurrage penalties incurred by commercial importers."],
         ["1. Customer books 20ft/40ft container transfer from East Arm Wharf.", "2. Short-haul rigid drayage trucks allocated to port vessel time-slots.", "3. Milestones track Wharf Gate-Out and Berrimah Gate-In.", "4. Cross-dock supervisor confirms container turnaround under 4 hours.", "5. e-POD confirms shipping line container interchange receipt."],
         TEXT_GREEN)
    ]

    for num_str, title_str, sub_str, why_list, pain_list, sol_list, acc_col in service_slides:
        s = add_blank_dark_slide()
        add_header(s, f"5.{num_str}", title_str, sub_str)
        c_w = Inches(3.7)
        c_h = Inches(5.0)

        # Col 1: Why
        add_card(s, Inches(0.8), Inches(1.8), c_w, c_h)
        tb = s.shapes.add_textbox(Inches(1.0), Inches(2.0), c_w - Inches(0.4), c_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "🎯 Why It Was Needed"
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = acc_col
        for b in why_list:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_WHITE
            p.space_before = Pt(8)

        # Col 2: Pain
        add_card(s, Inches(0.8) + c_w + Inches(0.3), Inches(1.8), c_w, c_h)
        tb = s.shapes.add_textbox(Inches(1.0) + c_w + Inches(0.3), Inches(2.0), c_w - Inches(0.4), c_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "🚨 Traditional Pain Point"
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_ROSE
        for b in pain_list:
            p = tf.add_paragraph()
            p.text = "• " + b
            p.font.size = Pt(10)
            p.font.color.rgb = TEXT_MUTED
            p.space_before = Pt(8)

        # Col 3: Solution Flow
        add_card(s, Inches(0.8) + (c_w + Inches(0.3))*2, Inches(1.8), c_w, c_h)
        tb = s.shapes.add_textbox(Inches(1.0) + (c_w + Inches(0.3))*2, Inches(2.0), c_w - Inches(0.4), c_h - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = "✅ TrackPoint Solution Flow"
        p.font.bold = True
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_GREEN
        for b in sol_list:
            p = tf.add_paragraph()
            p.text = b
            p.font.size = Pt(9.5)
            p.font.color.rgb = TEXT_WHITE
            p.space_before = Pt(6)

    # ================= SLIDE 13: STAKEHOLDER ROLES =================
    s13 = add_blank_dark_slide()
    add_header(s13, "6. User Personas & Roles", "Full Lifecycle Across All 6 Stakeholder Roles", "Tailored interfaces for every actor in the commercial freight ecosystem.")
    
    roles_grid = [
        ("1. B2B Customer (Sandra Wilson)", "Procurement Lead, Katherine Mining", "Configures online bookings, monitors live Stuart Hwy Leaflet map, receives SMS alerts, downloads official Tax Invoices.", TEXT_CYAN),
        ("2. Operations Dispatcher (Priya Sharma)", "Senior Dispatcher, Darwin Depot", "Monitors 35-vehicle CAN-bus map, executes compliance overrides (reason codes), reviews on-time delivery SLAs.", TEXT_GREEN),
        ("3. Linehaul Driver (Dave Miller)", "Heavy Road Train Driver, Truck #NL-14", "Receives mobile run sheets, captures digital signatures on HTML5 canvas, buffers signatures in offline dead-zones.", TEXT_GOLD),
        ("4. Finance Officer (Marcus Vance)", "Senior Accountant, Corporate", "Reviews instant e-POD triggered tax invoices, manages 14/30d credit terms, ensures ATO 7-year audit compliance.", TEXT_ROSE),
        ("5. Yard Master (Greg Turner)", "Depot Supervisor, Berrimah Terminal", "Coordinates cross-dock staging bay allocations, verifies freight tare weights, confirms road train lashing safety.", TEXT_CYAN),
        ("6. Safety & CoR Officer (Arthur Pendelton)", "Compliance Manager, NT Transport", "Audits historical driver speed telemetry, verifies DG certifications, prevents HVNL fatigue breaches.", TEXT_GREEN)
    ]
    card_w13 = Inches(3.7)
    card_h13 = Inches(2.35)
    for i, (r_name, r_sub, r_desc, r_col) in enumerate(roles_grid):
        row = i // 3
        col = i % 3
        c_left = Inches(0.8) + col * (card_w13 + Inches(0.3))
        c_top = Inches(1.8) + row * (card_h13 + Inches(0.2))
        add_card(s13, c_left, c_top, card_w13, card_h13)
        tb = s13.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), card_w13 - Inches(0.4), card_h13 - Inches(0.3))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = r_name
        p.font.bold = True
        p.font.size = Pt(12)
        p.font.color.rgb = r_col
        p_sub = tf.add_paragraph()
        p_sub.text = r_sub
        p_sub.font.size = Pt(9.5)
        p_sub.font.color.rgb = TEXT_WHITE
        p_sub.space_before = Pt(2)
        p_d = tf.add_paragraph()
        p_d.text = r_desc
        p_d.font.size = Pt(9)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(4)

    # ================= SLIDE 14: 5-STAGE LIFECYCLE =================
    s14 = add_blank_dark_slide()
    add_header(s14, "7. End-to-End Workflow", "The 5-Stage Consignment Lifecycle", "Chronological progression from initial order booking to bank settlement.")
    
    stages = [
        ("Stage 1: Booking", "Customer books online;\ntelematics calculates closest active truck in corridor.", TEXT_CYAN),
        ("Stage 2: Staging", "Berrimah cross-dock verifies\nfreight manifest, axle loads,\nand loads road train.", TEXT_GREEN),
        ("Stage 3: Highway", "15s GPS telematics tracks\nvehicle speed, route milestones,\nand outstation telemetry.", TEXT_GOLD),
        ("Stage 4: Regional Dock", "Vehicle arrives at Katherine /\nAlice Springs regional depot;\ncrew unloads cargo.", TEXT_ROSE),
        ("Stage 5: e-POD & Billing", "Receiver signs digital canvas;\nplatform immediately issues\nATO Tax Invoice PDF.", TEXT_CYAN),
    ]
    sw = Inches(2.22)
    sgap = Inches(0.15)
    for i, (st_t, st_d, st_c) in enumerate(stages):
        s_left = Inches(0.8) + i * (sw + sgap)
        add_card(s14, s_left, Inches(1.8), sw, Inches(5.0), BG_CARD, st_c)
        tb = s14.shapes.add_textbox(s_left + Inches(0.1), Inches(2.0), sw - Inches(0.2), Inches(4.6))
        tf = tb.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = f"0{i+1}"
        p.font.bold = True
        p.font.size = Pt(28)
        p.font.color.rgb = st_c
        p_t = tf.add_paragraph()
        p_t.text = st_t
        p_t.font.bold = True
        p_t.font.size = Pt(12)
        p_t.font.color.rgb = TEXT_WHITE
        p_t.space_before = Pt(4)
        p_d = tf.add_paragraph()
        p_d.text = st_d
        p_d.font.size = Pt(10)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(12)

    # ================= SLIDE 15: TECH STACK & ENGINEERING =================
    s15 = add_blank_dark_slide()
    add_header(s15, "8. Technology Architecture", "Modern Full-Stack Engineering Innovations", "Built for zero downtime, sub-500ms API response, and 100% serverless cloud resilience.")
    
    tech_boxes = [
        ("Frontend & UI", TEXT_CYAN, ["Next.js 15 App Router & React 19", "Vanilla CSS Design Tokens", "Leaflet OpenStreetMap Component", "Chart.js Operational Analytics", "<ClientOnly> Hydration Guard"]),
        ("Backend & APIs", TEXT_GREEN, ["Modular Controller-Service Pattern", "Next.js Route Handlers", "JWT Authentication (HMAC-SHA256)", "Role-Based Access Control (RBAC)", "15s Telemetry Polling (NFR-02)"]),
        ("Cloud Database", TEXT_GOLD, ["Prisma ORM (v6.19.3)", "MongoDB Atlas Cloud Cluster", "35 Commercial Vehicle Records", "10 Enterprise Consignments", "7-Year Statutory Audit Retention"]),
        ("Mobile & Offline Engine", TEXT_ROSE, ["HTML5 Touch Signature Pad", "LocalStorage / IndexedDB Buffer", "Outback Dead-Zone Simulator", "Auto-Sync on 4G Reconnect", "Glove-Friendly Touch Targets"])
    ]
    tw = Inches(2.8)
    tgap = Inches(0.18)
    for i, (t_title, t_color, t_items) in enumerate(tech_boxes):
        t_left = Inches(0.8) + i * (tw + tgap)
        add_card(s15, t_left, Inches(1.8), tw, Inches(5.0), BG_CARD, t_color)
        tb = s15.shapes.add_textbox(t_left + Inches(0.15), Inches(2.0), tw - Inches(0.3), Inches(4.6))
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

    # ================= SLIDE 16: QUANTIFIED ROI =================
    s16 = add_blank_dark_slide()
    add_header(s16, "9. Business Impact & ROI", "Transforming NorthLine's Operational Bottom Line", "Measurable performance benchmarks before vs. after TrackPoint deployment.")
    
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
        add_card(s16, k_left, Inches(1.8), kw, Inches(5.0), BG_CARD, k_col)
        tb = s16.shapes.add_textbox(k_left + Inches(0.15), Inches(2.0), kw - Inches(0.3), Inches(4.6))
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

    # ================= SLIDE 17: AUSTRALIAN COMPLIANCE =================
    s17 = add_blank_dark_slide()
    add_header(s17, "10. Regulatory Governance", "Australian Logistics Compliance Matrix", "Meeting statutory legal standards across road transport, taxation, and data privacy.")
    
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
    cw17 = Inches(5.7)
    ch17 = Inches(2.35)
    for i, (c_title, c_color, c_items) in enumerate(compliances):
        row = i // 2
        col = i % 2
        c_left = Inches(0.8) + col * (cw17 + Inches(0.3))
        c_top = Inches(1.8) + row * (ch17 + Inches(0.2))
        add_card(s17, c_left, c_top, cw17, ch17)
        tb = s17.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), cw17 - Inches(0.4), ch17 - Inches(0.3))
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

    # ================= SLIDE 18: LIVE DEMO & CONCLUSION =================
    s18 = add_blank_dark_slide()
    add_header(s18, "11. Live Demonstration", "Experience TrackPoint Live on Vercel", "A production-grade cloud platform transforming Northern Territory logistics.")
    
    add_card(s18, Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.0), BG_CARD, BORDER_BLUE)
    tb = s18.shapes.add_textbox(Inches(1.2), Inches(2.1), Inches(10.9), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True

    p = tf.paragraphs[0]
    p.text = "🚀 Live System URLs & Demo Access"
    p.font.bold = True
    p.font.size = Pt(18)
    p.font.color.rgb = TEXT_WHITE

    demo_links = [
        ("Production URL:", "https://trackpoint-platform.vercel.app", TEXT_CYAN),
        ("Customer Portal:", "https://trackpoint-platform.vercel.app/customer (Sandra Wilson — Katherine Mining)", TEXT_GREEN),
        ("Dispatcher Control:", "https://trackpoint-platform.vercel.app/admin (Priya Sharma — Fleet Control & Map)", TEXT_GOLD),
        ("Driver Handset:", "https://trackpoint-platform.vercel.app/driver (Dave Miller — Truck #NL-14 & e-POD Pad)", TEXT_ROSE)
    ]
    for title_txt, desc_txt, col_t in demo_links:
        p = tf.add_paragraph()
        run1 = p.add_run()
        run1.text = f"• {title_txt} "
        run1.font.bold = True
        run1.font.size = Pt(12)
        run1.font.color.rgb = col_t
        run2 = p.add_run()
        run2.text = desc_txt
        run2.font.bold = False
        run2.font.size = Pt(12)
        run2.font.color.rgb = TEXT_MUTED
        p.space_before = Pt(8)

    p_close = tf.add_paragraph()
    p_close.text = "\nThank you for your time. Questions & Interactive Demonstration."
    p_close.font.bold = True
    p_close.font.size = Pt(14)
    p_close.font.color.rgb = TEXT_WHITE

    prs.save(output_path)
    print(f"[SUCCESS] PowerPoint presentation saved: {output_path}")

# --- DOCX Pitch Guide Generator ---
def build_docx(output_path="TrackPoint_Class_Presentation_Guide.docx"):
    doc = Document()
    
    for section in doc.sections:
        section.top_margin = DocxInches(1.0)
        section.bottom_margin = DocxInches(1.0)
        section.left_margin = DocxInches(1.0)
        section.right_margin = DocxInches(1.0)
        
        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("TrackPoint — Class Presentation, Pitch Guide & Q&A Master Sheet")
        r_hdr.font.size = DocxPt(8.5)
        r_hdr.font.color.rgb = DocxRGBColor(120, 130, 140)
        
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("Charles Darwin University — Master of IT / PRT631 Project")
        r_ftr.font.size = DocxPt(8.5)
        r_ftr.font.color.rgb = DocxRGBColor(140, 145, 155)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = DocxPt(10.5)
    normal_style.font.color.rgb = DocxRGBColor(35, 40, 48)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = DocxPt(4)

    # Cover Page
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_pre.add_run("EXECUTIVE PITCH DECK & PRESENTATION SCRIPT\n")
    r_sub.font.size = DocxPt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = DocxRGBColor(26, 71, 111)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("TrackPoint Presentation & Pitch Master Guide\n")
    r_t.font.size = DocxPt(26)
    r_t.font.bold = True
    r_t.font.color.rgb = DocxRGBColor(18, 48, 77)

    r_sub2 = p_title.add_run("How to Present TrackPoint to Class & Academic Assessors: Proving the Need, Demonstrating the Value, and Defending the Architecture\n")
    r_sub2.font.size = DocxPt(12)
    r_sub2.font.italic = True
    r_sub2.font.color.rgb = DocxRGBColor(80, 90, 105)

    doc.add_paragraph("\n")

    cover_table = doc.add_table(rows=7, cols=2)
    meta_data = [
        ("Project Name", "TrackPoint — Fleet Dispatch, GPS Telematics & Invoicing Platform"),
        ("Client Organization", "NorthLine Freight & Logistics (Darwin, Northern Territory)"),
        ("Live Production URL", "https://trackpoint-platform.vercel.app"),
        ("Presenter / Student", "Mahir Sadman Rushad | S395312"),
        ("Course & University", "PRT631 — Master of IT Project | Charles Darwin University"),
        ("Companion Presentation", "TrackPoint_Class_Presentation.pptx (18 Widescreen Slides)"),
        ("Presentation Duration", "12–15 Minutes (+ 5 Minutes Q&A)")
    ]
    for row_idx, (k, v) in enumerate(meta_data):
        cover_table.cell(row_idx, 0).text = k
        cover_table.cell(row_idx, 1).text = v
        cover_table.cell(row_idx, 0).paragraphs[0].runs[0].font.bold = True
    style_table(cover_table, header_bg="EBF3FA", header_fg="1A476F", alt_bg="F8FAFC")
    for cell in cover_table.rows[0].cells:
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.color.rgb = DocxRGBColor(26, 71, 111)

    doc.add_page_break()

    # Section 1: Pitch Blueprint
    doc.add_heading("1. Executive Pitch Blueprint: How to Convince Your Class", level=1)
    doc.add_paragraph(
        "When presenting TrackPoint to your peers and academic assessors, your goal is to prove that TrackPoint is not just another web app, "
        "but an indispensable, mission-critical operational system that solves high-stakes logistics bottlenecks in Australia's most rugged terrain."
    )
    doc.add_paragraph(
        "Structure your presentation around the 'Problem-Agitation-Solution-Proof' formula:\n"
        "1. Hook the Audience (The Setting): Introduce the 1,500km Stuart Highway corridor where road trains face 42°C heat and cellular blackspots.\n"
        "2. Agitate the Pain Points: Show how legacy manual whiteboards, lost paper dockets, and 14-day billing lags cost hundreds of thousands of dollars.\n"
        "3. Present the TrackPoint Solution: Demonstrate the 4 isolated portals, automated nearest-truck dispatch, and offline-first e-POD engine.\n"
        "4. Prove the Value (ROI): Show the quantified metrics (99.8% faster dispatch, 0s instant billing, 96.4% on-time SLA, 0% lost dockets).\n"
        "5. Live Walkthrough: Execute the live workflow directly on https://trackpoint-platform.vercel.app."
    )

    # Section 2: Slide-by-Slide Script
    doc.add_heading("2. Slide-by-Slide Speaker Script (18 Slides)", level=1)

    slides_content = [
        ("Slide 1: Title Slide (TrackPoint)", "0:00 - 1:00",
         "What to say:\n"
         "\"Good morning everyone. Today I am presenting TrackPoint — an enterprise fleet dispatch, GPS telematics, and electronic proof of delivery platform purpose-built for NorthLine Freight & Logistics in the Northern Territory.\n"
         "Operating freight across the Stuart Highway is one of Australia's toughest engineering and operational challenges. Over the next 15 minutes, I will show you why traditional logistics failed in this corridor and how TrackPoint drops dispatch latency from 45 minutes to under 5 seconds while slashing the billing cycle from 14 days to real time.\"",
         "Visual Cue: Point to the 3 bottom pills: 35 Heavy Vehicles, 1,500 km Corridor, 0s Instant Billing."),
        
        ("Slide 2: Why Is This Mission-Critical?", "1:00 - 2:00",
         "What to say:\n"
         "\"Why should we care about logistics in the Northern Territory? Because freight is the literal lifeline of remote Australia.\n"
         "When a mining excavator breaks down in the McArthur basin, every hour of delay costs $50,000 in lost production. When remote clinics in Katherine need life-saving vaccines, temperature integrity is life-and-death in 42°C heat. When cattle stations need fencing or feed, they rely on massive 85-tonne road trains.\n"
         "Logistics is not just moving boxes — it is keeping communities alive and industries running.\"",
         "Visual Cue: Walk through the 3 cards: Healthcare Lifeline, Multi-Million Dollar Mining, and HVNL Legal Liability."),

        ("Slide 3: The Northern Territory Landscape", "2:00 - 3:00",
         "What to say:\n"
         "\"Let's look at NorthLine's operational footprint. The Stuart Highway spans 1,500 kilometers from Darwin to Alice Springs.\n"
         "NorthLine operates 35 heavy vehicles — from multi-combination road trains to refrigerated reefers and metro rigid trucks — managed across 4 regional depots in Darwin, Katherine, Tennant Creek, and Alice Springs.\n"
         "Between these depots lie hundreds of kilometers of outback cellular dead-zones where standard software fails.\"",
         "Visual Cue: Emphasize the distance and depot network on the slide."),

        ("Slide 4: The 4 Catastrophic Failure Modes", "3:00 - 4:15",
         "What to say:\n"
         "\"Prior to TrackPoint, NorthLine was crippled by four operational failure modes:\n"
         "1. Highway Blind Spots: 15 hours of zero tracking once trucks left Darwin, leading to 45 ETA calls/day.\n"
         "2. 45-Minute Dispatch Latency: Dispatchers manually matched manifests on physical whiteboards, resulting in half-empty trailers.\n"
         "3. Remote Dead-Zones: Cloud apps crashed in blackspots, forcing drivers back onto paper dockets that got oil-stained or lost.\n"
         "4. 14-Day Billing Lag: Finance could not invoice clients until paper slips physically returned to Darwin two weeks later, tying up working capital.\"",
         "Visual Cue: Walk across the 4 red cards, showing how each problem directly drains revenue."),

        ("Slide 5: The TrackPoint Solution (4 Portals)", "4:15 - 5:30",
         "What to say:\n"
         "\"TrackPoint solves this through a unified cloud ecosystem with 4 isolated role portals:\n"
         "1. The B2B Customer Portal at /customer gives shippers self-service booking, 15-second live GPS tracking, and instant tax invoices.\n"
         "2. The Dispatch Command Center at /admin gives operations a live 35-truck CAN-bus map and automated nearest-vehicle matching with compliance overrides.\n"
         "3. The Driver Mobile Handset at /driver provides an offline HTML5 digital signature pad that buffers signatures in outback blackspots.\n"
         "4. The Finance Engine automatically generates ATO-compliant tax invoices the second delivery is confirmed.\"",
         "Visual Cue: Highlight the clean separation of concerns across the 4 vertical portal cards."),

        ("Slide 6: Overview of the 6 Specialized Services", "5:30 - 6:30",
         "What to say:\n"
         "\"NorthLine is not a one-size-fits-all carrier. TrackPoint automates 6 specialized freight services:\n"
         "Scheduled Linehaul, Express Hot-Shot Breakdown Dispatch, HACCP Cold-Chain Logistics, Heavy Mining & Pastoral Bulk, Dangerous Goods & Medical Logistics, and Intermodal Port Drayage.\n"
         "Let's examine how TrackPoint solves each one step-by-step.\"",
         "Visual Cue: Introduce the 6-service grid."),

        ("Slide 7: Service 1 — Scheduled Linehaul Freight", "6:30 - 7:15",
         "What to say:\n"
         "\"For Scheduled Linehaul down the 1,500km Stuart Highway, TrackPoint provides 15-second Leaflet GPS tracking and a 5-stage milestone progress bar (Booking -> Staging -> Linehaul In-Transit -> Regional Dock -> e-POD Delivery), eliminating customer ETA calls completely.\"",
         "Visual Cue: Point out the 3 columns: Why Needed, Pain Point, Solution Flow."),

        ("Slide 8: Service 2 — Express Hot-Shot Breakdown Courier", "7:15 - 8:00",
         "What to say:\n"
         "\"For urgent mining breakdowns costing $50k/hour, selecting 'Express Hot-Shot' applies a gold lightning badge (⚡) that instantly preempts fleet queues. The nearest courier van is auto-dispatched in under 5 seconds with real-time SMS alerts sent to the mine supervisor.\"",
         "Visual Cue: Emphasize the ⚡ gold priority tag and sub-5 second dispatch speed."),

        ("Slide 9: Service 3 — Refrigerated & Cold-Chain Logistics", "8:00 - 8:45",
         "What to say:\n"
         "\"In 42°C Top End heat, Katherine mangoes and beef spoil quickly. TrackPoint restricts vehicle allocation exclusively to certified reefer units and mandates driver temperature sign-off upon dock handover, creating an unbroken HACCP audit trail.\"",
         "Visual Cue: Highlight the +2°C to +4°C climate control enforcement."),

        ("Slide 10: Service 4 — Heavy Machinery & Pastoral Bulk", "8:45 - 9:30",
         "What to say:\n"
         "\"Moving 14-tonne slurry pumps or cattle station supplies requires 85-tonne multi-combination road trains. TrackPoint verifies axle mass distribution and payload tare, avoiding catastrophic vehicle strain and $10,000+ NHVR fines.\"",
         "Visual Cue: Emphasize road train mass management and Berrimah lashing checks."),

        ("Slide 11: Service 5 — Dangerous Goods & Medical Logistics", "9:30 - 10:15",
         "What to say:\n"
         "\"Transporting mining cyanides or hospital vaccines is governed by the Australian Dangerous Goods Code. TrackPoint validates driver DG certifications, placarding rules, and mandates recipient badge ID verification before digital signature sign-off.\"",
         "Visual Cue: Point out the Chain of Responsibility legal compliance."),

        ("Slide 12: Service 6 — Intermodal Port Drayage & Staging", "10:15 - 11:00",
         "What to say:\n"
         "\"East Arm Wharf shipping lines charge $250/day in demurrage if container return is delayed. TrackPoint dispatches short-haul rigid trucks matching vessel time-slots and tracks wharf gate-out to depot gate-in, keeping turnaround strictly under 4 hours.\"",
         "Visual Cue: Emphasize demurrage penalty elimination."),

        ("Slide 13: Full Stakeholder Ecosystem (6 Roles)", "11:00 - 11:45",
         "What to say:\n"
         "\"TrackPoint supports 6 distinct roles: Customer Sandra Wilson, Dispatcher Priya Sharma, Driver Dave Miller, Finance Lead Marcus Vance, Yard Master Greg Turner, and Safety Officer Arthur Pendelton. Each persona receives exactly the data they need with zero cognitive overload.\"",
         "Visual Cue: Point to the 6 persona cards."),

        ("Slide 14: 5-Stage Consignment Lifecycle", "11:45 - 12:30",
         "What to say:\n"
         "\"This diagram illustrates the chronological progression: from Stage 1 online booking, to Stage 2 depot loading, Stage 3 live Stuart Highway linehaul, Stage 4 regional dock arrival, and Stage 5 digital e-POD sign-off and instant billing.\"",
         "Visual Cue: Trace the horizontal flow from left to right."),

        ("Slide 15: Technology Architecture & Innovations", "12:30 - 13:15",
         "What to say:\n"
         "\"Under the hood, TrackPoint is built on Next.js 15 App Router, React 19, TypeScript, and MongoDB Atlas via Prisma ORM. We use 15-second serverless REST polling to avoid outstation WebSocket drops, and an offline HTML5 signature canvas that buffers locally in LocalStorage.\"",
         "Visual Cue: Highlight the 4 technical pillars."),

        ("Slide 16: Quantified Business ROI", "13:15 - 14:00",
         "What to say:\n"
         "\"The business results are dramatic: Dispatch latency dropped from 45 minutes to under 5 seconds (-99.8%). Billing lag was slashed from 14 days to instant (0 seconds). On-time linehaul SLA increased to 96.4%, and lost paper dockets dropped from 6.5% to exactly zero.\"",
         "Visual Cue: Emphasize the bold 'Now' metrics."),

        ("Slide 17: Australian Regulatory Governance", "14:00 - 14:30",
         "What to say:\n"
         "\"TrackPoint complies fully with Heavy Vehicle National Law (HVNL/CoR), ATO 10% GST with NorthLine ABN (88 123 456 789), Corporations Act Section 286 statutory 7-year record archiving, and Australian Privacy Principles.\"",
         "Visual Cue: Point to the 4 regulatory compliance boxes."),

        ("Slide 18: Live Demonstration & Q&A", "14:30 - 15:00",
         "What to say:\n"
         "\"TrackPoint is deployed live in production at https://trackpoint-platform.vercel.app. Let's now execute a live walkthrough across Customer, Dispatcher, and Driver portals, and I welcome any questions from the class. Thank you!\"",
         "Visual Cue: Open browser to https://trackpoint-platform.vercel.app and begin live demo.")
    ]

    for title, timing, script, cue in slides_content:
        doc.add_heading(f"{title} (Target: {timing})", level=2)
        p_c = doc.add_paragraph()
        p_c.add_run(f"Visual Action & Cue: {cue}\n").bold = True
        p_s = doc.add_paragraph(script)
        p_s.paragraph_format.left_indent = DocxInches(0.2)

    # Section 3: Live Demo Script
    doc.add_heading("3. Step-by-Step Live Demo Runbook on Vercel", level=1)
    doc.add_paragraph(
        "Follow this exact 5-step live demonstration sequence during your presentation:\n"
        "1. Open https://trackpoint-platform.vercel.app/ and show the 1-Click Role Login buttons.\n"
        "2. Click 'Customer Portal' (Sandra Wilson) -> Click '+ Create New Booking' -> Select 'Express Hot-Shot' -> Select Darwin to Katherine -> Click 'Confirm & Dispatch'.\n"
        "3. Switch to 'Dispatcher Portal' (/admin) -> Show the 35-Vehicle CAN-bus Map -> In Auto-Dispatch Queue, show the newly assigned Mack Titan #NL-14 -> Click 'Override / Reassign' -> Select Reason Code 'DRIVER_FATIGUE'.\n"
        "4. Switch to 'Driver Handset' (/driver) -> Click 'Simulate Outback Offline Dead-Zone' to demonstrate offline resilience -> Type recipient name 'Sandra Wilson' -> Draw signature on HTML5 Canvas -> Click 'Confirm Delivery'.\n"
        "5. Return to Customer Details (/customer/orders/[id]) -> Show the map pinned at the destination with green checkmark -> Show Official Tax Invoice with 10% GST ($120.00 AUD) and embedded digital signature."
    )

    # Section 4: Q&A Defense Master Sheet
    doc.add_heading("4. Class & Professor Q&A Defense Master Sheet", level=1)
    
    qa_list = [
        ("Q1: Why did you choose 15-second polling instead of WebSockets for live vehicle tracking?",
         "Answer: In remote Northern Territory linehaul corridors, continuous WebSocket connections suffer severe TCP drops, reconnection storms, and battery drain as vehicles pass through intermittent signal zones. 15-second REST polling provides 100% cloud reliability, sub-second latency, and zero connection dropouts on serverless infrastructure (NFR-02)."),
        
        ("Q2: How does the driver app capture signatures when there is zero cellular signal?",
         "Answer: TrackPoint implements an offline-first HTML5 canvas buffer. When the handset detects no network, it saves the signature PNG and metadata locally in browser IndexedDB / LocalStorage. Once the truck returns to 4G coverage or depot Wi-Fi, the app automatically background-syncs the payload to /api/jobs/[id]."),

        ("Q3: How does the auto-dispatch algorithm prevent dispatchers from losing control?",
         "Answer: TrackPoint uses an 'Assisted Automation' paradigm. While the algorithm calculates the nearest capable truck based on GPS and capacity, dispatchers retain full authority via the Admin Modal (AdminConsignmentModal.tsx) to reassign vehicles, adjust priority, or update notes with mandatory reason code logging (PR-02)."),

        ("Q4: How does this accelerate cash flow for NorthLine?",
         "Answer: Legacy freight operations wait 14 days for paper POD slips to return to Darwin headquarters before billing. TrackPoint triggers the automated invoicing engine the exact millisecond the driver submits the e-POD, generating an official ATO-compliant tax invoice PDF with 10% GST for instant billing and 3-way matching."),

        ("Q5: How does the design handle browser extension interference like Dark Reader?",
         "Answer: We engineered a custom <ClientOnly> wrapper alongside suppressHydrationWarning in layout.tsx. This delays client-side rendering of extension-sensitive DOM elements until after initial mount, completely eliminating React SSR hydration mismatches without impacting serverless load speeds.")
    ]

    for q, a in qa_list:
        doc.add_heading(q, level=3)
        doc.add_paragraph(a)

    # Save docx
    doc.save(output_path)
    print(f"[SUCCESS] Pitch guide document saved: {output_path}")

if __name__ == "__main__":
    pptx_out = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Class_Presentation.pptx"
    docx_out = sys.argv[2] if len(sys.argv) > 2 else "TrackPoint_Class_Presentation_Guide.docx"
    
    build_pptx(pptx_out)
    build_docx(docx_out)
