#!/usr/bin/env python3
"""
TrackPoint — Master Presentation Script Generator (.docx)
Generates a comprehensive, word-for-word presentation script document:
- Delivery Guidelines & Timing Marks (12-15 min total)
- Word-for-Word Pitch with Stage Directions and Slide Cues
- Problem Statement, 5-Step Architecture, Role Walkthroughs, and Live UI Demo Script
- Quantified Business Case and Bulletproof Q&A Defense
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

def generate_script_document(output_path="TrackPoint_Master_Presentation_Script.docx"):
    doc = Document()
    
    # Page setup
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
        # Header / Footer
        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("TrackPoint — Master Capstone & Class Presentation Script")
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGBColor(120, 130, 140)
        
        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("NorthLine Freight & Logistics (Darwin, NT) | PRT631 Capstone Presentation")
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
    r_sub = p_pre.add_run("COMPLETE WORD-FOR-WORD PRESENTATION PITCH & DEMO SCRIPT\n")
    r_sub.font.size = Pt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(26, 71, 111)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("TrackPoint: Master Presentation Script\n& Defense Walkthrough\n")
    r_t.font.size = Pt(26)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(18, 48, 77)

    r_sub2 = p_title.add_run("A Complete, Authoritative Speaker Guide with Stage Directions, Screen Walkthroughs, Live UI Demo Script, and Q&A Defense\n")
    r_sub2.font.size = Pt(12)
    r_sub2.font.italic = True
    r_sub2.font.color.rgb = RGBColor(80, 90, 105)

    doc.add_paragraph("\n")

    cover_table = doc.add_table(rows=7, cols=2)
    meta_data = [
        ("Presenter & Candidate", "Mahir Sadman Rushad | Student ID: S395312"),
        ("Academic Framework", "Charles Darwin University — Master of IT / PRT631 Capstone"),
        ("Industry Client Organization", "NorthLine Freight & Logistics (Darwin, Northern Territory)"),
        ("Project Platform", "TrackPoint — Fleet Dispatch, GPS Telematics & Invoicing Platform"),
        ("Target Freight Corridor", "Stuart Highway (1,500km Darwin ↔ Katherine ↔ Alice Springs)"),
        ("Target Presentation Duration", "12 to 15 Minutes (Pitch) + 5 Minutes (Q&A Defense)"),
        ("Live Production Application", "https://trackpoint-platform.vercel.app")
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
    doc.add_heading("Presentation Structure & Timing Map", level=1)
    
    t_timing = doc.add_table(rows=9, cols=3)
    t_timing_data = [
        ("Section & Topic", "Target Duration", "Key Message / Slide Focus"),
        ("1. The Dramatic Hook & Context", "0:00 - 1:45 (1m 45s)", "The high-stakes Stuart Highway battlefield; NorthLine profile."),
        ("2. The 5 Core Pain Points", "1:45 - 3:30 (1m 45s)", "Why legacy 1990s whiteboards, paper dockets, and dead-zones failed."),
        ("3. The 5-Step System Architecture", "3:30 - 6:00 (2m 30s)", "From sub-5s nearest-truck matching to offline e-POD and ATO tax invoicing."),
        ("4. Role-by-Role Screen Walkthrough", "6:00 - 9:00 (3m 00s)", "Deep dive into Customer Portal, Dispatcher Board, and Driver Handset."),
        ("5. Step-by-Step Live UI Demo", "9:00 - 11:30 (2m 30s)", "Live execution on trackpoint-platform.vercel.app with simulated offline sync."),
        ("6. Quantified ROI & Community Impact", "11:30 - 12:45 (1m 15s)", "+$205k/yr savings, 2.4y payback, remote community & vaccine security."),
        ("7. Closing Call to Action", "12:45 - 13:15 (30s)", "The transformative thesis: conquering outback logistics with cloud technology."),
        ("8. Bulletproof Q&A Defense Guide", "Post-Pitch (5m 00s)", "Detailed answers to the 10 toughest technical and business examiner questions.")
    ]
    for r_i, row in enumerate(t_timing_data):
        for c_i, val in enumerate(row):
            t_timing.cell(r_i, c_i).text = val
    style_table(t_timing)

    doc.add_page_break()

    # ================= SECTION 1 =================
    doc.add_heading("Section 1: The Dramatic Hook & Client Background (0:00 - 1:45)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Stand tall, make direct eye contact with the audience/examiners. Speak with calm, authoritative confidence. Do not rush.]\n\n"
        "[SLIDE CUE: Slide 1 - Title Slide | TrackPoint: Conquering Outback Logistics]\n\n"
        "\"Good morning, esteemed examiners, professors, and colleagues. My name is Mahir Sadman Rushad, and today I am presenting TrackPoint—an "
        "enterprise fleet dispatch, GPS telematics, and automated invoicing platform engineered for NorthLine Freight & Logistics in the Northern Territory.\n\n"
        "To understand why TrackPoint is not just another software project, you have to understand the extraordinary physical and economic reality of the "
        "Northern Territory.\n\n"
        "[SLIDE CUE: Slide 2 - The Operational Battlefield: Stuart Highway]\n\n"
        "NorthLine operates 35 heavy vehicles, employs 60 staff, and turns over $14.2 million annually. Their primary supply corridor is the 1,500-kilometer "
        "Stuart Highway—a single two-lane asphalt ribbon cutting through the red heart of Australia from Darwin in the tropical Top End, down through "
        "Katherine and Tennant Creek, to Alice Springs in the Red Centre.\n\n"
        "This highway is the sole economic lifeline for multi-million-dollar mining basins, cattle stations, remote Indigenous communities, and regional hospitals. "
        "Out here, drivers pilot triple road trains up to 53.5 meters long, hauling 85 tonnes of gross mass across ambient heat exceeding 45 degrees Celsius, "
        "monsoonal floods, and hundreds of kilometers of complete cellular dead-zones.\n\n"
        "Yet, despite operating in Australia's most brutal freight environment, NorthLine was running on manual 1990s technology: physical whiteboards, "
        "telephone check-ins, carbon-copy paper dockets, and manual invoice keying. That mismatch created an operational and cash-flow crisis.\""
    )

    # ================= SECTION 2 =================
    doc.add_heading("Section 2: The 5 Core Pain Points & Why Legacy Systems Failed (1:45 - 3:30)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Shift tone to serious, analytical. Use hands to emphasize the 5 distinct failure points.]\n\n"
        "[SLIDE CUE: Slide 3 - The 5 Core Business Pain Points]\n\n"
        "\"Before TrackPoint, NorthLine was bleeding efficiency, customer trust, and cash flow across 5 critical failure modes:\n\n"
        "1. The 15-Hour Highway Visibility Blind Spot: The moment a truck rolled out of Darwin, dispatchers had zero tracking for 15 hours until it pulled into "
        "Alice Springs. Customers flooded the office with 45 anxious phone calls every single day asking 'Where is my freight?', while receiving dock crews sat idle.\n\n"
        "2. 45-Minute Dispatch Latency: Dispatchers manually cross-referenced spreadsheets and physical whiteboards. Matching 35 vehicles against daily manifests "
        "took 45 minutes per order. Trailers departed half-empty, costing $180,000 annually in unoptimized driver overtime.\n\n"
        "3. Outstation Cellular Dead-Zone Crashes: Commercial off-the-shelf software assumes you are in Sydney with 5G. In outback dead-zones, standard apps crashed, "
        "forcing drivers back onto paper dockets. 6.5% of paper slips returned oil-stained, lost in truck cabins, or signed with illegible scrawls.\n\n"
        "4. The 14-Day Delayed Billing Crisis: NorthLine's finance team could not issue an invoice until the physical paper docket returned in the truck's cabin to Darwin "
        "two weeks later. This 14-day billing lag blew out Days Sales Outstanding to 55 days, locking up $400,000 AUD in trapped working capital.\n\n"
        "5. $50,000/Hour Mining Breakdown Downtime: When a slurry pump or excavator fails at remote mining basins, production halts at $50,000 an hour. "
        "A 2-hour phone booking delay was unacceptable.\n\n"
        "NorthLine didn't just need an app—they needed a bulletproof, cloud-native operational backbone engineered specifically for the Northern Territory.\""
    )

    # ================= SECTION 3 =================
    doc.add_heading("Section 3: The 5-Step Technical & Operational Solution (3:30 - 6:00)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Lean forward. Speak with technical precision and enthusiasm. Highlight the full-stack architecture.]\n\n"
        "[SLIDE CUE: Slide 4 - The 5-Step Technical & Operational Pipeline]\n\n"
        "\"To solve every one of these failure modes, we engineered TrackPoint using Next.js 15, TypeScript, Prisma ORM, and a live MongoDB Atlas cloud database. "
        "The entire system operates across a coordinated 5-step lifecycle:\n\n"
        "• Step 1 — Sub-5-Second Nearest-Vehicle Matching Engine: B2B customers log into the Customer Portal and select from 6 specialized freight tiers. "
        "The JobsService queries all 35 vehicles in MongoDB Atlas, computing proximity, vehicle tare mass, and specialized capabilities (such as reefer units). "
        "Dispatch latency drops from 45 minutes to under 5 seconds—a 99.8% reduction. For Express Hot-Shot orders, the system applies a gold lightning badge (⚡) "
        "and emits instant SMS notifications.\n\n"
        "• Step 2 — Cross-Dock Staging & 85t Mass Management: Manifests enter the Berrimah cross-dock queue. Gross Combination Mass (GCM) is calculated automatically "
        "against Stuart Highway axle limits. If a dispatcher reassigns a vehicle, our Chain of Responsibility Override Modal mandates selecting an HVNL reason code "
        "(such as DRIVER_FATIGUE), creating an immutable compliance audit trail.\n\n"
        "• Step 3 — 15-Second Serverless Highway Telematics Stream: Rather than using brittle WebSockets that crash during outstation signal drops, TrackPoint implements "
        "a lightweight 15-second serverless REST polling stream. OpenStreetMap and Leaflet.js render live pulsing truck markers, speed telemetry (88 km/h), and "
        "a 5-stage milestone progression chain.\n\n"
        "• Step 4 — Offline-First HTML5 Glass Signature Pad: On the driver's mobile tablet, the interface uses high-contrast Vanilla CSS for 45°C Top End sun glare. "
        "When cellular signal drops in outback blackspots, the HTML5 touch drawing canvas buffers the signature PNG data URL, recipient name, and UTC timestamp into "
        "browser LocalStorage and IndexedDB. The moment the truck re-enters 4G coverage, it auto-syncs to MongoDB with zero data loss.\n\n"
        "• Step 5 — Instant Automated ATO Tax Invoicing: The exact millisecond the e-POD signature is committed, the InvoicesService generates an official Australian "
        "Tax Invoice PDF with itemized 10% GST and NorthLine's ABN. It embeds the digital glass signature directly into the PDF and locks the record for 7 years under "
        "Corporations Act Section 286, slashing the billing cycle from 14 days down to 0 seconds.\""
    )

    # ================= SECTION 4 =================
    doc.add_heading("Section 4: Role-by-Role Screen Walkthrough (6:00 - 9:00)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Walk through each user role cleanly, explaining what each screen does, what to expect, and what it adds to the lifecycle.]\n\n"
        "[SLIDE CUE: Slide 5 - The B2B Customer Portal]\n\n"
        "\"Let us look at how our primary stakeholders interact with TrackPoint:\n\n"
        "First, the B2B Customer Portal, used by Sandra Wilson at Katherine Mining Supplies:\n"
        "• Overview Dashboard (/customer): Sandra sees her active in-transit shipments, completed deliveries, and monthly freight spend at a glance.\n"
        "• 6-Service Booking Engine (/customer/orders): Sandra books emergency Hot-Shots or Cold-Chain reefers in 60 seconds with instant automated cost and ETA calculation.\n"
        "• 5-Stage Live GPS Tracker (/customer/orders/[id]): Sandra watches her truck move down the Stuart Highway in real-time, eliminating 45 daily phone calls and allowing her dock crew to stage forklifts in advance.\n"
        "• Tax Invoices & Receipts (/customer/invoices): Her accounts payable team downloads official tax invoices embedding the recipient's glass signature for instant 3-way matching.\n\n"
        "[SLIDE CUE: Slide 6 - The Dispatcher Control Center]\n\n"
        "Second, the Operations Command Center, used by Dispatcher Priya Sharma in Darwin:\n"
        "• Consignments & Queue (/admin/consignments): Full registry with Chain of Responsibility override audit controls.\n"
        "• Dispatcher Board (/admin/dispatch): 4-column Kanban lanes with the 1-click Auto-Match Engine and Hot-Shot gold tag preemption.\n"
        "• NT Fleet Telematics (/admin/fleet): Full-screen Leaflet corridor map tracking 35 vehicles with live speed, fuel %, and reefer climate dials.\n"
        "• Operations Analytics (/admin/analytics): Executive Chart.js dashboards tracking our 96.4% on-time delivery SLA and corridor fuel burn.\n\n"
        "[SLIDE CUE: Slide 7 - The Driver Handset & Offline Signature Pad]\n\n"
        "Third, the Driver Mobile Handset, used by Senior Linehaul Driver Dave Miller in Truck #NL-14:\n"
        "• Active Drop & e-POD (/driver/active): High-contrast UI with HTML5 signature pad and offline LocalStorage buffer.\n"
        "• Manifest Queue (/driver/manifest): Sequential run-sheet preventing road train axle weight distribution errors.\n"
        "• Corridor Map (/driver/navigation): Stuart Highway navigation marking road train decoupling pads and 24-hour diesel stops.\n"
        "• Fatigue & Rig Safety (/driver/safety): NHVR Electronic Work Diary counting down 5.25-hour rest breaks and daily pre-trip circle-checks.\""
    )

    # ================= SECTION 5 =================
    doc.add_heading("Section 5: Step-by-Step Live UI Demonstration (9:00 - 11:30)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Switch screen to the live browser at https://trackpoint-platform.vercel.app. Click deliberately and narrate each action clearly.]\n\n"
        "\"Now, let me demonstrate the live production application deployed on Vercel at trackpoint-platform.vercel.app:\n\n"
        "[ACTION 1: Open /customer]\n"
        "'Here we are logged in as Sandra Wilson at Katherine Mining Supplies. You can see the live Darwin ACST clock and our active shipments. I will click + Book New Freight Shipment. I select ⚡ Express Hot-Shot from Darwin Berrimah to Katherine, entering a 2.5-tonne payload of emergency drill bits. When I click Submit, the REST API fires to /api/jobs.'\n\n"
        "[ACTION 2: Open /admin/dispatch]\n"
        "'Now switching to Priya Sharma's Dispatcher Board. Notice how the Hot-Shot order immediately appeared at the top with a gold lightning badge. I click Auto-Match Nearest Truck. In less than 2 seconds, the heuristic algorithm queries MongoDB Atlas, evaluates vehicle capabilities, and assigns Dave Miller in Truck #NL-14.'\n\n"
        "[ACTION 3: Open /customer/orders/[id]]\n"
        "'Returning to the customer view, Sandra immediately sees her tracking update. The Leaflet map shows Truck #NL-14 cruising at 88 km/h past Adelaide River with the milestone chain marked In-Transit.'\n\n"
        "[ACTION 4: Open /driver/active and toggle Offline]\n"
        "'Now let's view Driver Dave Miller's handset. Notice the top connectivity badge: Online 4G. To prove our fault tolerance, I will click Simulate Outback Offline Dead-Zone. The badge turns red: Offline Mode. The recipient signs their name directly on the HTML5 canvas pad. When Dave clicks Complete Drop, the app buffers the PNG signature into LocalStorage without crashing. Now, I switch the toggle back to Online 4G. Instantly, the background sync pushes the payload to MongoDB Atlas.'\n\n"
        "[ACTION 5: Open /customer/invoices]\n"
        "'Finally, back on the customer portal, Sandra's invoice #INV-2026-0001 is generated instantly. When we click Download Invoice PDF, you see the official 10% Australian GST, NorthLine's ABN, and the exact digital glass signature embedded into the document. The 14-day billing lag has been reduced to zero.'\""
    )

    # ================= SECTION 6 =================
    doc.add_heading("Section 6: Quantified ROI & Community Welfare (11:30 - 12:45)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Return to slides. Speak with conviction on the business case and community impact.]\n\n"
        "[SLIDE CUE: Slide 8 - Quantified ROI & Business Transformation]\n\n"
        "\"The business transformation delivered by TrackPoint is backed by rigorous financial modeling:\n\n"
        "• Dispatch Latency: Slashed from 45 minutes to < 5 seconds (-99.8%).\n"
        "• Days Sales Outstanding: Slashed from 14-day paper delays to instant 0-second billing.\n"
        "• On-Time Delivery SLA: Improved from 88.2% to 96.4% (+8.2% gain).\n"
        "• Lost POD Dockets: Reduced from 6.5% lost or soiled dockets to exactly 0.0%.\n\n"
        "From an investment perspective:\n"
        "• Capital Investment: $268,000 AUD\n"
        "• Annual Quantified Savings: +$205,000 per year ($95k driver overtime + $62k admin + $48k working capital release)\n"
        "• Net Annual Benefit: +$113,000 / year\n"
        "• Payback Period: 2.4 Years\n"
        "• Internal Rate of Return (IRR): 28.4%\n"
        "• Net Present Value (NPV @ 8% over 5 years): ~$183,000 AUD\n\n"
        "[SLIDE CUE: Slide 9 - The Human & Community Dimension]\n\n"
        "Beyond commercial metrics, TrackPoint serves a vital human purpose. In the Northern Territory, logistics is a lifeline. TrackPoint secures "
        "weekly grocery deliveries to remote Indigenous communities, protects temperature-sensitive hospital vaccines from 45°C Top End heat, "
        "and keeps heavy road train drivers safe from fatigue along isolated outback highways.\""
    )

    # ================= SECTION 7 =================
    doc.add_heading("Section 7: Powerful Closing Statement (12:45 - 13:15)", level=1)
    doc.add_paragraph(
        "[STAGE DIRECTIONS: Slow down slightly. Make final eye contact with every examiner. Deliver the closing with passion.]\n\n"
        "[SLIDE CUE: Slide 10 - Conclusion & Live Production]\n\n"
        "\"In conclusion, TrackPoint proves that modern, cloud-native engineering can conquer Australia's most unforgiving physical and operational freight corridors. "
        "By replacing paper whiteboards and 15-hour blind spots with serverless telematics, offline-first signature buffering, and automated ATO invoicing, "
        "TrackPoint transforms NorthLine from a vulnerable, paper-burdened carrier into a transparent, agile, and highly profitable industry leader.\n\n"
        "The system is live, validated, and ready for industry operations.\n\n"
        "Thank you very much. I am now delighted to take any questions from the panel.\""
    )

    # ================= SECTION 8 =================
    doc.add_heading("Section 8: Bulletproof Q&A Defense Guide (Examiner FAQ)", level=1)
    doc.add_paragraph(
        "Below are model answers for the 10 most challenging technical, operational, and business questions examiners may ask:"
    )

    qa_list = [
        ("Q1: Why did you choose 15-second REST polling instead of WebSockets for live GPS tracking?",
         "Answer: In metropolitan networks, WebSockets are ideal. However, along the 1,500km Stuart Highway, mobile devices constantly hop across sparse regional 4G towers and frequent micro-blackspots. Persistent TCP WebSocket connections suffer severe disconnection storms, reconnection reconnect overhead, and state corruption. Our 15-second serverless REST polling architecture (NFR-02) is completely stateless, lightweight, and resilient—if a poll fails due to a temporary dip, the next 15-second request seamlessly succeeds without crashing the UI."),

        ("Q2: How does your offline-first e-POD work when there is zero cellular signal for hours?",
         "Answer: The driver handset uses HTML5 <canvas> to render the signature pad. When the driver completes a delivery, the client checks navigator.onLine. If offline, the application serializes the signature PNG data URL, signee name, UTC timestamp, and GPS coordinates into browser LocalStorage and IndexedDB. A window 'online' event listener and background sync worker monitor connectivity. The moment the handset detects 4G or depot Wi-Fi, it automatically fires a background PUT request to /api/jobs/[id] and clears the buffer."),

        ("Q3: How do you handle Next.js 15 React hydration errors caused by browser extensions?",
         "Answer: Browser extensions like Dark Reader or password managers inject custom inline styles and data attributes (such as data-darkreader-inline-bgimage) into server-rendered HTML before React client hydration completes. To solve this permanently, we engineered a custom <ClientOnly> wrapper component that defers rendering client-dynamic state until after mount, combined with suppressHydrationWarning on the root <html> and <body> tags."),

        ("Q4: Why did you choose MongoDB Atlas instead of a traditional relational database like PostgreSQL?",
         "Answer: Freight manifests in the Northern Territory are highly heterogeneous. A scheduled dry linehaul job has completely different data schemas (pallet counts, trailer positions) compared to a HACCP cold-chain shipment (temperature logs, reefer setpoints) or dangerous goods (ADG UN numbers, Hazchem codes, driver DG licenses). MongoDB's flexible BSON document model, paired with Prisma ORM 6.19.3 for type safety, allows us to store rich polymorphic freight manifests, telemetry streams, and embedded signature blobs in a single scalable document."),

        ("Q5: How does TrackPoint enforce Heavy Vehicle National Law (HVNL) Chain of Responsibility?",
         "Answer: Under HVNL, dispatchers are legally liable for driver fatigue and vehicle overload breaches. TrackPoint enforces this in two ways: First, the system calculates Gross Combination Mass (GCM) against Stuart Highway 85-tonne limits before dispatch. Second, through AdminConsignmentModal.tsx, any manual reassignment of a driver or route forces the dispatcher to select a mandatory compliance reason code (DRIVER_FATIGUE, CAPACITY_OVERLOAD), creating an immutable, legally admissible audit log."),

        ("Q6: How does TrackPoint guarantee compliance with Corporations Act Section 286?",
         "Answer: Section 286 requires commercial entities to retain financial records that correctly record and explain their transactions for 7 years. TrackPoint achieves this by permanently linking every generated Tax Invoice (#INV-2026-XXXX) 1-to-1 with its underlying consignment record and the recipient's digital e-POD signature in MongoDB Atlas, creating an immutable financial and operational audit trail."),

        ("Q7: How did you calculate the $205,000 annual cost savings?",
         "Answer: Our financial model is based on NorthLine's operational baseline: (1) $95,000/year in reduced driver overtime by eliminating 45-minute dispatch whiteboard bottlenecks; (2) $62,000/year in recovered administrative labor by eliminating 45 daily customer ETA phone calls and manual paper invoice re-keying; and (3) $48,000/year in working capital interest savings by reducing Days Sales Outstanding from 55 days to immediate settlement on delivery."),

        ("Q8: How does the system handle monsoonal wet-season road closures?",
         "Answer: During the Top End wet season, flooding frequently cuts the Stuart Highway at river crossings like Adelaide River or Daly Waters. TrackPoint's Driver Navigation module overlays live road hazard alerts and rest areas, while the Dispatcher Board allows controllers to dynamically hold consignments at regional depots (Katherine, Tennant Creek) until roads reopen, updating customer milestone trackers in real-time."),

        ("Q9: What happens if two dispatchers attempt to assign the same truck simultaneously?",
         "Answer: In our Prisma ORM backend, vehicle assignment utilizes atomic updates. When an assignment request is processed at /api/jobs/[id], the transaction checks the vehicle's status field. If already flagged as 'In-Transit' or 'Loading', the transaction rejects the second assignment and emits a conflict notification toast to the second dispatcher."),

        ("Q10: Is TrackPoint scalable to other Australian freight corridors?",
         "Answer: Absolutely. TrackPoint's architecture is modular and corridor-agnostic. While our initial deployment models the 1,500km Stuart Highway, the Leaflet mapping engine, telematics ingestion pipeline, 6-service booking wizard, and automated invoicing services can be deployed across the Victoria Highway (Katherine to Kununurra/WA) or Barkly Highway (Tennant Creek to Mt Isa/QLD) with zero architectural rework.")
    ]

    for q_title, q_ans in qa_list:
        doc.add_heading(q_title, level=3)
        doc.add_paragraph(q_ans)

    doc.save(output_path)
    print(f"[SUCCESS] Script generated: {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "TrackPoint_Master_Presentation_Script.docx"
    generate_script_document(out_file)
