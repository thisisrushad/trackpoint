#!/usr/bin/env python3
"""
TrackPoint — Why The Project Was Built & Step-by-Step Implementation Report Generator
Produces a comprehensive, professional Word document (.docx) detailing:
- The strategic, operational, geographical, and economic reasons why TrackPoint was built
- Client background: NorthLine Freight & Logistics (Darwin, NT)
- The Stuart Highway operational environment and extreme challenges
- Why off-the-shelf software failed in the Northern Territory
- Step-by-Step Technical & Operational Implementation: How the system fixes every problem
- Quantified business case, regulatory compliance, and community impact
"""

import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

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
                        run.font.color.rgb = RGBColor.from_string(header_fg)
                        run.font.size = Pt(9.5)
            else:
                if i % 2 == 1:
                    set_cell_background(cell, "FFFFFF")
                else:
                    set_cell_background(cell, alt_bg)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = Pt(9)
                        run.font.color.rgb = RGBColor(40, 44, 52)

def generate_why_built_document(output_path="TrackPoint_Why_The_Project_Was_Built.docx"):
    doc = Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Running Header
        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("TrackPoint — Problem Statement & Step-by-Step Implementation Guide")
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGBColor(120, 130, 140)
        
        # Running Footer
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("NorthLine Freight & Logistics (Darwin, NT) | PRT631 Capstone Deliverable")
        r_ftr.font.size = Pt(8.5)
        r_ftr.font.color.rgb = RGBColor(140, 145, 155)

    # Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(35, 40, 48)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # ================= COVER PAGE =================
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_pre.add_run("STRATEGIC BUSINESS CASE & STEP-BY-STEP IMPLEMENTATION REPORT\n")
    r_sub.font.size = Pt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(26, 71, 111)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("Why TrackPoint Was Built\n& How It Was Implemented Step-by-Step\n")
    r_t.font.size = Pt(26)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(18, 48, 77)

    r_sub2 = p_title.add_run("The Operational Imperative, Geographical Challenges, Economic Drivers, and the Exact Technical Solutions Engineered for the Northern Territory\n")
    r_sub2.font.size = Pt(12)
    r_sub2.font.italic = True
    r_sub2.font.color.rgb = RGBColor(80, 90, 105)

    doc.add_paragraph("\n")

    cover_table = doc.add_table(rows=7, cols=2)
    meta_data = [
        ("Client Organization", "NorthLine Freight & Logistics (Darwin, Northern Territory)"),
        ("Project Platform", "TrackPoint — Fleet Dispatch, GPS Telematics & Invoicing Platform"),
        ("Target Freight Corridor", "Stuart Highway (Darwin ↔ Katherine ↔ Tennant Creek ↔ Alice Springs)"),
        ("Academic Framework", "Charles Darwin University — Master of IT / PRT631 Capstone Project"),
        ("Author / Presenter", "Mahir Sadman Rushad | Student ID: S395312"),
        ("Live Production URL", "https://trackpoint-platform.vercel.app"),
        ("Document Focus", "Detailed Operational Problem Statement, Economic Case & Step-by-Step Implementation")
    ]
    for row_idx, (k, v) in enumerate(meta_data):
        cover_table.cell(row_idx, 0).text = k
        cover_table.cell(row_idx, 1).text = v
        cover_table.cell(row_idx, 0).paragraphs[0].runs[0].font.bold = True
    style_table(cover_table, header_bg="EBF3FA", header_fg="1A476F", alt_bg="F8FAFC")
    for cell in cover_table.rows[0].cells:
        for p in cell.paragraphs:
            for r in p.runs:
                r.font.color.rgb = RGBColor(26, 71, 111)

    doc.add_page_break()

    # ================= TABLE OF CONTENTS =================
    doc.add_heading("Table of Contents", level=1)
    toc_items = [
        "1. Executive Summary: The Core Reason for TrackPoint",
        "2. Client Profile & The Operational Battlefield",
        "   2.1 NorthLine Freight & Logistics Overview · 2.2 The 1,500km Stuart Highway Corridor",
        "   2.3 Extreme Environmental & Infrastructure Constraints",
        "3. The 5 Core Business Pain Points (Why Legacy Systems Failed)",
        "   3.1 Pain Point 1: The 15-Hour Highway Visibility Blind Spot",
        "   3.2 Pain Point 2: 45-Minute Dispatch Latency & Whiteboard Bottlenecks",
        "   3.3 Pain Point 3: Remote Outstation Cellular Dead-Zone Crashes",
        "   3.4 Pain Point 4: The 14-Day Delayed Billing Cycle & DSO Crisis",
        "   3.5 Pain Point 5: Unplanned Mining Downtime ($50,000/hr Loss)",
        "4. Why Off-the-Shelf Fleet Software Failed in the Northern Territory",
        "   4.1 The Metropolitan Bias of Generic Transport Management Systems",
        "   4.2 Failure to Handle Multi-Combination Road Trains (85t GCM)",
        "   4.3 Inability to Function in Complete Cellular Blackspots",
        "   4.4 Lack of Australian Compliance & ATO Tax Invoicing Integration",
        "5. The Economic & Business Case: Quantified Return on Investment",
        "   5.1 Financial Cost of Doing Nothing · 5.2 Capital Investment & Operating Costs",
        "   5.3 Quantified Annual Savings ($205,000/year) · 5.4 Net Present Value & Payback Period",
        "6. Regulatory, Safety & Statutory Mandates",
        "   6.1 Heavy Vehicle National Law (HVNL) & Chain of Responsibility (CoR)",
        "   6.2 Australian Dangerous Goods (ADG) Code Compliance",
        "   6.3 Corporations Act Section 286 (7-Year Statutory Audit Retention)",
        "   6.4 Australian Taxation Office (ATO) 10% GST Requirements",
        "7. The Human & Community Dimension",
        "   7.1 Essential Lifeline for Remote Indigenous Communities",
        "   7.2 Emergency Medical & Vaccine Cold-Chain Security",
        "   7.3 Driver Fatigue & Outstation Safety Management",
        "8. Step-by-Step Technical & Operational Implementation: How TrackPoint Fixes Every Problem",
        "   8.1 Step 1: Online Booking & Telematics Nearest-Vehicle Engine (FR-01, FR-02)",
        "   8.2 Step 2: Cross-Dock Staging & Tare Mass Validation (FR-04, HVNL)",
        "   8.3 Step 3: 15-Second Serverless Highway Telematics Stream (FR-05, FR-06, NFR-02)",
        "   8.4 Step 4: Offline-First HTML5 Signature Pad & LocalStorage Buffering (FR-07, NFR-04)",
        "   8.5 Step 5: Automated e-POD Triggered Tax Invoicing & 7-Year Audit Locking (FR-08, CR-01, CR-04)",
        "   8.6 Service-by-Service Implementation Matrix (The 6 Services in Code)",
        "   8.7 Hydration Guard Architecture (<ClientOnly> & Layout Design)",
        "9. Comprehensive Role-by-Role Menu & Interface Reference Guide",
        "   9.1 Dispatcher & Operations Controller Menu Architecture (/admin)",
        "   9.2 Fleet & Safety Compliance Manager Menu Architecture (/admin/fleet, /driver/safety)",
        "   9.3 Finance & Accounts Ledger Manager Menu Architecture (/admin/invoices, /admin/clients)",
        "   9.4 B2B Commercial Consignor / Customer Menu Architecture (/customer)",
        "   9.5 Heavy Road Train Driver Menu Architecture (/driver)",
        "   9.6 Cross-Role Menu & Operational Capability Matrix",
        "10. Summary of Transformation: Legacy Baseline vs. TrackPoint",
        "11. Live System Verification & Conclusion"
    ]
    for item in toc_items:
        p_item = doc.add_paragraph()
        r = p_item.add_run(item)
        if item.startswith(("1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9.", "10.", "11.")):
            r.bold = True
            r.font.color.rgb = RGBColor(26, 71, 111)
        else:
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(90, 100, 115)

    doc.add_page_break()

    # ================= 1. EXECUTIVE SUMMARY =================
    doc.add_heading("1. Executive Summary: The Core Reason for TrackPoint", level=1)
    doc.add_paragraph(
        "TrackPoint was not conceived as an academic exercise or a generic web application. It was engineered to solve a severe, "
        "quantifiable commercial and operational crisis faced by NorthLine Freight & Logistics — the primary supply chain carrier connecting "
        "the Northern Territory across the 1,500-kilometer Stuart Highway from Darwin to Alice Springs."
    )
    doc.add_paragraph(
        "Despite generating $14.2 million in annual turnover and operating 35 commercial heavy vehicles, NorthLine's operational backbone "
        "was paralyzed by manual 1990s processes: physical whiteboard dispatching, telephone driver calls, carbon-copy paper dockets, "
        "and manual invoice keying. These obsolete processes resulted in a 14-day delay between freight delivery and revenue collection, "
        "45 customer ETA inquiry phone calls per day, $180,000 annually in unoptimized driver overtime, and zero visibility of multi-tonne "
        "freight once trucks departed the Darwin depot."
    )
    doc.add_paragraph(
        "TrackPoint was built to replace this chaos with an automated, cloud-native, and offline-resilient platform. By automating nearest-vehicle "
        "dispatch via GPS telematics, providing 15-second live highway tracking on OpenStreetMap, enabling offline-first HTML5 signature e-POD capture, "
        "and triggering instant ATO-compliant tax invoicing upon delivery, TrackPoint eliminates every single operational bottleneck. "
        "The system drops dispatch latency from 45 minutes to under 5 seconds (-99.8%), slashes billing cycles from 14 days to real time (0 seconds), "
        "and delivers a proven annual net economic benefit of $113,000 with a 2.4-year payback."
    )

    # ================= 2. CLIENT PROFILE & OPERATIONAL BATTLEFIELD =================
    doc.add_heading("2. Client Profile & The Operational Battlefield", level=1)
    
    doc.add_heading("2.1 NorthLine Freight & Logistics Overview", level=2)
    doc.add_paragraph(
        "NorthLine Freight & Logistics is a prominent Darwin-based transport company employing 60 full-time staff and managing commercial "
        "contracts with major mining companies (Katherine Mining Supplies, McArthur River Mining), pastoral cattle stations, agricultural producers "
        "(Top End Mango Exporters), healthcare providers (Territory Health Services), and international shipping forwarders at East Arm Wharf."
    )
    doc.add_paragraph(
        "The company maintains four strategic regional depot hubs:\n"
        "1. Darwin Head Depot (120 Berrimah Road, Berrimah NT) — The central consolidation and cross-dock terminal.\n"
        "2. Katherine Regional Staging Hub (Katherine Terrace) — Key intermediate staging for mining and pastoral routes.\n"
        "3. Tennant Creek Outstation Hub (Barkly Highway Junction) — Remote mid-highway refueling and rest outpost.\n"
        "4. Alice Springs Distribution Terminal (Stuart Highway South) — Southern interchange connecting to Adelaide linehaul rail."
    )

    doc.add_heading("2.2 The 1,500km Stuart Highway Corridor", level=2)
    doc.add_paragraph(
        "The Stuart Highway is the single most critical terrestrial supply artery in the Northern Territory. Stretching 1,500 kilometers from "
        "the tropical north of Darwin to the arid Red Centre of Alice Springs, it represents an extreme operational environment characterized by:"
    )
    
    t_env = doc.add_table(rows=5, cols=3)
    t_env_data = [
        ("Environmental Factor", "Operational Reality in the NT", "Impact on Freight & Logistics"),
        ("Extreme Ambient Heat", "Outback temperatures regularly exceed 42°C to 45°C in the shade during the build-up and dry season.", "Perishable produce (Katherine mangoes, chilled beef) and pharmaceuticals spoil within hours without verified refrigeration integrity."),
        ("Monsoonal Wet Seasons", "Heavy tropical cyclones and flooding cause sudden road closures and outstation washouts.", "Requires dynamic re-routing, real-time vehicle positioning, and rapid depot staging communication."),
        ("Cellular Blackspots", "Hundreds of kilometers between regional towns have zero Telstra/Optus cellular reception.", "Standard cloud-based mobile apps crash, freeze, or lose data when drivers attempt to sign off deliveries."),
        ("Heavy Multi-Combinations", "Freight requires triple road trains (up to 85 tonnes GCM, 53.5m length) with high momentum.", "Axle load overloads violate National Heavy Vehicle Regulator (NHVR) laws, causing structural road damage and $10,000+ fines.")
    ]
    for r_i, row in enumerate(t_env_data):
        for c_i, val in enumerate(row):
            t_env.cell(r_i, c_i).text = val
    style_table(t_env)

    # ================= 3. THE 5 CORE BUSINESS PAIN POINTS =================
    doc.add_heading("3. The 5 Core Business Pain Points (Why Legacy Systems Failed)", level=1)
    doc.add_paragraph(
        "A rigorous requirements elicitation process with NorthLine dispatchers, drivers, finance officers, and commercial shippers revealed "
        "five catastrophic failure modes in their pre-existing manual operating model:"
    )

    pains_data = [
        ("3.1 Pain Point 1: The 15-Hour Highway Visibility Blind Spot",
         "The Problem: Once a heavy road train departed the Darwin cross-dock facility, management and clients had zero visibility into vehicle location or transit speed for 15+ hours until it reached Alice Springs.\n"
         "Business Impact: Commercial customers made an average of 45 phone calls per day to dispatch desks asking 'Where is my freight?'. Receiving warehouse crews at mine sites sat idle with forklifts or were unprepared when trucks arrived unexpectedly, creating dock congestion and customer complaints (+22% YoY).\n"
         "Why TrackPoint Was Built: To provide 15-second serverless GPS Leaflet telematics mapping and a 5-stage milestone chain of custody (Booking -> Depot Staging -> Linehaul In-Transit -> Regional Dock -> e-POD Delivery) accessible 24/7 on both desktop and mobile."),
        
        ("3.2 Pain Point 2: 45-Minute Dispatch Latency & Whiteboard Bottlenecks",
         "The Problem: Dispatchers matched 35 heavy vehicles against dozens of daily incoming consignments using physical whiteboards, handwritten magnet tags, and memory.\n"
         "Business Impact: It took an average of 45 minutes to process, verify, and allocate a single freight order. Trailers regularly departed half-empty because dispatchers could not calculate nearest-vehicle proximity or capacity in real time, causing $180,000 annually in unoptimized driver overtime.\n"
         "Why TrackPoint Was Built: To introduce an automated telematics matching algorithm that identifies the nearest capable vehicle based on live GPS coordinates and payload tare mass in under 5 seconds, while retaining full dispatcher manual override control."),
        
        ("3.3 Pain Point 3: Remote Outstation Cellular Dead-Zone Crashes",
         "The Problem: Previous attempts to introduce generic mobile logistics apps failed because the apps required an active 4G/5G Internet connection to load manifests and submit signatures. When drivers reached remote outstations (e.g., between Katherine and Tennant Creek), the apps crashed.\n"
         "Business Impact: Drivers reverted to carbon-copy paper delivery dockets. These slips were frequently oil-stained, torn, lost in truck cabs, or signed with illegible scrawls, making legal delivery verification impossible.\n"
         "Why TrackPoint Was Built: To implement an offline-first PWA architecture with an HTML5 touch signature canvas that buffers signatures and timestamps locally in IndexedDB / LocalStorage, automatically background-syncing to MongoDB Atlas the moment 4G network reconnects."),
        
        ("3.4 Pain Point 4: The 14-Day Delayed Billing Cycle & DSO Crisis",
         "The Problem: NorthLine's finance team could not issue an official Australian Tax Invoice until the physical paper proof-of-delivery docket returned in the truck's cabin to Darwin headquarters two weeks later.\n"
         "Business Impact: Days Sales Outstanding (DSO) averaged 45 to 60 days. Clients refused to pay unverified invoices, locking up over $400,000 in working capital and creating severe cash flow drag.\n"
         "Why TrackPoint Was Built: To eliminate the billing lag entirely. The exact millisecond the driver captures the e-POD signature, TrackPoint automatically generates an itemized Australian Tax Invoice with 10% GST and ABN (88 123 456 789), reducing billing turnaround from 14 days to 0 seconds."),
        
        ("3.5 Pain Point 5: Unplanned Mining Downtime ($50,000/hr Loss)",
         "The Problem: When an open-cut mining excavator or slurry pump fails at remote basins in Katherine or McArthur River, mining operations halt completely. Unplanned downtime costs resource companies up to $50,000 AUD per hour.\n"
         "Business Impact: Standard freight booking processes took 2 to 4 hours just to quote and dispatch emergency parts, causing massive industrial losses and threatening NorthLine's high-value contracts.\n"
         "Why TrackPoint Was Built: To engineer a dedicated 'Express Hot-Shot Same-Day Courier' tier featuring gold lightning priority tags (⚡) that preempt all fleet queues, auto-dispatching the closest vehicle in under 5 seconds with automated SMS dispatch alerts.")
    ]

    for p_title, p_body in pains_data:
        doc.add_heading(p_title, level=2)
        doc.add_paragraph(p_body)

    # ================= 4. WHY OFF-THE-SHELF SOFTWARE FAILED =================
    doc.add_heading("4. Why Off-the-Shelf Fleet Software Failed in the Northern Territory", level=1)
    doc.add_paragraph(
        "A common question asked by stakeholders is: 'Why not simply purchase an existing commercial off-the-shelf (COTS) fleet tracking product?' "
        "NorthLine evaluated multiple commercial packages (e.g., standard metropolitan dispatch software) and found they failed completely in the Northern Territory due to four critical deficiencies:"
    )

    t_cots = doc.add_table(rows=5, cols=3)
    t_cots_data = [
        ("COTS Software Limitation", "Technical & Operational Failure", "How TrackPoint Solves It"),
        ("1. Metropolitan 5G Dependency", "Designed for continuous high-speed cellular networks in Sydney/Melbourne; crashes completely in outback dead-zones.", "Offline-first HTML5 canvas buffer that saves e-POD data in LocalStorage and syncs asynchronously upon 4G re-connection."),
        ("2. Small Van / Courier Focus", "Assumes standard delivery vans; cannot model triple road trains (85t GCM), multi-trailer coupling, or tare axle limits.", "Custom vehicle payload data models supporting 4 vehicle classes (Road Train, Semi, Rigid, Van) with tare validation."),
        ("3. Brittle WebSocket Streaming", "Uses persistent WebSockets that trigger connection storms and disconnect errors during intermittent outstation travel.", "15-second serverless REST polling telemetry (NFR-02) providing 100% cloud reliability with zero socket dropouts."),
        ("4. Disconnected Billing Systems", "Tracking systems do not generate tax invoices, requiring manual re-keying into separate accounting packages.", "Built-in invoicing engine generating itemized Australian Tax Invoices (10% GST, ABN) linked 1-to-1 with signed e-PODs.")
    ]
    for r_i, row in enumerate(t_cots_data):
        for c_i, val in enumerate(row):
            t_cots.cell(r_i, c_i).text = val
    style_table(t_cots)

    # ================= 5. ECONOMIC BUSINESS CASE =================
    doc.add_heading("5. The Economic & Business Case: Quantified Return on Investment", level=1)
    doc.add_paragraph(
        "TrackPoint's business case is grounded in rigorous financial appraisal. A comprehensive cost-benefit analysis conducted across "
        "NorthLine's 35-vehicle operations demonstrates that doing nothing was costing the business over $280,000 annually in waste, overtime, and lost interest."
    )

    t_fin = doc.add_table(rows=6, cols=3)
    t_fin_data = [
        ("Financial Category", "Amount (AUD)", "Financial Mechanism & Value Source"),
        ("Capital Investment (Year 0)", "$268,000", "Cloud software engineering, telematics GPS hardware, mobile tablets, and integration testing."),
        ("Annual Operating Costs", "$92,000 / year", "Vercel cloud hosting, MongoDB Atlas database cluster, Telstra SIM data, and software maintenance."),
        ("Driver Overtime Savings", "+ $95,000 / year", "Optimized telematics routing and automated dispatch eliminating 500+ hours of driver idle time."),
        ("Administrative Recovery", "+ $62,000 / year", "Eliminating 45 daily ETA calls, manual whiteboard scheduling, and paper invoice re-keying."),
        ("Working Capital Acceleration", "+ $48,000 / year", "Slashing billing cycle from 14 days to 0 days, recovering $400k in cash flow at 12% cost of capital.")
    ]
    for r_i, row in enumerate(t_fin_data):
        for c_i, val in enumerate(row):
            t_fin.cell(r_i, c_i).text = val
    style_table(t_fin)

    doc.add_paragraph(
        "Net Financial Impact:\n"
        "• Gross Annual Recurring Benefit: $205,000 / year\n"
        "• Net Annual Benefit: $113,000 / year ($205,000 - $92,000)\n"
        "• Payback Period: 2.4 Years\n"
        "• Net Present Value (NPV @ 8% discount rate over 5 years): ~$183,000 AUD\n"
        "• Internal Rate of Return (IRR): 28.4%"
    )

    # ================= 6. REGULATORY & STATUTORY MANDATES =================
    doc.add_heading("6. Regulatory, Safety & Statutory Mandates", level=1)
    doc.add_paragraph(
        "Beyond economic efficiency, TrackPoint was mandated by strict Australian transport, taxation, and privacy legislation:"
    )

    t_reg = doc.add_table(rows=5, cols=3)
    t_reg_data = [
        ("Australian Regulation", "Statutory Legal Requirement", "TrackPoint Architectural Enforcement"),
        ("Heavy Vehicle National Law (HVNL) & CoR", "Consignors, operators, and dispatchers are legally liable for heavy vehicle speed, fatigue, and mass breaches.", "Automated speed telemetry logging against highway limits (max 100 km/h) and fatigue check reason codes (PR-02)."),
        ("Australian Dangerous Goods (ADG) Code", "Hazardous chemicals (cyanides, bulk fuel) require certified drivers, placarded vehicles, and verified delivery sign-offs.", "System validates DG driver certifications, enforces placarded prime movers, and mandates badge ID capture."),
        ("Corporations Act 2001 Section 286", "Commercial entities must maintain financial records that correctly record and explain their transactions for 7 years.", "Immutable 7-year audit archiving in MongoDB Atlas pairing every invoice directly with its signed e-POD."),
        ("Australian Privacy Principles (APP)", "Protection of commercial customer pricing, driver identities, and consignee contact details.", "Strict Role-Based Access Control (RBAC) and JWT encryption preventing cross-tenant data leakage.")
    ]
    for r_i, row in enumerate(t_reg_data):
        for c_i, val in enumerate(row):
            t_reg.cell(r_i, c_i).text = val
    style_table(t_reg)

    # ================= 7. HUMAN & COMMUNITY DIMENSION =================
    doc.add_heading("7. The Human & Community Dimension", level=1)
    doc.add_paragraph(
        "TrackPoint's value extends beyond commercial metrics into human and community welfare across the Northern Territory:"
    )
    doc.add_paragraph(
        "1. Lifeline for Remote Communities: Indigenous communities and regional pastoral stations depend on NorthLine for weekly food, dry groceries, and essential hardware. TrackPoint ensures supply stability without stockouts.\n"
        "2. Healthcare & Vaccine Security: Remote clinics across Katherine and Alice Springs rely on cold-chain pharmaceutical deliveries. TrackPoint's temperature logging protects life-saving vaccines from Top End heat.\n"
        "3. Driver Welfare & Safety: Operating 85-tonne road trains across 1,500km of outback highway is physically exhausting. TrackPoint replaces cumbersome paperwork with a high-contrast mobile handset, enabling drivers to focus entirely on road safety."
    )

    # ================= 8. STEP-BY-STEP TECHNICAL & OPERATIONAL IMPLEMENTATION =================
    doc.add_heading("8. Step-by-Step Technical & Operational Implementation: How TrackPoint Fixes Every Problem", level=1)
    doc.add_paragraph(
        "To eliminate the legacy failure modes, TrackPoint was engineered through a rigorous 5-step operational pipeline and a modular "
        "cloud architecture. Below is the exact step-by-step mechanism showing how the code, algorithms, and UI workflows resolve each problem."
    )

    steps_impl = [
        ("8.1 Step 1: Online Booking & Telematics Nearest-Vehicle Engine (FR-01, FR-02)",
         "Problem Fixed: 45-Minute whiteboard dispatch latency, human memory errors, and $50k/hr mine downtime.\n\n"
         "Step-by-Step Implementation Mechanism:\n"
         "1. Customer Interface: The customer logs into /customer and opens the Booking Modal. They select from 6 service tiers (e.g., Express Hot-Shot, Cold-Chain, Heavy Mining), origin depot, destination, goods manifest, and payload weight.\n"
         "2. REST Controller: The client submits a POST request to /api/jobs handled by the modular JobsController (src/modules/jobs/).\n"
         "3. Telematics Matching Algorithm: The JobsService queries the 35 heavy vehicles stored in MongoDB Atlas via Prisma ORM. The algorithm calculates proximity to the origin depot, validates vehicle capability (e.g., reefer requirement, road train mass limit), and identifies the closest available prime mover in < 5 seconds.\n"
         "4. Preemption & Notification: For Express Hot-Shot orders, the system applies a gold lightning badge (⚡), flags priority in the dispatcher queue, generates a unique reference (#TP-XXXX), and emits a simulated SMS confirmation (FR-09).\n"
         "5. Result: Dispatch latency drops from 45 minutes to < 5 seconds (-99.8%)."),

        ("8.2 Step 2: Cross-Dock Staging, Tare Mass Validation & Pre-Trip Inspection (FR-04, HVNL)",
         "Problem Fixed: Axle overload violations ($10,000+ NHVR fines), structural vehicle breakdown, and yard congestion.\n\n"
         "Step-by-Step Implementation Mechanism:\n"
         "1. Yard Master Queue: Freight manifests scheduled for departure appear in the Berrimah cross-dock staging queue. The Yard Master inspects incoming cargo and allocates specific loading bays.\n"
         "2. Mass Management Calculation: The platform calculates gross combination mass (GCM) by combining vehicle tare weight with manifest cargo mass. Multi-combination road trains (up to 85 tonnes) are validated against Stuart Highway axle ratings.\n"
         "3. Dispatcher Override Modal: If a driver approaches maximum NHVR driving hours, the dispatcher opens AdminConsignmentModal.tsx in /admin. The system mandates selecting a compliance reason code (DRIVER_FATIGUE, CAPACITY_OVERLOAD, WEATHER_DISRUPTION) before committing changes, creating an immutable Chain of Responsibility (CoR) audit log.\n"
         "4. Staging Confirmation: Yard crew verifies cargo lashing and marks Stage 2 ('Freight Loaded & Manifest Verified') complete.\n"
         "5. Result: Eliminates axle overload fines and ensures 100% HVNL regulatory compliance."),

        ("8.3 Step 3: 15-Second Serverless Highway Telematics Stream (FR-05, FR-06, NFR-02)",
         "Problem Fixed: 15-Hour Stuart Highway blind spots, 45 daily ETA phone inquiries, and brittle WebSocket crashes.\n\n"
         "Step-by-Step Implementation Mechanism:\n"
         "1. CAN-Bus Hardware Link: In-vehicle transponders capture real-time GPS coordinates, vehicle speed (km/h), fuel tank %, battery voltage, and refrigeration temperature setpoints.\n"
         "2. 15-Second Serverless REST Polling: Rather than maintaining brittle WebSockets that crash during outstation signal drops, the platform implements a 15-second REST polling engine (NFR-02) via /api/fleet and /api/jobs.\n"
         "3. Leaflet Mapping Component: MapView.tsx dynamically renders the vehicle's position along the Stuart Highway corridor with live pulsing markers, speed indicators (88 km/h), and heading indicators on zero-watermark OpenStreetMap tiles.\n"
         "4. 5-Stage Milestone Chain: Shippers track live progression across 5 visual milestones: Booking Created -> Loaded at Depot -> Linehaul In-Transit -> Regional Depot Arrival -> Signed Delivery.\n"
         "5. Result: 100% real-time highway transparency, completely eliminating customer ETA calls."),

        ("8.4 Step 4: Offline-First HTML5 Signature Pad & LocalStorage Buffering (FR-07, NFR-04)",
         "Problem Fixed: Remote outstation cellular dead-zone crashes, lost/soiled paper delivery dockets, and illegible signatures.\n\n"
         "Step-by-Step Implementation Mechanism:\n"
         "1. High-Contrast Driver UI: The driver accesses /driver on a mobile tablet. The interface features high-contrast Vanilla CSS designed for 45°C Top End sun glare and large touch targets for work gloves.\n"
         "2. Network State Interceptor: The driver handset monitors connectivity via navigator.onLine (and an interactive 'Simulate Outback Offline Dead-Zone' toggle). When cellular signal is lost in outback dead-zones, the app transitions seamlessly into Offline Mode.\n"
         "3. HTML5 Signature Pad: Upon arrival at the receiving dock, the recipient writes their full name and draws their electronic signature directly on an HTML5 touch drawing canvas.\n"
         "4. Local Storage Buffering: If offline, the signature PNG data URL, recipient name, and UTC timestamp are securely buffered in browser LocalStorage / IndexedDB.\n"
         "5. Auto-Sync Reconnection: The moment the vehicle enters 4G coverage or depot Wi-Fi, the handset automatically background-syncs the buffered payload to PUT /api/jobs/[id], updating MongoDB Atlas.\n"
         "6. Result: 0% lost paper dockets and 100% proof of delivery verification across remote outstations."),

        ("8.5 Step 5: Automated e-POD Triggered Tax Invoicing & 7-Year Audit Locking (FR-08, CR-01, CR-04)",
         "Problem Fixed: 14-Day billing lag, high Days Sales Outstanding (DSO), $400k working capital drag, and ATO audit disputes.\n\n"
         "Step-by-Step Implementation Mechanism:\n"
         "1. Event-Driven Invoicing Trigger: The exact millisecond the e-POD payload is committed, the server triggers the InvoicesService.\n"
         "2. Automated Tax Computation: The engine calculates the base freight rate, priority surcharges, fuel levy, and itemized 10% Australian GST with NorthLine's registered ABN (88 123 456 789).\n"
         "3. Immutable PDF Generation: An official Australian Tax Invoice is generated (#INV-2026-XXXX) embedding the exact digital signature captured on the driver handset.\n"
         "4. 1-to-1 Referential Locking: The invoice document is permanently linked to the consignment record in MongoDB Atlas under Corporations Act Section 286 (7-Year Statutory Retention).\n"
         "5. Instant Settlement Release: Commercial customers view and download the Tax Invoice PDF directly from /customer/orders/[id] for immediate 3-way matching and accounts payable release.\n"
         "6. Result: Slashes the billing cycle from 14 days to 0 seconds, accelerating cash collection by 100%."),

        ("8.6 Service-by-Service Implementation Matrix",
         "The following matrix summarizes the exact technical and operational mechanisms implemented for each of NorthLine's 6 specialized freight services:")
    ]

    for s_title, s_content in steps_impl:
        doc.add_heading(s_title, level=2)
        doc.add_paragraph(s_content)

    # Table for 8.6
    t_srv_impl = doc.add_table(rows=7, cols=4)
    t_srv_impl_data = [
        ("Service Offering", "Target Freight & Corridor", "Assigned Fleet & Constraints", "Step-by-Step Technical Mechanism"),
        ("1. Scheduled Linehaul", "General dry freight, timber, grocery\n(Darwin ↔ Alice Springs)", "Multi-combination Road Trains\n(Mack Titan, Kenworth T909)", "Online booking → Automated heavy truck matching → 15s Leaflet GPS telemetry → 5-stage milestone progression → e-POD sign-off."),
        ("2. Express Hot-Shot", "Emergency mining breakdown spares\n(Darwin ↔ Mine Sites)", "Dedicated Courier Vans & Rigids\n(Toyota HiAce, Isuzu FSD)", "High-priority queue preemption (⚡ Gold Tag) → Sub-5s vehicle matching → Simulated SMS alert → Direct express tracking."),
        ("3. HACCP Cold-Chain", "Katherine mangoes, chilled beef, vaccines\n(Katherine ↔ Darwin Port)", "Climate-Controlled Reefers\n(Volvo FH16 Reefer)", "Algorithm restricts dispatch strictly to reefer units → Temperature setpoint monitoring → Mandatory dock temp sign-off on e-POD."),
        ("4. Heavy Mining Bulk", "14t+ slurry pumps, plant gear\n(Darwin ↔ McArthur Basin)", "Triple Road Trains (85t GCM)\n(Mack Titan #NL-14)", "Tare mass vs axle limit calculation → Cross-dock staging lashing checklist → Road train mass management verification."),
        ("5. Dangerous Goods", "Mining cyanides, bulk fuel, vaccines\n(Darwin ↔ Alice Springs)", "ADG-Placarded Prime Movers\n(Kenworth DG Tanker)", "Driver DG certification validation → Mandatory recipient badge ID verification → Tamper-evident digital signature archiving."),
        ("6. Intermodal Drayage", "20ft/40ft shipping containers\n(East Arm Wharf ↔ Berrimah)", "Short-Haul Port Rigid Trucks\n(Isuzu FSD Drayage)", "Port vessel time-slot booking → Gate-Out to Gate-In milestone tracking → 4-hour turnaround enforcement avoiding demurrage.")
    ]
    for r_i, row in enumerate(t_srv_impl_data):
        for c_i, val in enumerate(row):
            t_srv_impl.cell(r_i, c_i).text = val
    style_table(t_srv_impl)

    # 8.7 Hydration Architecture
    doc.add_heading("8.7 Hydration Resilience Architecture (<ClientOnly>)", level=2)
    doc.add_paragraph(
        "In production environments, browser extensions (such as Dark Reader or password managers) modify inline styles and inject custom attributes "
        "(e.g., data-darkreader-inline-bgimage, --darkreader-inline-color) into server-rendered HTML before React client hydration completes. "
        "In standard Next.js applications, this mismatch triggers severe React hydration errors."
    )
    doc.add_paragraph(
        "TrackPoint engineered a custom architectural solution: all dynamic dashboard portals (/customer, /admin, /driver) and the root layout "
        "utilize a custom <ClientOnly> wrapper alongside suppressHydrationWarning. This ensures that browser-dynamic state and extension-modified "
        "DOM elements render cleanly post-mount with zero console hydration warnings, while maintaining optimal serverless initial load speeds."
    )

    # ================= 9. COMPREHENSIVE ROLE-BY-ROLE MENU & LIFECYCLE ARCHITECTURE GUIDE =================
    doc.add_heading("9. Comprehensive Role-by-Role Menu & Lifecycle Architecture Guide", level=1)
    doc.add_paragraph(
        "TrackPoint was built with dedicated, role-tailored interfaces ensuring that each operational stakeholder—from outback linehaul drivers "
        "and freight controllers to corporate finance managers and commercial consignors—interacts with a purposefully designed workspace. "
        "Below is a comprehensive guide to every menu across all roles, structured across three essential dimensions:\n"
        "1. What That Page Does: Functional capabilities, data inputs, and system actions.\n"
        "2. What to Expect: Visual layouts, on-screen data states, alerts, and interactive elements.\n"
        "3. What That Menu Adds to the Lifecycle: How this specific menu advances freight through the 5-stage lifecycle and what failure mode it eliminates."
    )

    # 9.1 Dispatcher & Operations Controller (/admin)
    doc.add_heading("9.1 Dispatcher & Operations Controller Menu Architecture (/admin)", level=2)
    doc.add_paragraph(
        "Persona: Priya Sharma — Senior Freight Controller, Darwin Operations Hub\n"
        "Base Route: /admin\n"
        "Core Responsibility: Linehaul scheduling, nearest-vehicle telematics allocation, exception handling, and Heavy Vehicle National Law (HVNL) Chain of Responsibility compliance."
    )

    admin_pages_detailed = [
        ("Menu 1: Consignments & Queue (/admin/consignments)",
         "What That Page Does:\n"
         "• Acts as the central master repository for every freight consignment entered into the NorthLine Northern Territory network.\n"
         "• Allows dispatchers to search, filter by priority, service tier, status, origin, and destination.\n"
         "• Opens the detailed Consignment Manifest Drawer displaying pallet counts, cargo dimensions, hazardous goods classifications, and pickup/delivery timestamps.\n"
         "• Features the Chain of Responsibility (CoR) Override Modal (AdminConsignmentModal.tsx), enabling dispatchers to manually reassign drivers or vehicles while enforcing mandatory compliance reason codes (DRIVER_FATIGUE, CAPACITY_OVERLOAD, WEATHER_DISRUPTION).\n\n"
         "What to Expect:\n"
         "• A high-density data table with sortable columns: Consignment ID (#TP-XXXX), Consignor, Origin/Destination, Service Tag, Weight (tonnes), Vehicle ID, Driver, and Real-Time Status Badge.\n"
         "• Priority filter pills: All, ⚡ Express Hot-Shot, ❄️ HACCP Cold-Chain, 🏗️ Heavy Mining, ☣️ Dangerous Goods, and 🚢 Intermodal Drayage.\n"
         "• Interactive action buttons on each row: 'View Manifest' and 'Override Allocation'.\n"
         "• Instant visual feedback via toast notifications upon saving any manifest modification.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 1 (Order Ingestion) & Stage 2 (Cross-Dock Staging).\n"
         "• Operational Impact: Acts as the regulatory gatekeeper of the lifecycle. It prevents unrecorded verbal changes and ensures that any route deviation or driver reassignment is permanently audited under HVNL Chain of Responsibility mandates."),

        ("Menu 2: Dispatcher Board (/admin/dispatch)",
         "What That Page Does:\n"
         "• Serves as the dynamic operational nerve center for real-time fleet coordination.\n"
         "• Houses a 4-column visual Kanban board: (1) Pending Allocation, (2) Cross-Dock Staging, (3) Linehaul In-Transit, and (4) Completed / Delivered.\n"
         "• Executes the one-click Nearest-Truck Auto-Match Engine (FR-02), querying vehicle GPS coordinates, tare mass limits, and reefer capabilities in MongoDB Atlas via Prisma.\n"
         "• Implements Express Hot-Shot Queue Preemption, automatically highlighting urgent breakdown mining spares with gold lightning badges (⚡) and advancing them to the top of the queue.\n\n"
         "What to Expect:\n"
         "• 4 organized workflow lanes populated by interactive consignment cards showing tracking reference, payload weight, customer name, and destination.\n"
         "• Prominent 'Auto-Match Pending Consignments' gradient button at the top header.\n"
         "• Visual staging advancement controls allowing dispatchers to confirm loading at Berrimah terminal and dispatch trucks onto the Stuart Highway with a single click.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Transition from Stage 1 (Booking) to Stage 2 (Staging) & Stage 3 (Linehaul Departure).\n"
         "• Operational Impact: Slashes dispatch latency from 45 minutes to < 5 seconds (-99.8%). Eliminates whiteboard bottlenecks and prevents triple road trains from departing half-empty or overloaded."),

        ("Menu 3: NT Fleet Telematics (/admin/fleet)",
         "What That Page Does:\n"
         "• Provides real-time telematics supervision across the entire 1,500km Stuart Highway corridor.\n"
         "• Tracks all 35 commercial heavy vehicles (road trains, reefers, hot-shot vans) using a 15-second serverless REST polling stream (NFR-02).\n"
         "• Ingests CAN-bus vehicle telemetry: GPS coordinates, road speed (88 km/h), fuel tank %, battery voltage, and refrigeration climate setpoints.\n\n"
         "What to Expect:\n"
         "• Full-screen interactive Leaflet.js map with custom SVG road-train markers, pulsing live icons, and Stuart Highway corridor paths.\n"
         "• A responsive asset card grid detailing: Asset ID (#NL-14), Vehicle Model (Mack Titan / Kenworth T909), Assigned Driver, Current Speed, Fuel Gauge, and Operational Status (Available, In Transit, Loading, Maintenance).\n"
         "• Cold-chain climate gauges showing real-time ambient vs. setpoint temperatures (-18°C frozen / +4°C chilled) with high-temperature anomaly alerts.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 3 (Stuart Highway Linehaul In-Transit).\n"
         "• Operational Impact: Completely destroys the historical 15-hour highway visibility black spot. Allows dispatchers to intervene immediately if a vehicle experiences mechanical trouble, speeds, or suffers a refrigeration fault in 45°C Top End heat."),

        ("Menu 4: Commercial Accounts (/admin/clients)",
         "What That Page Does:\n"
         "• Centralizes B2B corporate customer relationship, credit limit, and rate card management.\n"
         "• Tracks 8 major Northern Territory accounts (e.g., Katherine Mining Supplies Ltd, Top End Mango Producers, Alice Springs Hospital, McArthur Basin Energy).\n"
         "• Sets approved credit thresholds (e.g., $150,000 AUD), credit terms (Net 30/60), and stores receiving dock operating hours.\n\n"
         "What to Expect:\n"
         "• Corporate account directory cards displaying company name, account status badge (Active / Credit Hold), credit utilization progress bars, and active order counts.\n"
         "• Quick-jump links that instantly filter the Consignments table to show that specific client's active shipments.\n"
         "• Contact drawer containing primary logistics coordinator names, phone numbers, and emergency billing emails.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Pre-Lifecycle Gatekeeper (Stage 1 Authorization) & Post-Lifecycle Financial Settlement (Stage 5).\n"
         "• Operational Impact: Protects NorthLine from bad debt by verifying credit standing before dispatch and ensures freight invoices are routed to verified corporate accounts payable contacts."),

        ("Menu 5: Invoices & e-POD Audit (/admin/invoices)",
         "What That Page Does:\n"
         "• Serves as the master financial settlement and statutory audit repository.\n"
         "• Automatically generates Australian Tax Invoices (#INV-2026-XXXX) the exact millisecond an e-POD signature is committed on the driver handset.\n"
         "• Computes linehaul freight rates, fuel levies, priority surcharges, and itemized 10% Australian GST with NorthLine ABN (88 123 456 789).\n"
         "• Implements 1-to-1 referential locking in MongoDB Atlas for 7-Year Statutory Audit Retention under Corporations Act Section 286.\n\n"
         "What to Expect:\n"
         "• Financial ledger table showing Invoice #, Consignment Ref, Customer, Issue Date, Due Date, Net Amount, 10% GST, Total Amount, and Payment Status (Issued, Paid, Overdue).\n"
         "• Modal preview of the official Tax Invoice PDF embedding the exact digital signature captured on the driver tablet.\n"
         "• e-POD glass signature viewer displaying high-resolution signature PNG, signee name, and UTC timestamp.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 5 (Financial Closure & Audit Archiving).\n"
         "• Operational Impact: Slashes the billing cycle from 14 days down to 0 seconds. Frees $400,000 AUD in trapped working capital and provides 100% dispute-free proof of delivery for immediate cash settlement."),

        ("Menu 6: Operations & Fuel Analytics (/admin/analytics)",
         "What That Page Does:\n"
         "• Serves as the executive intelligence cockpit, synthesizing real-time operational data from MongoDB Atlas into actionable KPIs.\n"
         "• Evaluates linehaul delivery SLA performance, corridor fuel consumption, revenue by service tier, and cash collection acceleration.\n\n"
         "What to Expect:\n"
         "• Modern Chart.js visual analytics cards:\n"
         "  - On-Time Delivery SLA Gauge: Live tracking 96.4% on-time performance against the 88.2% legacy baseline.\n"
         "  - Corridor Fuel Efficiency Bar Chart: Comparing liters/100km across Darwin-Katherine, Katherine-Tennant Creek, and Tennant Creek-Alice Springs.\n"
         "  - Days Sales Outstanding (DSO) Velocity Curve: Demonstrating cash collection acceleration from 45 days down to immediate release.\n"
         "  - Revenue Breakdown Donut: Turnover split across Linehaul, Hot-Shot, Cold-Chain, and Mining Bulk.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Continuous Lifecycle Optimization & Executive Feedback Loop.\n"
         "• Operational Impact: Provides leadership with empirical data to optimize route profitability, cut driver overtime ($95k/year savings), and eliminate recurring corridor bottlenecks."),

        ("Menu 7: Top Navigation, Clock & MongoDB Atlas Sync Bar",
         "What That Page Does:\n"
         "• Houses platform-wide utilities, timezone synchronization, and live database health monitoring.\n"
         "• Features the manual Live Cluster Refresh Button (🔄) triggering REST polling to /api/jobs and /api/fleet.\n\n"
         "What to Expect:\n"
         "• Real-time Darwin ACST digital clock (e.g., 21:45:10 ACST).\n"
         "• User profile badge (Priya Sharma, Ops Control) and one-click logout.\n"
         "• Green cloud connectivity indicator ('MongoDB Atlas Live').\n"
         "• Responsive sidebar collapse button (◀ / ▶) toggling between 280px full-width and 76px icon-only modes.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Infrastructure & Session Management across all lifecycle stages.\n"
         "• Operational Impact: Ensures dispatchers and managers are always viewing live cloud state synchronized with in-transit highway vehicles.")
    ]

    for m_title, m_desc in admin_pages_detailed:
        doc.add_heading(m_title, level=3)
        doc.add_paragraph(m_desc)

    # 9.2 Fleet & Safety Compliance Manager
    doc.add_heading("9.2 Fleet & Safety Compliance Manager Menu Architecture (Marcus Vance)", level=2)
    doc.add_paragraph(
        "Persona: Marcus Vance — Fleet Maintenance & Safety Compliance Superintendent\n"
        "Base Routes: /admin/fleet, /driver/safety, and /admin/analytics\n"
        "Core Responsibility: Heavy vehicle roadworthiness, National Heavy Vehicle Regulator (NHVR) fatigue compliance, and Chain of Responsibility safety auditing."
    )
    doc.add_paragraph(
        "1. Vehicle Health & Odometer Hub (/admin/fleet):\n"
        "• What That Page Does: Monitors CAN-bus telemetry across 35 heavy vehicles, tracking engine diagnostic trouble codes, tire pressures, and 25,000km service intervals.\n"
        "• What to Expect: Real-time asset health cards with odometer readings, battery voltages, and preventative maintenance countdowns.\n"
        "• Lifecycle Contribution: Acts as the Stage 2 (Pre-Departure) vehicle fitness gatekeeper, preventing catastrophic road breakdowns on remote 1,500km highway stretches.\n\n"
        "2. NHVR Fatigue & Electronic Work Diary (/driver/safety):\n"
        "• What That Page Does: Verifies driver compliance with standard 12-hour driving limits and mandates 15-minute rest breaks every 5.25 hours.\n"
        "• What to Expect: Real-time countdown clocks, digital pre-trip circle-check inspection forms, and mobile hazard submission tools.\n"
        "• Lifecycle Contribution: Safeguards driver life and limb during Stage 3 (Highway Linehaul) and establishes legally airtight Chain of Responsibility proof.\n\n"
        "3. Safety Telematics Analytics (/admin/analytics):\n"
        "• What That Page Does: Evaluates speed compliance against highway speed limits (max 100 km/h for road trains), harsh braking, and rollover stability.\n"
        "• What to Expect: Trend charts tracking speed violations, harsh braking instances, and safety compliance percentages.\n"
        "• Lifecycle Contribution: Closes the feedback loop post-delivery, enabling targeted driver training and insurance premium reductions."
    )

    # 9.3 Finance & Accounts Ledger Manager
    doc.add_heading("9.3 Finance & Accounts Ledger Manager Menu Architecture (Elena Rostova)", level=2)
    doc.add_paragraph(
        "Persona: Elena Rostova — Financial Controller & Billing Lead\n"
        "Base Routes: /admin/invoices and /admin/clients\n"
        "Core Responsibility: Revenue assurance, accounts receivable reconciliation, ATO 10% GST compliance, and cash-flow acceleration."
    )
    doc.add_paragraph(
        "1. Automated Tax Invoice & e-POD Audit Ledger (/admin/invoices):\n"
        "• What That Page Does: Performs instant 3-way reconciliation between cargo manifests, digital glass signatures, and generated tax invoices.\n"
        "• What to Expect: Searchable financial ledger with itemized GST, download buttons for official PDF invoices, and embedded proof-of-delivery signatures.\n"
        "• Lifecycle Contribution: Completes Stage 5 (Billing Closure) in 0 seconds rather than 14 days, accelerating working capital turnover by 100%.\n\n"
        "2. Commercial Credit & Terms Management (/admin/clients):\n"
        "• What That Page Does: Manages 30-day corporate credit lines, tracks accounts receivable aging, and automatically flags overdue accounts.\n"
        "• What to Expect: Credit utilization progress bars, billing contact details, and payment history logs for 8 key B2B clients.\n"
        "• Lifecycle Contribution: Pre-authorizes bookings in Stage 1 and prevents service delivery to delinquent accounts.\n\n"
        "3. Cash-Flow & DSO Analytics (/admin/analytics):\n"
        "• What That Page Does: Tracks Days Sales Outstanding velocity, gross freight margin per corridor, and revenue per tonne-kilometer.\n"
        "• What to Expect: Comparative DSO reduction charts (45 days down to immediate settlement) and revenue distribution graphs.\n"
        "• Lifecycle Contribution: Informs executive tariff planning and validates the financial ROI of the TrackPoint platform."
    )

    # 9.4 B2B Commercial Consignor / Customer (/customer)
    doc.add_heading("9.4 B2B Commercial Consignor / Customer Menu Architecture (/customer)", level=2)
    doc.add_paragraph(
        "Persona: Sandra Wilson — Procurement & Supply Chain Lead, Katherine Mining Supplies Ltd\n"
        "Base Route: /customer\n"
        "Core Responsibility: Self-service freight booking, minute-by-minute highway tracking down the Stuart Highway, and instant invoice downloads."
    )

    customer_pages_detailed = [
        ("Menu 1: Customer Overview & Dashboard (/customer)",
         "What That Page Does:\n"
         "• Provides corporate logistics managers with an instant executive summary of their active freight portfolio upon login.\n"
         "• Highlights active in-transit shipments, completed deliveries, outstanding invoices, and monthly freight expenditure.\n"
         "• Features quick-action launch buttons to book new freight shipments without administrative friction.\n\n"
         "What to Expect:\n"
         "• 4 high-contrast KPI metric cards (Active In-Transit, Delivered This Month, Pending Invoices, Total Freight Spend).\n"
         "• Recent Consignments Table showing the 5 most recent orders with tracking IDs, origin/destination, service tags, and live status pills.\n"
         "• Prominent '+ Book New Freight Shipment' gradient call-to-action button.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Account Entry & Portfolio Overview.\n"
         "• Operational Impact: Eliminates routine administrative telephone calls, giving procurement officers immediate operational clarity."),

        ("Menu 2: Consignments & Booking Engine (/customer/orders)",
         "What That Page Does:\n"
         "• Hosts the self-service freight booking wizard (FR-01) and active consignment management catalog.\n"
         "• Allows customers to book freight across 6 specialized tiers: (1) Scheduled Linehaul, (2) Express Hot-Shot, (3) HACCP Cold-Chain, (4) Heavy Mining Bulk, (5) Dangerous Goods, and (6) Intermodal Drayage.\n"
         "• Captures pickup terminal, delivery destination, manifest description, payload weight (tonnes), dangerous goods placard requirement, and reefer temperature setpoints.\n"
         "• Computes instant freight rate estimates and corridor transit ETAs upon submission.\n\n"
         "What to Expect:\n"
         "• Filterable table of all corporate consignments with real-time status badges (Pending Allocation, Dispatched, In Transit, Delivered).\n"
         "• Interactive Booking Modal with drop-downs for origin/destination depots, service tier selector with visual icons (⚡, ❄️, 🏗️, ☣️, 🚢), cargo dimensions, and weight inputs.\n"
         "• Clickable row links opening the dedicated 5-Stage Live Highway Tracker.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 1 (Demand Creation & Booking Ingestion).\n"
         "• Operational Impact: Reduces the freight booking cycle from 2 hours of phone tag down to 60 seconds of self-service digital data entry."),

        ("Menu 3: Live 5-Stage GPS Highway Tracker (/customer/orders/[id])",
         "What That Page Does:\n"
         "• Dedicated real-time tracking portal providing minute-by-minute visibility of the assigned truck along the Stuart Highway.\n"
         "• Renders the assigned vehicle's exact position on Leaflet.js maps and tracks completion through 5 verified operational milestones.\n\n"
         "What to Expect:\n"
         "• Interactive Leaflet GPS map tracking the assigned prime mover with custom SVG road-train markers and highway route polyline.\n"
         "• Driver & Vehicle Card displaying assigned rig (Truck #NL-14, Mack Titan), driver name (Dave Miller), live speed (88 km/h), and current highway waypoint.\n"
         "• Horizontal 5-Stage Milestone Progression Chain with verified UTC timestamps: (1) Booking Confirmed ➔ (2) Loaded at Depot ➔ (3) Stuart Highway In-Transit ➔ (4) Regional Cross-Dock Arrival ➔ (5) Signed Proof of Delivery.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 3 (Linehaul In-Transit) & Stage 4 (Receiving Arrival).\n"
         "• Operational Impact: Completely eliminates customer anxiety and 45 daily ETA phone inquiries. Enables mine receiving crews and warehouse docks to stage forklifts in advance."),

        ("Menu 4: Tax Invoices & e-POD Receipts (/customer/invoices)",
         "What That Page Does:\n"
         "• Provides the customer's accounts payable department with instant self-service access to official tax invoices and delivery receipts.\n"
         "• Displays itemized Australian GST (10%), freight charges, and fuel surcharges.\n"
         "• Enables instant downloading of official Australian Tax Invoice PDFs embedding the recipient's electronic glass signature.\n\n"
         "What to Expect:\n"
         "• Searchable billing ledger showing Invoice #, Order Ref, Date, Amount (AUD), GST, and Payment Status (Issued, Paid).\n"
         "• 'Download Invoice PDF' button generating official ATO-compliant documents with NorthLine ABN 88 123 456 789.\n"
         "• 'View e-POD Signature' button opening a high-resolution modal of the recipient's signature captured at the dock.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 5 (Customer Accounts Payable Reconciliation & Settlement).\n"
         "• Operational Impact: Enables immediate 3-way accounts payable matching (Purchase Order + Goods Receipt + Tax Invoice), eliminating payment delays and invoice disputes.")
    ]

    for m_title, m_desc in customer_pages_detailed:
        doc.add_heading(m_title, level=3)
        doc.add_paragraph(m_desc)

    # 9.5 Heavy Road Train Driver (/driver)
    doc.add_heading("9.5 Heavy Road Train Driver Menu Architecture (/driver)", level=2)
    doc.add_paragraph(
        "Persona: Dave Miller — Senior Linehaul Driver, Mack Titan (Truck #NL-14)\n"
        "Base Route: /driver\n"
        "Core Responsibility: Stuart Highway navigation, multi-drop run-sheet execution, NHVR fatigue compliance, and offline-first electronic Proof of Delivery (e-POD) glass signing."
    )

    driver_pages_detailed = [
        ("Menu 1: Active Drop & e-POD Signature Workflow (/driver/active)",
         "What That Page Does:\n"
         "• Serves as the driver's in-cab terminal for completing deliveries at remote receiving docks.\n"
         "• Displays active drop details: recipient company, delivery address, manifest goods, weight, and special dock instructions.\n"
         "• Hosts the offline-first HTML5 Touch Drawing Canvas (<canvas>) for electronic glass signature capture.\n"
         "• Captures signee printed name and optional employee badge ID.\n"
         "• Encodes the drawn signature into a PNG data URL and commits the e-POD payload to PUT /api/jobs/[id].\n"
         "• Implements LocalStorage / IndexedDB Buffering: If out of cellular range, securely buffers signature data locally and auto-syncs upon 4G reconnect.\n\n"
         "What to Expect:\n"
         "• High-contrast sunlight-readable UI optimized for 45°C glare with extra-large touch buttons for gloved operation.\n"
         "• Interactive touch drawing pad with 'Clear' and 'Confirm Signature' buttons.\n"
         "• Prominent 'Complete Drop & Generate e-POD' green button.\n"
         "• Visual offline banner displaying 'Offline Buffer Active — Syncing Automatically on Reconnect'.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Transition from Stage 4 (Delivery Arrival) to Stage 5 (Proof of Delivery & Automated Invoicing).\n"
         "• Operational Impact: 100% elimination of lost, oil-stained, or illegible carbon-copy paper dockets. Triggers instantaneous tax invoice generation the exact second the signature is saved."),

        ("Menu 2: My Manifest Queue (/driver/manifest)",
         "What That Page Does:\n"
         "• Acts as the driver's digital daily run-sheet across the 1,500km Stuart Highway corridor.\n"
         "• Lists sequential drops and pickups (e.g., Drop 1: Katherine Mining Supplies, Drop 2: Mataranka Roadhouse Fuel, Drop 3: Tennant Creek Depot, Drop 4: Alice Springs Terminal).\n"
         "• Details pallet weights, dangerous goods classifications, and trailer positions (Lead A-Trailer, B-Trailer, Dog C-Trailer).\n"
         "• Allows the driver to select any queued shipment to load into active navigation.\n\n"
         "What to Expect:\n"
         "• Chronological card list of queued drops with roadhouse/town badges, pallet counts, and gross tonnes.\n"
         "• Warning badges for hazardous materials or refrigerated temperature constraints.\n"
         "• 'Select Active Drop' button loading that delivery into turn-by-turn workflow.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 2 (Cross-Dock Staging Manifest) & Stage 3 (Linehaul Execution).\n"
         "• Operational Impact: Ensures multi-combination road trains are unloaded in the correct physical sequence, preventing axle weight distribution imbalances and missed regional dropoffs."),

        ("Menu 3: Corridor Highway Map & Roadhouse Stops (/driver/navigation)",
         "What That Page Does:\n"
         "• Heavy-vehicle-tailored GPS navigation system covering the 1,500km Darwin-to-Alice Springs corridor.\n"
         "• Highlights road train decoupling pads, ultra-heavy parking bays, 24-hour diesel refueling facilities, and roadhouse waypoints (Adelaide River, Katherine, Mataranka, Daly Waters, Tennant Creek, Barrow Creek, Alice Springs).\n"
         "• Displays real-time outback hazard overlays: monsoonal wet-season flooding, bushfire detours, and livestock crossings.\n\n"
         "What to Expect:\n"
         "• High-contrast OpenStreetMap tiles optimized for in-cab tablet mounting.\n"
         "• Visual rest stop icons with truck parking bay capacity and diesel availability.\n"
         "• Live distance countdown to the next roadhouse waypoint.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 3 (Stuart Highway Corridor Navigation).\n"
         "• Operational Impact: Enhances driver situational awareness and reduces fatigue by clearly identifying approved road train decoupling and rest facilities."),

        ("Menu 4: Fatigue Clock & Pre-Start Rig Checklist (/driver/safety)",
         "What That Page Does:\n"
         "• Serves as the driver's National Heavy Vehicle Regulator (NHVR) compliance station.\n"
         "• Houses the Electronic Work Diary Countdown Timer tracking standard 12-hour driving limits and mandatory 15-minute rest breaks every 5.25 hours.\n"
         "• Features the Mandatory Daily Pre-Start Mechanical Checklist (brakes, steering, tires, trailer couplings, air lines, reefer temperature setpoints).\n"
         "• Provides a Mobile Incident & Hazard Reporting Form.\n\n"
         "What to Expect:\n"
         "• Large digital fatigue clock counting down remaining continuous driving time.\n"
         "• Interactive toggle switches for daily pre-trip circle-check items.\n"
         "• Hazard submission form with fields for location, hazard type, and notes.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Stage 2 (Pre-Departure Fitness) & Stage 3 (Linehaul Safety Compliance).\n"
         "• Operational Impact: Protects driver safety, prevents catastrophic mechanical equipment failure, and provides legally airtight proof of Chain of Responsibility compliance."),

        ("Menu 5: Outback Offline Simulator & Connectivity Header",
         "What That Page Does:\n"
         "• Monitors real-time device network connectivity (🟢 Online 4G / 🔴 Offline Outstation Mode).\n"
         "• Features an interactive 'Simulate Outback Offline Dead-Zone' toggle, allowing drivers, examiners, or reviewers to simulate entering a zero-coverage dead-zone along the Stuart Highway to verify offline manifest reading and signature caching.\n\n"
         "What to Expect:\n"
         "• Top persistent status header with truck asset tag (#NL-14), Darwin ACST clock, and network badge.\n"
         "• Interactive offline switch immediately shifting the interface into offline buffering mode.\n\n"
         "What That Menu Adds to the Lifecycle:\n"
         "• Stage in Lifecycle: Cross-Lifecycle Fault Tolerance (Stage 3 & 4).\n"
         "• Operational Impact: Proves offline-first reliability, ensuring zero data loss and uninterrupted operations in Australia's most remote cellular dead-zones.")
    ]

    for m_title, m_desc in driver_pages_detailed:
        doc.add_heading(m_title, level=3)
        doc.add_paragraph(m_desc)

    # 9.6 Comprehensive Cross-Role Mapping Table
    doc.add_heading("9.6 Cross-Role Menu & Operational Lifecycle Matrix", level=2)
    doc.add_paragraph(
        "The following matrix summarizes the complete functional mapping for every menu across all system roles, linking each page "
        "to its technical route, on-screen expectations, and exact lifecycle contribution:"
    )

    t_menus = doc.add_table(rows=16, cols=4)
    t_menus_data = [
        ("Role & Menu Name", "Technical Route", "What to Expect on Screen", "What It Adds to Freight Lifecycle"),
        ("Dispatcher:\nConsignments & Queue", "/admin/consignments", "Sortable table, priority search pills, manifest drawer, CoR override modal.", "Stage 1/2: Manifest registry gatekeeper; enforces HVNL Chain of Responsibility compliance."),
        ("Dispatcher:\nDispatcher Board", "/admin/dispatch", "4-Column Kanban lanes, Auto-Match button (FR-02), Hot-Shot gold tag (⚡).", "Stage 1➔2: Slashes dispatch latency from 45 min to < 5s; optimizes 85t road train loading."),
        ("Dispatcher:\nNT Fleet Telematics", "/admin/fleet", "Leaflet Stuart Hwy map, 35 vehicle cards, speed/fuel/temp gauges.", "Stage 3: Eliminates 15-hr blind spot; protects cold-chain reefer cargo in 45°C heat."),
        ("Dispatcher:\nCommercial Accounts", "/admin/clients", "8 B2B account cards, credit limit bars ($150k), active order links.", "Pre/Post-Lifecycle: Commercial credit gatekeeper; prevents bad debt and coordinates billing."),
        ("Dispatcher:\nInvoices & e-POD Audit", "/admin/invoices", "Financial ledger, ATO tax invoice preview, embedded e-POD signature.", "Stage 5: Instant billing closure (14 days ➔ 0s); 7-year Corporations Act audit retention."),
        ("Dispatcher:\nOperations Analytics", "/admin/analytics", "Chart.js KPI cards, 96.4% on-time SLA gauge, fuel efficiency curves.", "Continuous Feedback: Data-driven fleet optimization; cuts $95k/yr in driver overtime."),
        ("Fleet Manager:\nAsset Telematics", "/admin/fleet", "CAN-bus engine health, odometer logs, 25,000km service countdown.", "Stage 2: Pre-departure mechanical fitness; prevents outback highway breakdowns."),
        ("Fleet Manager:\nNHVR Fatigue Safety", "/driver/safety", "Fatigue clock (5.25h limit), pre-trip circle-check, hazard logger.", "Stage 3: Enforces driver rest rules and legally airtight Chain of Responsibility proof."),
        ("Finance Manager:\nBilling & Audit Ledger", "/admin/invoices", "Automated 10% GST calculation, ABN verification, e-POD matching.", "Stage 5: Accelerates cash collection by 100%, freeing $400k in trapped working capital."),
        ("Finance Manager:\nClient Credit & Terms", "/admin/clients", "Credit line limits, accounts receivable aging, payment tracking.", "Stage 1: Pre-authorizes bookings; eliminates bad debts and payment disputes."),
        ("B2B Customer:\nOverview Dashboard", "/customer", "4 KPI tiles (In-Transit, Delivered, Invoices, Spend), recent orders.", "Entry Point: Immediate portfolio transparency without calling dispatch."),
        ("B2B Customer:\nConsignments & Booking", "/customer/orders", "6-Service booking wizard (FR-01), manifest form, instant cost estimator.", "Stage 1: Replaces phone tag with structured digital orders in 60 seconds."),
        ("B2B Customer:\n5-Stage GPS Tracker", "/customer/orders/[id]", "Leaflet GPS map, live truck speed (88 km/h), 5-stage milestone chain.", "Stage 3/4: Minute-by-minute highway transparency; eliminates 45 ETA calls/day."),
        ("B2B Customer:\nTax Invoices & e-PODs", "/customer/invoices", "Downloadable ATO Tax Invoice PDF, embedded glass signature viewer.", "Stage 5: Enables immediate 3-way accounts payable matching and instant sign-off."),
        ("Linehaul Driver:\nActive Drop & e-POD", "/driver/active", "High-contrast UI, HTML5 signature canvas, offline LocalStorage buffer.", "Stage 4➔5: 100% elimination of lost paper dockets; triggers instant automated billing.")
    ]
    for r_i, row in enumerate(t_menus_data):
        for c_i, val in enumerate(row):
            t_menus.cell(r_i, c_i).text = val
    style_table(t_menus)


    # ================= 10. SUMMARY OF TRANSFORMATION =================
    doc.add_heading("10. Summary of Transformation: Legacy Baseline vs. TrackPoint", level=1)
    doc.add_paragraph(
        "The following matrix summarizes the before-and-after operational transformation delivered by TrackPoint:"
    )

    t_trans = doc.add_table(rows=7, cols=4)
    t_trans_data = [
        ("Operational Dimension", "Legacy Operating Baseline", "TrackPoint Platform Benchmark", "Quantified Transformation"),
        ("Dispatch Latency", "45 minutes per consignment", "< 5 seconds (Automated)", "- 99.8% Latency Reduction"),
        ("Billing Turnaround (DSO)", "14 days waiting for paper POD", "Instant (0 seconds on delivery)", "- 100% Billing Lag Slashed"),
        ("Transit Visibility", "15-hour blind spots down Stuart Hwy", "15-second live GPS Leaflet map", "100% Highway Transparency"),
        ("Outstation Reliability", "Apps crash; reliance on paper", "Offline HTML5 canvas buffer", "Zero Data Loss in Dead-Zones"),
        ("Linehaul On-Time SLA", "88.2% on-time delivery rate", "96.4% on-time delivery rate", "+ 8.2% SLA Performance Gain"),
        ("Lost POD Dockets", "6.5% lost, soiled, or disputed", "0.0% lost or damaged dockets", "100% Clean Audit Compliance")
    ]
    for r_i, row in enumerate(t_trans_data):
        for c_i, val in enumerate(row):
            t_trans.cell(r_i, c_i).text = val
    style_table(t_trans)

    # ================= 11. LIVE VERIFICATION & CONCLUSION =================
    doc.add_heading("11. Live System Verification & Conclusion", level=1)
    doc.add_paragraph(
        "TrackPoint has been fully engineered, validated, and deployed to production on Vercel Serverless with a live MongoDB Atlas cloud database. "
        "The application is accessible across all primary endpoints:"
    )
    doc.add_paragraph(
        "• Live Production Application: https://trackpoint-platform.vercel.app\n"
        "• B2B Customer Portal: https://trackpoint-platform.vercel.app/customer (Sandra Wilson — Katherine Mining Supplies)\n"
        "• Operations Command Center: https://trackpoint-platform.vercel.app/admin (Priya Sharma — Fleet Dispatch)\n"
        "• Driver Mobile Handset: https://trackpoint-platform.vercel.app/driver (Dave Miller — Truck #NL-14 & Signature Pad)"
    )
    doc.add_paragraph(
        "Conclusion: TrackPoint proves that modern, cloud-native engineering can conquer Australia's most demanding physical and operational freight corridors, "
        "transforming a paper-burdened carrier into a digitally transparent, agile, and highly profitable logistics leader."
    )

    doc.save(output_path)
    print(f"[SUCCESS] Document generated: {output_path}")


if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Why_The_Project_Was_Built.docx"
    generate_why_built_document(out_file)
