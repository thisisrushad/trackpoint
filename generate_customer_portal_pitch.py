#!/usr/bin/env python3
"""
TrackPoint — Customer Portal Executive Presentation Generator (.pptx)
Generates an 11-slide, high-design 16:9 widescreen presentation presenting:
- B2B Customer Portal Overview & Persona (Sandra Wilson - Katherine Mining Supplies)
- Legacy Customer Pain Points vs. TrackPoint Self-Service Solutions
- Screen-by-Screen Walkthrough (Dashboard, 6-Service Booking, 5-Stage GPS Tracker, Tax Invoices)
- Lifecycle Integration, Quantified Customer ROI, and Live Production Links
"""

import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# --- Color Palette (Tailored Slate/Navy Dark Mode with Cyan/Sky/Emerald Accents) ---
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

def build_customer_portal_presentation(output_path="TrackPoint_Customer_Portal_Presentation.pptx"):
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
        # Category Pill / Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.35))
        tf_c = cat_box.text_frame
        tf_c.word_wrap = True
        p_c = tf_c.paragraphs[0]
        p_c.text = category.upper()
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = TEXT_CYAN
        p_c.font.name = "Arial"

        # Main Title
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
    # SLIDE 1: Title Slide (Customer Portal Showcase)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s1)

    # Ambient Card
    add_card(s1, 1.0, 1.0, 11.333, 5.5, BG_CARD, BORDER_BLUE)

    tbox1 = s1.shapes.add_textbox(Inches(1.5), Inches(1.4), Inches(10.333), Inches(4.7))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "TRACKPOINT B2B PLATFORM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf1.add_paragraph()
    p.text = "The Customer Portal Deep-Dive"
    p.font.size = Pt(32)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf1.add_paragraph()
    p.text = "Self-Service Freight Booking, 15-Second Highway Telematics & Instant ATO Invoicing"
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = TEXT_GOLD

    p = tf1.add_paragraph()
    p.text = "\n• Target Persona: Sandra Wilson — Procurement & Supply Chain Lead (Katherine Mining Supplies Ltd)\n" \
             "• Freight Network: 1,500km Stuart Highway Corridor (Darwin ↔ Katherine ↔ Tennant Creek ↔ Alice Springs)\n" \
             "• Key Capabilities: 6-Tier Booking Wizard, Live Leaflet GPS Tracking, 5-Stage Milestone Chain, Instant PDF Tax Invoices\n" \
             "• Live Production Portal: https://trackpoint-platform.vercel.app/customer"
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: Persona & Customer Operational Context
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s2)
    add_header(s2, "B2B Customer Profile", "Who Uses the Portal & What Are Their Operating Realities?",
               "Empowering outback procurement officers and commercial shippers across the Northern Territory")

    # Left Card: Persona Profile
    add_card(s2, 0.8, 1.8, 5.6, 5.0, BG_CARD, BORDER_BLUE)
    tb2_l = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.6))
    tf2_l = tb2_l.text_frame
    tf2_l.word_wrap = True

    p = tf2_l.paragraphs[0]
    p.text = "👤 Target Persona: Sandra Wilson"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf2_l.add_paragraph()
    p.text = "Organization: Katherine Mining Supplies Ltd\nRole: Head of Procurement & Site Logistics\nLocation: Katherine Industrial Precinct (NT)"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_CYAN

    p = tf2_l.add_paragraph()
    p.text = "\nDaily Operational Responsibilities:\n" \
             "• Orders heavy drill rods, explosive slurry components, and hydraulic replacement parts from Darwin suppliers.\n" \
             "• Coordinates weekly dry grocery and workshop consumables linehaul.\n" \
             "• Manages receiving dock crews and mobile cranes for unloading road trains.\n" \
             "• Reconciles supplier freight invoices against Purchase Orders for Accounts Payable release."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Right Card: The NT Physical & Commercial Operating Reality
    add_card(s2, 6.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_MUTED)
    tb2_r = s2.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf2_r = tb2_r.text_frame
    tf2_r.word_wrap = True

    p = tf2_r.paragraphs[0]
    p.text = "🏜️ Outback Supply Chain Reality"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf2_r.add_paragraph()
    p.text = "The High Stakes of Stuart Highway Freight:"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    p = tf2_r.add_paragraph()
    p.text = "\n1. Severe Breakdown Penalties ($50k/hr):\n   If an open-cut excavator fails, emergency hot-shot parts must be booked and tracked without delay.\n\n" \
             "2. Extreme Ambient Heat (42°C - 45°C):\n   Refrigerated perishables and hospital supplies require continuous temperature verification.\n\n" \
             "3. Receiving Dock Labor Bottlenecks:\n   Forklift and crane operators cannot afford to sit idle waiting for unannounced trucks."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 3: The 4 Customer Pain Points Solved
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s3)
    add_header(s3, "Customer Problem Statement", "How Legacy Freight Systems Failed B2B Shippers",
               "Why traditional phone-and-paper logistics crippled customer efficiency and cash flow")

    pains = [
        ("1. 2-Hour Booking Lag", "Phone Tag & Manual Quotes", "Customers spent 2-4 hours exchanging phone calls and emails just to get rate estimates and booking confirmations.", TEXT_ROSE),
        ("2. 15-Hour Blind Spot", "Zero Highway Visibility", "Once trucks left Darwin, shippers had no way to track progress, forcing 45 anxious phone check-ins per day.", TEXT_ROSE),
        ("3. 14-Day Billing Delay", "Paper Docket Bottleneck", "Invoices were delayed until paper delivery slips returned to Darwin weeks later, stalling AP reconciliation.", TEXT_GOLD),
        ("4. Lost POD Dockets", "6.5% Delivery Disputes", "Oil-stained, illegible, or lost paper dockets caused invoice disputes and delayed payment releases.", TEXT_GOLD)
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
    # SLIDE 4: Customer Portal Menu & Navigation Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s4)
    add_header(s4, "Portal Architecture", "Customer Portal Menu & Navigation Structure",
               "A streamlined, self-service web application built with Next.js 15, Vanilla CSS, and Leaflet.js")

    menus = [
        ("1. Overview & Dashboard", "/customer", "Executive KPI cards, active order metrics, monthly spend, and quick-launch new booking button.", TEXT_CYAN),
        ("2. Consignments & Booking", "/customer/orders", "6-Service online booking wizard (FR-01), manifest entry, instant rate calculation, and order catalog.", TEXT_GREEN),
        ("3. 5-Stage Live GPS Tracker", "/customer/orders/[id]", "Interactive Leaflet highway map, live vehicle speed (88 km/h), and verified 5-stage milestone chain.", TEXT_GOLD),
        ("4. Tax Invoices & e-PODs", "/customer/invoices", "Instant downloadable ATO Tax Invoice PDFs (10% GST, ABN) with embedded recipient digital glass signatures.", TEXT_ROSE)
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
        p.text = "\n\nLifecycle Role:\n" + ("Account Intake" if idx == 0 else "Stage 1 Booking" if idx == 1 else "Stage 3/4 Tracking" if idx == 2 else "Stage 5 Settlement")
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = TEXT_CYAN

    # =========================================================================
    # SLIDE 5: Screen 1 — Overview & Dashboard (/customer)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s5)
    add_header(s5, "Screen Walkthrough 1", "Overview & Executive Dashboard (/customer)",
               "Instant operational clarity and portfolio visibility upon login")

    # Left: What That Page Does & Expectation
    add_card(s5, 0.8, 1.8, 6.0, 5.0, BG_CARD, BORDER_BLUE)
    tb5_l = s5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.6), Inches(4.6))
    tf5_l = tb5_l.text_frame
    tf5_l.word_wrap = True

    p = tf5_l.paragraphs[0]
    p.text = "🖥️ What That Page Does"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf5_l.add_paragraph()
    p.text = "• Provides logistics managers with an instant summary of all goods in motion.\n" \
             "• Displays 4 summary KPI tiles: Active In-Transit, Delivered This Month, Outstanding Invoices, and Total Spend.\n" \
             "• Features a '+ Book New Freight Shipment' quick-launch action.\n" \
             "• Lists the 5 most recent consignments with direct tracking links."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    p = tf5_l.add_paragraph()
    p.text = "\n👀 What to Expect on Screen"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf5_l.add_paragraph()
    p.text = "• Real-time Darwin ACST clock & user badge (Sandra Wilson).\n" \
             "• Color-coded status badges: 🔵 In-Transit, 🟢 Delivered, 🟡 Pending.\n" \
             "• Clickable rows opening live tracking maps instantly."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Right: Lifecycle Impact & Business Value
    add_card(s5, 7.1, 1.8, 5.4, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb5_r = s5.shapes.add_textbox(Inches(7.3), Inches(2.0), Inches(5.0), Inches(4.6))
    tf5_r = tb5_r.text_frame
    tf5_r.word_wrap = True

    p = tf5_r.paragraphs[0]
    p.text = "⚡ Lifecycle & Business Value"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf5_r.add_paragraph()
    p.text = "Lifecycle Phase: Account Intake & Daily Overview"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf5_r.add_paragraph()
    p.text = "\nKey Benefits Delivered:\n" \
             "• Zero Phone Inquiries: Procurement officers see exact shipment statuses without calling Darwin dispatch.\n" \
             "• Budget Tracking: Real-time spend metrics prevent monthly logistics budget overruns.\n" \
             "• Frictionless Navigation: Seamless access to booking, tracking, and billing in under 2 clicks."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 6: Screen 2 — The 6-Service Booking Engine (/customer/orders)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s6)
    add_header(s6, "Screen Walkthrough 2", "The 6-Service Online Booking Wizard (/customer/orders)",
               "Standardized digital order initiation replacing email chains and phone quotes (FR-01)")

    # Left: The 6 Service Tiers Available in Wizard
    add_card(s6, 0.8, 1.8, 6.2, 5.0, BG_CARD, BORDER_BLUE)
    tb6_l = s6.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.8), Inches(4.6))
    tf6_l = tb6_l.text_frame
    tf6_l.word_wrap = True

    p = tf6_l.paragraphs[0]
    p.text = "📦 The 6 Freight Service Tiers in Wizard"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    services = [
        ("⚡ Express Hot-Shot", "Emergency mining breakdown spares; sub-5s vehicle matching."),
        ("🚛 Scheduled Linehaul", "General dry freight down Stuart Highway on triple road trains."),
        ("❄️ HACCP Cold-Chain", "Refrigerated perishables & vaccines with mandatory temp setpoint."),
        ("🏗️ Heavy Mining Bulk", "14t+ oversized plant equipment, slurry pumps & structural steel."),
        ("☣️ Dangerous Goods", "Cyanides & bulk fuel requiring ADG certified vehicles & placarding."),
        ("🚢 Intermodal Drayage", "20ft/40ft wharf shipping containers between East Arm Port & Depots.")
    ]

    for s_name, s_desc in services:
        p = tf6_l.add_paragraph()
        p.text = f"• {s_name}: {s_desc}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MUTED

    # Right: Booking Mechanics & Lifecycle Impact
    add_card(s6, 7.3, 1.8, 5.2, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb6_r = s6.shapes.add_textbox(Inches(7.5), Inches(2.0), Inches(4.8), Inches(4.6))
    tf6_r = tb6_r.text_frame
    tf6_r.word_wrap = True

    p = tf6_r.paragraphs[0]
    p.text = "⚙️ Booking Wizard Mechanics"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf6_r.add_paragraph()
    p.text = "1. Origin & Destination Depots:\n   Select Darwin, Katherine, Tennant Creek, or Alice Springs.\n\n" \
             "2. Payload & Dimensions:\n   Captures weight in tonnes and pallet volume.\n\n" \
             "3. Automated Cost & ETA Estimation:\n   Calculates base linehaul rate, fuel levy, and transit ETA instantly.\n\n" \
             "4. Lifecycle Impact (Stage 1):\n   Reduces booking time from 2 hours to 60 seconds."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 7: Screen 3 — Live 5-Stage GPS Highway Tracker (/customer/orders/[id])
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s7)
    add_header(s7, "Screen Walkthrough 3", "Live 5-Stage GPS Highway Telematics Tracker",
               "15-Second Leaflet map updates and verified chain-of-custody progression (FR-05, FR-06)")

    # Top: The 5-Stage Milestone Chain Card
    add_card(s7, 0.8, 1.8, 11.733, 1.6, BG_CARD, BORDER_BLUE)
    tb7_t = s7.shapes.add_textbox(Inches(1.0), Inches(1.9), Inches(11.333), Inches(1.4))
    tf7_t = tb7_t.text_frame
    tf7_t.word_wrap = True

    p = tf7_t.paragraphs[0]
    p.text = "📍 THE 5-STAGE OPERATIONAL MILESTONE CHAIN"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf7_t.add_paragraph()
    p.text = "1. Booking Confirmed ➔ 2. Loaded at Depot ➔ 3. Highway In-Transit ➔ 4. Regional Cross-Dock ➔ 5. Signed Delivery"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf7_t.add_paragraph()
    p.text = "Each stage records verified UTC timestamps, preventing disputes over loading times, linehaul transit, and delivery handovers."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED

    # Bottom Left: Leaflet Telematics Mapping
    add_card(s7, 0.8, 3.6, 5.7, 3.3, BG_CARD_LIGHT, BORDER_MUTED)
    tb7_bl = s7.shapes.add_textbox(Inches(1.0), Inches(3.75), Inches(5.3), Inches(3.0))
    tf7_bl = tb7_bl.text_frame
    tf7_bl.word_wrap = True

    p = tf7_bl.paragraphs[0]
    p.text = "🗺️ 15-Second Highway Mapping"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf7_bl.add_paragraph()
    p.text = "• Leaflet.js map with custom SVG road-train markers.\n" \
             "• Ingests CAN-bus telemetry every 15 seconds (NFR-02).\n" \
             "• Displays live speed (88 km/h), vehicle heading, and current outback roadhouse waypoint (e.g., Mataranka)."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED

    # Bottom Right: Driver & Vehicle Identification
    add_card(s7, 6.8, 3.6, 5.733, 3.3, BG_CARD_LIGHT, BORDER_MUTED)
    tb7_br = s7.shapes.add_textbox(Inches(7.0), Inches(3.75), Inches(5.333), Inches(3.0))
    tf7_br = tb7_br.text_frame
    tf7_br.word_wrap = True

    p = tf7_br.paragraphs[0]
    p.text = "🚛 In-Transit Vehicle & Driver Badge"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf7_br.add_paragraph()
    p.text = "• Prime Mover ID: Truck #NL-14 (Mack Titan 685hp Tri-Drive)\n" \
             "• Driver Name: Dave Miller (Heavy Combination Certified)\n" \
             "• Temperature Telemetry: -18.2°C (Reefer Setpoint Verified)\n" \
             "• Value: Dock crews stage cranes in advance, saving 45 min/drop."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 8: Screen 4 — Digital Tax Invoices & e-POD Receipts (/customer/invoices)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s8)
    add_header(s8, "Screen Walkthrough 4", "Digital Tax Invoicing & e-POD Signature Receipts",
               "Instant 3-way reconciliation and automated ATO compliance (FR-08, CR-01, CR-04)")

    # Left: Automated Invoicing Engine
    add_card(s8, 0.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_BLUE)
    tb8_l = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf8_l = tb8_l.text_frame
    tf8_l.word_wrap = True

    p = tf8_l.paragraphs[0]
    p.text = "🧾 Automated ATO Tax Invoicing"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf8_l.add_paragraph()
    p.text = "• Event-Driven Generation: Generated the exact millisecond the recipient signs the driver tablet.\n" \
             "• ATO Compliance: Itemizes base freight, fuel levy, and 10% Australian GST with NorthLine ABN (88 123 456 789).\n" \
             "• One-Click Download: Customer accounts payable team downloads official PDF (#INV-2026-XXXX) directly from the portal."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Right: Embedded Digital Glass Signature
    add_card(s8, 6.8, 1.8, 5.733, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb8_r = s8.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.6))
    tf8_r = tb8_r.text_frame
    tf8_r.word_wrap = True

    p = tf8_r.paragraphs[0]
    p.text = "✍️ Proof-of-Delivery Verification"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf8_r.add_paragraph()
    p.text = "• Embedded Glass Signature: PDF embeds the exact digital signature drawn on the driver's HTML5 canvas pad.\n" \
             "• Signee Metadata: Records recipient printed name, optional badge ID, and GPS coordinates at time of signing.\n" \
             "• 3-Way Reconciliation: Customer AP teams match PO + Goods Receipt + Invoice immediately, slashing DSO from 45 days to 0."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 9: Lifecycle Integration (How Portal Fits the Whole System)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s9)
    add_header(s9, "Lifecycle Integration", "How the Customer Portal Drives the Freight Lifecycle",
               "Seamless end-to-end integration across Dispatchers, Drivers, Yard Masters, and Finance")

    steps = [
        ("Step 1: Customer Booking", "Customer submits order on /customer/orders. Nearest truck auto-matched in < 5s.", TEXT_CYAN),
        ("Step 2: Yard Staging", "Berrimah Yard Master verifies manifest and load mass against 85t GCM limits.", TEXT_GREEN),
        ("Step 3: Linehaul Telematics", "Customer tracks vehicle in real-time via /customer/orders/[id] (15s Leaflet stream).", TEXT_GOLD),
        ("Step 4: Outstation e-POD", "Driver captures digital signature on /driver/active (offline buffer active).", TEXT_ROSE),
        ("Step 5: Instant Settlement", "Tax Invoice PDF auto-generated on /customer/invoices for immediate payment.", TEXT_GREEN)
    ]

    for idx, (title, desc, col) in enumerate(steps):
        x = 0.8 + idx * 2.38
        add_card(s9, x, 1.8, 2.25, 5.0, BG_CARD, BORDER_MUTED)
        tb = s9.shapes.add_textbox(Inches(x + 0.1), Inches(2.0), Inches(2.05), Inches(4.5))
        tf = tb.text_frame
        tf.word_wrap = True

        p = tf.paragraphs[0]
        p.text = f"STEP {idx + 1}"
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col

        p = tf.add_paragraph()
        p.text = title
        p.font.size = Pt(13)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE

        p = tf.add_paragraph()
        p.text = f"\n{desc}"
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 10: Quantified Customer ROI & Value Delivered
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s10)
    add_header(s10, "Business Impact & ROI", "Quantified Customer Transformation & Benefits",
               "Delivering speed, certainty, and financial transparency to B2B enterprise clients")

    metrics = [
        ("Booking Time", "2 Hours", "60 Seconds", "- 95% Friction Slashed", TEXT_GREEN),
        ("ETA Phone Inquiries", "45 Calls/Day", "0 Calls/Day", "100% Self-Service Visibility", TEXT_CYAN),
        ("Billing Turnaround", "14 Days", "Instant (0s)", "- 100% Invoicing Lag Removed", TEXT_GOLD),
        ("Lost POD Disputes", "6.5% Disputed", "0.0% Loss", "100% Clean Audit Compliance", TEXT_GREEN)
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
    # SLIDE 11: Live Production Verification & Presentation Summary
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s11)
    add_header(s11, "Live Demonstration", "Experience the Live Customer Portal in Production",
               "Fully deployed, responsive, and connected to the live MongoDB Atlas cloud database")

    add_card(s11, 1.0, 1.8, 11.333, 5.0, BG_CARD, BORDER_BLUE)
    tb11 = s11.shapes.add_textbox(Inches(1.3), Inches(2.1), Inches(10.7), Inches(4.4))
    tf11 = tb11.text_frame
    tf11.word_wrap = True

    p = tf11.paragraphs[0]
    p.text = "🚀 Production Endpoints & Live Verification"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf11.add_paragraph()
    p.text = "• Customer Portal URL: https://trackpoint-platform.vercel.app/customer\n" \
             "• Active Customer Orders: https://trackpoint-platform.vercel.app/customer/orders\n" \
             "• Digital Invoices Repository: https://trackpoint-platform.vercel.app/customer/invoices\n" \
             "• Main Application Hub: https://trackpoint-platform.vercel.app"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_CYAN

    p = tf11.add_paragraph()
    p.text = "\nRecommended Live Pitch Flow:\n" \
             "1. Log into /customer as Sandra Wilson (Katherine Mining Supplies).\n" \
             "2. Click '+ Book New Freight Shipment', select '⚡ Express Hot-Shot' from Darwin to Katherine, and submit.\n" \
             "3. Watch the sub-5s vehicle matching engine assign Truck #NL-14.\n" \
             "4. Open the 5-Stage Live GPS Tracker to view real-time highway telematics.\n" \
             "5. Demonstrate immediate PDF Tax Invoice generation with digital signature upon delivery."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    prs.save(output_path)
    print(f"[SUCCESS] Presentation generated: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Customer_Portal_Presentation.pptx"
    build_customer_portal_presentation(out_file)
