#!/usr/bin/env python3
"""
TrackPoint — Admin / Operations Command Center Presentation Generator (.pptx)
Generates a 12-slide, high-design 16:9 widescreen presentation presenting:
- Dispatcher, Fleet Manager & Finance Operations Control Center
- Problem Statement: Whiteboard Dispatch Chaos & 15-Hour Highway Blind Spots
- Screen-by-Screen Walkthrough (Consignments, Dispatch Board, Fleet Telematics, Clients, Invoices, Analytics)
- HVNL Chain of Responsibility Override Auditing, 85t Mass Management, and Live Production Links
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

def build_admin_presentation(output_path="TrackPoint_Admin_Portal_Presentation.pptx"):
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
    # SLIDE 1: Title Slide (Admin Command Center)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s1)
    add_card(s1, 1.0, 1.0, 11.333, 5.5, BG_CARD, BORDER_BLUE)

    tbox1 = s1.shapes.add_textbox(Inches(1.5), Inches(1.4), Inches(10.333), Inches(4.7))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p = tf1.paragraphs[0]
    p.text = "TRACKPOINT OPERATIONS PLATFORM"
    p.font.size = Pt(12)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf1.add_paragraph()
    p.text = "The Operations Command Center (Admin Portal)"
    p.font.size = Pt(30)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf1.add_paragraph()
    p.text = "Fleet Telematics, Sub-5s Nearest-Truck Dispatch, CoR Compliance & Automated Invoicing"
    p.font.size = Pt(14)
    p.font.italic = True
    p.font.color.rgb = TEXT_GOLD

    p = tf1.add_paragraph()
    p.text = "\n• Primary Stakeholder: Priya Sharma — Senior Freight Controller (Darwin Operations Control)\n" \
             "• Fleet Footprint: 35 Commercial Heavy Rigs, 60 Staff, 1,500km Stuart Highway Corridor\n" \
             "• Core Capabilities: Nearest-Truck Heuristic (FR-02), HVNL CoR Overrides, 15s GPS Map, 7-Yr Audit Locking\n" \
             "• Live Production Portal: https://trackpoint-platform.vercel.app/admin"
    p.font.size = Pt(11.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: Persona & Operational Reality (Priya Sharma)
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s2)
    add_header(s2, "Operations Stakeholder Profile", "Who Runs the Command Center & What Are Their Challenges?",
               "Orchestrating 35 road trains across 1,500km of extreme outback highway")

    # Left: Persona Card
    add_card(s2, 0.8, 1.8, 5.6, 5.0, BG_CARD, BORDER_BLUE)
    tb2_l = s2.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.2), Inches(4.6))
    tf2_l = tb2_l.text_frame
    tf2_l.word_wrap = True

    p = tf2_l.paragraphs[0]
    p.text = "📡 Primary Persona: Priya Sharma"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf2_l.add_paragraph()
    p.text = "Role: Senior Freight Operations Controller\nLocation: Darwin Berrimah Freight Terminal (NT)\nScope: Fleet Dispatch, Linehaul Scheduling & HVNL Safety"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_CYAN

    p = tf2_l.add_paragraph()
    p.text = "\nKey Responsibilities:\n" \
             "• Allocates 35 heavy vehicles (triple road trains, reefers, hot-shots) to incoming daily manifests.\n" \
             "• Supervises highway transit along the 1,500km Stuart Highway corridor in real-time.\n" \
             "• Handles route exceptions, weather cutoffs, and emergency mining hot-shot requests.\n" \
             "• Ensures 100% Chain of Responsibility (CoR) legal compliance under Heavy Vehicle National Law."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # Right: Operational Stakes
    add_card(s2, 6.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_MUTED)
    tb2_r = s2.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf2_r = tb2_r.text_frame
    tf2_r.word_wrap = True

    p = tf2_r.paragraphs[0]
    p.text = "⚠️ The High Stakes of Fleet Control"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf2_r.add_paragraph()
    p.text = "Why Manual Whiteboard Dispatch Failed:"
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_WHITE

    p = tf2_r.add_paragraph()
    p.text = "\n1. Axle Mass Overload Penalties ($10,000+):\n   Overloading an 85t triple road train causes catastrophic mechanical failure and massive NHVR fines.\n\n" \
             "2. 45-Minute Dispatch Lag:\n   Matching trucks by memory caused terminal congestion and $180,000/yr in driver overtime.\n\n" \
             "3. Personal Legal Liability under CoR:\n   Dispatchers can be criminally prosecuted for scheduling drivers into illegal fatigue breaches."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 3: Legacy Admin Pain Points Solved
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s3)
    add_header(s3, "Operational Pain Points", "The 4 Dispatch & Fleet Failure Modes Eliminated",
               "How TrackPoint replaces obsolete manual bottlenecks with cloud automation")

    pains = [
        ("1. 45-Minute Whiteboard Chaos", "Manual Memory Dispatching", "Dispatchers spent 45 minutes cross-referencing whiteboards and spreadsheets, resulting in sub-optimal trailer utilization.", TEXT_ROSE),
        ("2. 15-Hour Highway Blind Spot", "Zero Telematics Visibility", "Once trucks left Darwin, dispatchers had zero tracking for 15 hours, answering 45 frantic customer phone calls every day.", TEXT_ROSE),
        ("3. Unaudited Route Overrides", "HVNL CoR Legal Exposure", "Verbal route and driver reassignments left no paper trail, exposing dispatchers to personal criminal liability under HVNL.", TEXT_GOLD),
        ("4. 14-Day Manual Billing Lag", "Paper POD Re-Keying", "Finance waited 2 weeks for paper dockets to return in truck cabs, locking up $400,000 in working capital and slowing cash flow.", TEXT_GOLD)
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
    # SLIDE 4: Admin Portal Navigation Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s4)
    add_header(s4, "Command Center Navigation", "Admin Portal Navigation & Functional Architecture",
               "6 integrated operational workspaces powered by Next.js 15, Prisma ORM, and MongoDB Atlas")

    menus = [
        ("1. Consignments", "/admin/consignments", "Master registry, search, filters & CoR override modal.", TEXT_CYAN),
        ("2. Dispatch Board", "/admin/dispatch", "4-Column Kanban & sub-5s Auto-Match engine (FR-02).", TEXT_GREEN),
        ("3. NT Telematics", "/admin/fleet", "15-Second Leaflet map, 35 vehicles & reefer climate dials.", TEXT_GOLD),
        ("4. Client Accounts", "/admin/clients", "8 B2B corporate portfolios, credit limits & payment terms.", TEXT_ROSE),
        ("5. Invoices & e-POD", "/admin/invoices", "Master ATO billing ledger & 7-year audit retention.", TEXT_GREEN),
        ("6. Fleet Analytics", "/admin/analytics", "96.4% SLA gauge, fuel burn curves & DSO metrics.", TEXT_CYAN)
    ]

    for idx, (title, route, desc, col) in enumerate(menus):
        x = 0.8 + (idx % 3) * 3.95
        y = 1.8 + (idx // 3) * 2.6
        add_card(s4, x, y, 3.8, 2.35, BG_CARD, BORDER_MUTED)
        tb = s4.shapes.add_textbox(Inches(x + 0.15), Inches(y + 0.15), Inches(3.5), Inches(2.05))
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
        p.font.size = Pt(9.5)
        p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 5: Screen 1 — Consignments & Queue (/admin/consignments)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s5)
    add_header(s5, "Screen Walkthrough 1", "Consignments & Master Queue (/admin/consignments)",
               "The regulatory manifest intake gatekeeper enforcing HVNL Chain of Responsibility")

    add_card(s5, 0.8, 1.8, 6.0, 5.0, BG_CARD, BORDER_BLUE)
    tb5_l = s5.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.6), Inches(4.6))
    tf5_l = tb5_l.text_frame
    tf5_l.word_wrap = True

    p = tf5_l.paragraphs[0]
    p.text = "📋 What That Page Does"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf5_l.add_paragraph()
    p.text = "• Central repository for all active freight orders in the Northern Territory.\n" \
             "• Supports multi-parameter search (by #TP-XXXX, consignor, status, corridor).\n" \
             "• Priority filter pills: All, ⚡ Hot-Shot, ❄️ Reefer, 🏗️ Mining, ☣️ Dangerous Goods.\n" \
             "• Features the Chain of Responsibility Override Modal (AdminConsignmentModal.tsx)."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    p = tf5_l.add_paragraph()
    p.text = "\n👀 What to Expect on Screen"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf5_l.add_paragraph()
    p.text = "• Sortable data table showing payload tonnes, vehicle ID, driver, and status.\n" \
             "• Instant toast notifications on manifest or driver allocation updates."
    p.font.size = Pt(10)
    p.font.color.rgb = TEXT_MUTED

    add_card(s5, 7.1, 1.8, 5.4, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb5_r = s5.shapes.add_textbox(Inches(7.3), Inches(2.0), Inches(5.0), Inches(4.6))
    tf5_r = tb5_r.text_frame
    tf5_r.word_wrap = True

    p = tf5_r.paragraphs[0]
    p.text = "⚖️ HVNL CoR Audit Enforcement"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf5_r.add_paragraph()
    p.text = "Lifecycle Phase: Stage 1 Intake & Stage 2 Staging"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf5_r.add_paragraph()
    p.text = "\nMandatory Compliance Override Codes:\n" \
             "• DRIVER_FATIGUE: Replaces driver approaching 12h NHVR shift limit.\n" \
             "• CAPACITY_OVERLOAD: Prevents exceeding 85t road train GCM limits.\n" \
             "• WEATHER_DISRUPTION: Re-routes around wet-season flood closures.\n\n" \
             "Lifecycle Value: Eliminates verbal changes, creating an immutable audit trail."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 6: Screen 2 — Dispatcher Board (/admin/dispatch)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s6)
    add_header(s6, "Screen Walkthrough 2", "The Dispatcher Board & Auto-Match Engine (/admin/dispatch)",
               "Slashing dispatch latency from 45 minutes to < 5 seconds (-99.8%)")

    add_card(s6, 0.8, 1.8, 6.0, 5.0, BG_CARD, BORDER_BLUE)
    tb6_l = s6.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.6), Inches(4.6))
    tf6_l = tb6_l.text_frame
    tf6_l.word_wrap = True

    p = tf6_l.paragraphs[0]
    p.text = "🎯 4-Column Visual Kanban Workflow"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf6_l.add_paragraph()
    p.text = "1. Pending Allocation: Incoming customer bookings awaiting vehicle pairing.\n\n" \
             "2. Cross-Dock Staging: Cargo loading and mass verification at Darwin Berrimah.\n\n" \
             "3. Linehaul In-Transit: Active highway transit down the 1,500km Stuart Highway.\n\n" \
             "4. Completed / Delivered: Destination handover with signed digital e-POD."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    add_card(s6, 7.1, 1.8, 5.4, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb6_r = s6.shapes.add_textbox(Inches(7.3), Inches(2.0), Inches(5.0), Inches(4.6))
    tf6_r = tb6_r.text_frame
    tf6_r.word_wrap = True

    p = tf6_r.paragraphs[0]
    p.text = "⚡ Nearest-Truck Heuristic (FR-02)"
    p.font.size = Pt(15)
    p.font.bold = True
    p.font.color.rgb = TEXT_CYAN

    p = tf6_r.add_paragraph()
    p.text = "• One-Click Auto-Match: Queries 35 vehicles in MongoDB via Prisma in < 5s.\n\n" \
             "• Capability Matching: Evaluates tare mass, reefer units, and dangerous goods placarding.\n\n" \
             "• Gold Hot-Shot Preemption (⚡): Automatically advances urgent mining spares to top of queue.\n\n" \
             "• Lifecycle Value: Slashes dispatch time from 45 min to < 5s (-99.8%)."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 7: Screen 3 — NT Fleet Telematics (/admin/fleet)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s7)
    add_header(s7, "Screen Walkthrough 3", "Northern Territory Fleet Telematics (/admin/fleet)",
               "15-Second serverless GPS tracking across the 1,500km Stuart Highway corridor (NFR-02)")

    add_card(s7, 0.8, 1.8, 11.733, 5.0, BG_CARD, BORDER_BLUE)
    tb7 = s7.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.6))
    tf7 = tb7.text_frame
    tf7.word_wrap = True

    p = tf7.paragraphs[0]
    p.text = "🗺️ Complete Highway Transparency: Zero Blind Spots"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf7.add_paragraph()
    p.text = "• Interactive Leaflet Map: Full-screen GIS overlay of Stuart Highway (Darwin ➔ Adelaide River ➔ Katherine ➔ Mataranka ➔ Tennant Creek ➔ Alice Springs).\n" \
             "• 15-Second Serverless Polling (NFR-02): Robust stateless polling eliminating WebSocket disconnect storms in sparse outback coverage.\n" \
             "• Live CAN-Bus Telemetry: Real-time speed (88 km/h), vehicle heading, fuel tank % (74%), and battery voltage (24.2V).\n" \
             "• Cold-Chain Climate Gauges: Live ambient vs. setpoint monitoring (-18°C frozen / +4°C chilled) with high-temperature alarm triggers.\n" \
             "• 35-Asset Fleet Grid: Categorized by status (Available, Linehaul In-Transit, Cross-Dock Loading, Depot Maintenance).\n" \
             "• Lifecycle Value: Completely destroys the 15-hour highway visibility black hole, protecting perishables in 45°C heat."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 8: Screen 4 — Commercial Accounts (/admin/clients)
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s8)
    add_header(s8, "Screen Walkthrough 4", "Commercial Accounts & Credit Management (/admin/clients)",
               "Enforcing credit thresholds and coordinating B2B enterprise client relationships")

    add_card(s8, 0.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_BLUE)
    tb8_l = s8.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf8_l = tb8_l.text_frame
    tf8_l.word_wrap = True

    p = tf8_l.paragraphs[0]
    p.text = "🏢 Corporate Client Portfolio"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf8_l.add_paragraph()
    p.text = "• 8 Regional Corporate Accounts: Katherine Mining Supplies, Top End Mangoes, Alice Springs Hospital, McArthur Basin Energy, etc.\n\n" \
             "• Credit Limit Progress Bars: Displays approved credit (e.g., $150,000 AUD), utilization, and Net 30/60 terms.\n\n" \
             "• Active Consignment Quick-Links: 1-Click filter showing all active shipments for that specific customer."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    add_card(s8, 6.8, 1.8, 5.733, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb8_r = s8.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.6))
    tf8_r = tb8_r.text_frame
    tf8_r.word_wrap = True

    p = tf8_r.paragraphs[0]
    p.text = "🔒 Bad-Debt Prevention & AP Gatekeeper"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GOLD

    p = tf8_r.add_paragraph()
    p.text = "Lifecycle Phase: Pre-Booking Authorization (Stage 1) & Post-Delivery Settlement (Stage 5)\n\n" \
             "• Automated Credit Holds: Prevents dispatching high-value freight to delinquent accounts.\n\n" \
             "• Direct Billing Contacts: Routes tax invoices straight to verified corporate accounts payable contacts, eliminating payment delays."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 9: Screen 5 — Invoices & e-POD Audit (/admin/invoices)
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s9)
    add_header(s9, "Screen Walkthrough 5", "Master Billing & Statutory Audit Ledger (/admin/invoices)",
               "Instant tax invoice generation and 7-year audit retention under Corporations Act s286")

    add_card(s9, 0.8, 1.8, 5.7, 5.0, BG_CARD, BORDER_BLUE)
    tb9_l = s9.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(5.3), Inches(4.6))
    tf9_l = tb9_l.text_frame
    tf9_l.word_wrap = True

    p = tf9_l.paragraphs[0]
    p.text = "🧾 Automated ATO Tax Invoicing"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf9_l.add_paragraph()
    p.text = "• Event-Driven Trigger: Auto-generated the exact millisecond the e-POD signature is committed.\n\n" \
             "• ATO Compliance: Itemizes linehaul base, fuel levy, and 10% GST with NorthLine ABN (88 123 456 789).\n\n" \
             "• PDF Invoicing Engine: Compiles official Tax Invoice PDF (#INV-2026-XXXX) embedding digital glass signatures."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    add_card(s9, 6.8, 1.8, 5.733, 5.0, BG_CARD_LIGHT, BORDER_MUTED)
    tb9_r = s9.shapes.add_textbox(Inches(7.0), Inches(2.0), Inches(5.333), Inches(4.6))
    tf9_r = tb9_r.text_frame
    tf9_r.word_wrap = True

    p = tf9_r.paragraphs[0]
    p.text = "📜 7-Year Statutory Audit Retention"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_GREEN

    p = tf9_r.add_paragraph()
    p.text = "• Corporations Act Section 286: Mandates retaining financial records explaining transactions for 7 years.\n\n" \
             "• 1-to-1 Referential Locking: Pairs every invoice directly with its signed e-POD in MongoDB Atlas.\n\n" \
             "• Lifecycle Value: Slashes billing cycle from 14 days to 0 seconds, freeing $400,000 AUD in working capital."
    p.font.size = Pt(10.5)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 10: Screen 6 — Operations & Fuel Analytics (/admin/analytics)
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s10)
    add_header(s10, "Screen Walkthrough 6", "Operations & Fuel Analytics Cockpit (/admin/analytics)",
               "Executive business intelligence synthesizing operational data into actionable ROI")

    add_card(s10, 0.8, 1.8, 11.733, 5.0, BG_CARD, BORDER_BLUE)
    tb10 = s10.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.333), Inches(4.6))
    tf10 = tb10.text_frame
    tf10.word_wrap = True

    p = tf10.paragraphs[0]
    p.text = "📊 Real-Time Chart.js Executive KPI Dashboards"
    p.font.size = Pt(16)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf10.add_paragraph()
    p.text = "• 96.4% On-Time Delivery SLA: Real-time gauge tracking SLA performance against the 88.2% legacy baseline (+8.2% gain).\n\n" \
             "• Corridor Fuel Burn Curves: Compares liters/100km across Darwin-Katherine, Katherine-Tennant, and Tennant-Alice Springs to identify fuel anomalies.\n\n" \
             "• Days Sales Outstanding (DSO) Acceleration: Visual curve showing DSO reduction from 55 days to immediate electronic settlement.\n\n" \
             "• Revenue Breakdown by Service Tier: Donut distribution across Linehaul, Express Hot-Shot, Cold-Chain, and Mining Bulk.\n\n" \
             "• Lifecycle Value: Provides empirical data to optimize route profitability and eliminate $95,000/yr in driver overtime."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 11: Quantified Value for Operations & Dispatch
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s11)
    add_header(s11, "Quantified Business Impact", "Measurable Operational Transformation in Command Center",
               "Tangible improvements in speed, safety, cash flow, and regulatory compliance")

    metrics = [
        ("Dispatch Latency", "45 Minutes", "< 5 Seconds", "- 99.8% Latency Reduction", TEXT_GREEN),
        ("Stuart Hwy Visibility", "15-Hour Blind Spot", "15s Live GPS Stream", "100% Highway Transparency", TEXT_CYAN),
        ("Billing Lag (DSO)", "14 Days Waiting", "Instant (0 Seconds)", "- 100% Billing Lag Slashed", TEXT_GOLD),
        ("Annual Net Benefit", "$0 (Manual)", "+$205,000 / Year", "2.4-Year Payback Period", TEXT_GREEN)
    ]

    for idx, (metric, before, after, gain, col) in enumerate(metrics):
        x = 0.8 + (idx % 2) * 6.0
        y = 1.8 + (idx // 2) * 2.6
        add_card(s11, x, y, 5.7, 2.3, BG_CARD, BORDER_MUTED)
        tb = s11.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.15), Inches(5.3), Inches(2.0))
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
    # SLIDE 12: Live Production Verification
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_slide_bg(s12)
    add_header(s12, "Live Command Center Demo", "Experience the Live Operations Command Center in Production",
               "Deployed to Vercel Serverless with a live MongoDB Atlas cloud database")

    add_card(s12, 1.0, 1.8, 11.333, 5.0, BG_CARD, BORDER_BLUE)
    tb12 = s12.shapes.add_textbox(Inches(1.3), Inches(2.1), Inches(10.7), Inches(4.4))
    tf12 = tb12.text_frame
    tf12.word_wrap = True

    p = tf12.paragraphs[0]
    p.text = "🚀 Production Endpoints & Demonstration Flow"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE

    p = tf12.add_paragraph()
    p.text = "• Admin Operations Command Center: https://trackpoint-platform.vercel.app/admin\n" \
             "• Dispatcher Board (Kanban & Auto-Match): https://trackpoint-platform.vercel.app/admin/dispatch\n" \
             "• NT Fleet Telematics Map: https://trackpoint-platform.vercel.app/admin/fleet\n" \
             "• Invoices & Statutory Audit Ledger: https://trackpoint-platform.vercel.app/admin/invoices\n" \
             "• Operations Analytics Cockpit: https://trackpoint-platform.vercel.app/admin/analytics"
    p.font.size = Pt(12)
    p.font.color.rgb = TEXT_CYAN

    p = tf12.add_paragraph()
    p.text = "\nRecommended Live Demo Steps:\n" \
             "1. Open /admin/dispatch and demonstrate sub-5s Auto-Match vehicle pairing on a pending Hot-Shot order.\n" \
             "2. Open /admin/fleet to show live Leaflet mapping across Stuart Highway with 88 km/h speed indicators.\n" \
             "3. Open /admin/invoices to display instant ATO Tax Invoice generation and 7-year audit locking."
    p.font.size = Pt(11)
    p.font.color.rgb = TEXT_MUTED

    prs.save(output_path)
    print(f"[SUCCESS] Admin Presentation generated: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Admin_Portal_Presentation.pptx"
    build_admin_presentation(out_file)
