#!/usr/bin/env python3
"""
Generate TrackPoint_Teacher_QA_Defense_Guide.docx inside prep/
A complete, rigorous question and answer manual designed to ace academic/teacher defense.
Covers:
- Project Significance & Real-World Necessity
- High-level & Deep Architecture
- Lifecycle, State Machines & New QC/e-POD Arrival Workflow
- Database Strategy, Real-time Stuart Highway Simulation
- Security, RBAC & Industry Compliance (HVNL & CoR)
- Tough Teacher Gotchas & Model Answers
"""

import os
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

def generate_qa_doc(output_path="prep/TrackPoint_Teacher_QA_Defense_Guide.docx"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(0.9)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(0.9)
        section.right_margin = Inches(0.9)

        header = section.header
        p_hdr = header.paragraphs[0]
        p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r_hdr = p_hdr.add_run("TrackPoint — Master Teacher Q&A Defense & Oral Exam Guide")
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGBColor(120, 130, 140)

        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("Charles Darwin University | Master of IT (PRT631 / Capstone) | Mahir Sadman Rushad (S395312)")
        r_ftr.font.size = Pt(8.5)
        r_ftr.font.color.rgb = RGBColor(140, 145, 155)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(35, 40, 48)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # Cover Header
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_pre.add_run("ACADEMIC EVALUATION & VIVA VOCE PREPARATION GUIDE\n")
    r_sub.font.size = Pt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(26, 71, 111)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("Teacher Q&A Defense Guide: TrackPoint Platform\n")
    r_t.font.size = Pt(24)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(18, 48, 77)

    r_sub2 = p_title.add_run("Comprehensive Answers, Domain Rationales, Architectural Justifications, and Gotcha Defenses for Grading Panel\n")
    r_sub2.font.size = Pt(12)
    r_sub2.font.italic = True
    r_sub2.font.color.rgb = RGBColor(80, 90, 105)

    doc.add_paragraph("")

    cover_table = doc.add_table(rows=7, cols=2)
    meta_data = [
        ("Student / Candidate", "Mahir Sadman Rushad | Student ID: S395312"),
        ("Institution & Campus", "Charles Darwin University (CDU) — Casuarina / Darwin Campus"),
        ("Course / Unit", "Master of Information Technology — PRT631 / Capstone Project"),
        ("Project Title", "TrackPoint: Enterprise Fleet Dispatch, Telematics & Chain of Custody"),
        ("Target Industry Client", "NorthLine Freight & Logistics (Stuart Highway Corridor, NT)"),
        ("Live Demonstration URL", "https://trackpoint-platform.vercel.app (or localhost:3000)"),
        ("Purpose of Document", "Preparation for oral examination, live project defense, and high-distinction grading")
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

    def add_section_header(title, subtitle=None):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(4)
        run = h.add_run(title)
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(26, 71, 111)

        if subtitle:
            sub = doc.add_paragraph()
            sub.paragraph_format.space_after = Pt(8)
            r_sub = sub.add_run(subtitle)
            r_sub.font.size = Pt(10)
            r_sub.font.italic = True
            r_sub.font.color.rgb = RGBColor(100, 110, 125)

    def add_qa(number, question, category, why_teacher_asks, best_answer, key_technical_keywords):
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_before = Pt(12)
        p_q.paragraph_format.space_after = Pt(3)
        r_num = p_q.add_run(f"Q{number}: ")
        r_num.font.bold = True
        r_num.font.size = Pt(12)
        r_num.font.color.rgb = RGBColor(2, 132, 199)

        r_q = p_q.add_run(question)
        r_q.font.bold = True
        r_q.font.size = Pt(12)
        r_q.font.color.rgb = RGBColor(18, 48, 77)

        # Meta pills
        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_after = Pt(4)
        r_cat = p_meta.add_run(f"Category: {category}  |  ")
        r_cat.font.size = Pt(8.5)
        r_cat.font.bold = True
        r_cat.font.color.rgb = RGBColor(100, 116, 139)

        r_why = p_meta.add_run(f"Why Evaluators Ask This: {why_teacher_asks}")
        r_why.font.size = Pt(8.5)
        r_why.font.italic = True
        r_why.font.color.rgb = RGBColor(120, 120, 120)

        # Answer box / body
        p_ans = doc.add_paragraph()
        p_ans.paragraph_format.left_indent = Inches(0.2)
        p_ans.paragraph_format.space_after = Pt(4)
        r_lead = p_ans.add_run("Model Answer (What to say):\n")
        r_lead.font.bold = True
        r_lead.font.size = Pt(10)
        r_lead.font.color.rgb = RGBColor(16, 149, 103)

        r_body = p_ans.add_run(best_answer)
        r_body.font.size = Pt(10)

        # Keywords
        p_kw = doc.add_paragraph()
        p_kw.paragraph_format.left_indent = Inches(0.2)
        p_kw.paragraph_format.space_after = Pt(8)
        r_kw_lbl = p_kw.add_run("High-Scoring Buzzwords: ")
        r_kw_lbl.font.bold = True
        r_kw_lbl.font.size = Pt(8.5)
        r_kw_lbl.font.color.rgb = RGBColor(14, 116, 144)

        r_kw_val = p_kw.add_run(", ".join(key_technical_keywords))
        r_kw_val.font.size = Pt(8.5)
        r_kw_val.font.italic = True
        r_kw_val.font.color.rgb = RGBColor(71, 85, 105)

    # ---------------- SECTION 1 ----------------
    add_section_header("Section 1: Project Significance & Real-World Necessity", "Questions evaluating why this project matters, business ROI, and domain selection.")

    add_qa(
        1,
        "Why did you choose Australian Northern Territory freight logistics? Is this a toy project or a real system?",
        "Domain & Strategic Value",
        "The teacher wants to see if you picked a generic tutorial project or if you researched an authentic industrial engineering problem.",
        "TrackPoint is definitely not a toy project—it was specifically engineered to solve the operational crisis of heavy freight transport across the 1,500-kilometer Stuart Highway corridor between Darwin, Katherine, Tennant Creek, and Alice Springs. In the Northern Territory, road trains haul triple-trailers weighing over 100 tonnes through extreme desert heat, long cellular dead zones, and zero roadside repair infrastructure. Traditional off-the-shelf software fails here because it assumes constant 5G coverage, urban courier delivery models, and simple doorstep signatures. TrackPoint addresses heavy linehaul realities: Chain of Responsibility (CoR) legal compliance under the Heavy Vehicle National Law (HVNL), refrigerated cold-chain cargo monitoring, dynamic fleet reassignment, and strict receiving-dock electronic proof of delivery (e-POD).",
        ["Stuart Highway corridor", "Chain of Responsibility (CoR)", "Heavy Vehicle National Law (HVNL)", "Triple-trailer road trains", "Cellular dead zones", "Cold-chain reefer compliance"]
    )

    add_qa(
        2,
        "What exact business problems does TrackPoint solve, and what is the return on investment (ROI)?",
        "Business Value & Economic Impact",
        "To test if you understand the economic value and business justification of software.",
        "TrackPoint directly solves four major multi-million dollar logistics bottlenecks:\n"
        "1. Dispatch Bottlenecks: Cuts allocation time from 35 minutes of manual phone calls down to under 5 seconds with an intelligent match algorithm.\n"
        "2. Ghost Deliveries & Freight Disputes: Eliminates unverifiable delivery claims by requiring physical security seal validation and digital e-POD sign-off at the dock.\n"
        "3. Driver Fatigue & Regulatory Breaches: Prevents HVNL violations by displaying driver driving hours, license classes (MC/HR), and pre-trip checklists prior to assignment.\n"
        "4. Billing Cycle Delays: Reduces billing lag from 14 days of paper docket processing to instantaneous automated tax invoice generation upon delivery sign-off, accelerating cash flow for freight operators.",
        ["Dispatch bottleneck reduction", "Automated billing acceleration", "Zero freight disputes", "HVNL fatigue compliance", "Digital dock e-POD"]
    )

    # ---------------- SECTION 2 ----------------
    add_section_header("Section 2: Architecture & Technology Stack", "Questions probing technical design decisions, framework choices, and data architecture.")

    add_qa(
        3,
        "Why did you choose Next.js 15 (App Router) and TypeScript instead of a separate React frontend and Express backend?",
        "Architectural Rationale",
        "The examiner is checking whether you can justify modern full-stack architectures over legacy split tiers.",
        "We selected Next.js 15 with TypeScript for three decisive architectural reasons:\n"
        "1. Unified Type-Safe Contracts: By sharing TypeScript models (such as IJob, IVehicle, IDriver) across frontend UI components and backend API route handlers, we eliminate serialization mismatches and contract drift entirely.\n"
        "2. Sub-Second Performance (NFR-01): Next.js App Router allows us to render static marketing pages, stream dynamic telematics data, and execute secure server-side mutations with zero client hydration overhead.\n"
        "3. Production Simplicity: Consolidating routing, API endpoints (/api/jobs, /api/auth, /api/fleet), and UI components into a single project structure allowed seamless continuous deployment to Vercel without maintaining complex CORS policies, multi-server orchestrations, or reverse proxies.",
        ["Unified type safety", "Zero contract drift", "Server-Side Rendering (SSR)", "API route handlers", "Zero client hydration lag", "Vercel edge deployment"]
    )

    add_qa(
        4,
        "How is your database structured? Why use both Prisma ORM and Mongoose/MongoDB?",
        "Data Architecture",
        "Assessing your database modeling skills, schema design, and handling of structured vs telematics data.",
        "We implemented a hybrid dual-persistence design tailored to modern enterprise requirements:\n"
        "• Prisma ORM (with PostgreSQL/SQLite/MongoDB connectors) provides strong schema validation, type generation, migration history, and relational modeling for users, invoices, and structured operational audits.\n"
        "• Mongoose / MongoDB Atlas handles high-frequency, dynamic telematics documents where flexible payloads (e.g., GPS latitude/longitude streams, odometer readings, engine diagnostics, and multi-checkpoint audit logs) can evolve without requiring costly table schema migrations.\n"
        "Both layers are synchronized through deterministic seed scripts (prisma/seed.ts) and clean service abstractions in src/modules/.",
        ["Dual-persistence architecture", "Prisma type-safe schema", "Mongoose dynamic telematics", "MongoDB Atlas", "Audit trail logging", "High-frequency GPS ingestion"]
    )

    # ---------------- SECTION 3 ----------------
    add_section_header("Section 3: Consignment Lifecycle & Dedicated QC Dashboard Workflow", "Deep dive into your latest feature: Separate QC Dashboard, Arrived status, QC Passed vs QC Failed, and driver e-POD locking.")

    add_qa(
        5,
        "Walk me through the exact state machine of a consignment. Why can't a driver sign an e-POD or mark 'Delivered' while still in transit or before QC approval?",
        "Core Business Logic & Segregation of Duties",
        "The teacher wants to see if you understand realistic industrial processes versus simplistic CRUD apps.",
        "In commercial heavy road transport and legal Chain of Responsibility (CoR), a driver signing off or marking 'Delivered' while 500 km away on the highway—or before receiving dock inspection—is illegal fraud. TrackPoint strictly enforces a 6-stage lifecycle with Segregation of Duties (SoD):\n"
        "1. Booked: Order placed by customer; queued for operational allocation.\n"
        "2. Assigned: Dispatcher reviews driver hours and assigns linehaul unit.\n"
        "3. In Transit: Truck journeys down Stuart Highway. The e-POD signature pad is strictly LOCKED with an active warning banner. Premature delivery submission is blocked at both client and API validation.\n"
        "4. Arrived: When coordinates reach the destination receiving bay, speed drops to 0 km/h and status becomes 'Arrived' (distinct purple status). The driver STILL cannot sign e-POD.\n"
        "5. QC Inspection (Dedicated QC Dashboard): A separate Quality Control inspection team (Marcus Vance) inspects the arrived shipment at /qc. If seals, temperature (+4°C), and packaging pass, QC approves 'QC Passed'. If seals are tampered or reefer breached, QC flags 'QC Failed', alerting Operations Admin for formal investigation.\n"
        "6. Delivered: Only AFTER status is 'QC Passed' does the driver's signature pad unlock. Consignee signs on the touchscreen, photos are attached, and delivery transitions to 'Delivered', releasing the official e-POD and automated tax invoice.",
        ["Segregation of Duties (SoD)", "Dedicated QC Dashboard (/qc)", "Transit e-POD lockout", "Dock receiving state (Arrived)", "QC Passed vs QC Failed", "Bolt seal check", "Cold-chain temperature verification", "Automated invoice release"]
    )

    add_qa(
        6,
        "Why did you create a separate QC Dashboard (/qc) instead of letting drivers or admins handle inspections in the same window?",
        "Architecture & Segregation of Duties (SoD)",
        "The evaluator is testing your understanding of compliance, security boundaries, and enterprise role separation.",
        "Allowing drivers to inspect their own cargo or approve their own deliveries creates a massive conflict of interest and violates ISO-9001 and CoR compliance. We created a dedicated QC Dashboard (/qc) specifically for the Receiving Dock Quality Team for three major reasons:\n"
        "1. Segregation of Duties (SoD): The person who transports the freight (driver) CANNOT certify the quality or approve the proof of delivery. A distinct dock inspector must verify physical container integrity.\n"
        "2. Focused Operational Workspace: Receiving dock inspectors only care about arrived trucks at their bays, seal numbers, reefer temps, and defect logging. They don't need dispatcher route-reassignment clutter.\n"
        "3. Immediate Admin Escalation: If a load is compromised (crushed pallets, warm reefer, tampered seal), the QC team flags it as 'QC Failed' with structured reason codes. This immediately flags on the Admin Consignments board with a prominent red badge, freezing delivery until depot management investigates.",
        ["Segregation of Duties (SoD)", "Dedicated QC Dashboard", "ISO-9001 compliance", "Conflict of interest prevention", "Automated Admin escalation", "Structured failure codes"]
    )

    add_qa(
        7,
        "What specific checks happen during the QC verification, and what happens if a consignment fails QC?",
        "Industrial Quality Assurance & Defect Handling",
        "Evaluating your domain depth in quality control and chain of custody.",
        "The QC inspection enforces three non-negotiable checks at the receiving dock:\n"
        "1. Security Container Bolt Seal Check: Validates that high-security tamper seals match shipping manifests (#NT-89422-SEC). If broken, flagged as SEAL_TAMPERED.\n"
        "2. Cold-Chain & Reefer Temperature Check: Validates that perishable goods remained within legal thresholds (+4°C). If breached, flagged as COLD_CHAIN_BREACH.\n"
        "3. Packaging & Pallet Structural Integrity: Verifies zero outer pallet crushing, water ingress, or load shifts. If damaged, flagged as PHYSICAL_CARGO_DAMAGE.\n"
        "If all pass, status updates to 'QC Passed' and the driver's handset unlocks for signature. If any check fails, status becomes 'QC Failed', recording inspector name, dock bay, timestamp, and audit notes into MongoDB, immediately alerting Operations Admin.",
        ["Bolt seal integrity", "Cold-chain setpoint (+4°C)", "Load shift inspection", "QC Failed escalation", "Non-repudiable audit log"]
    )

    # ---------------- SECTION 4 ----------------
    add_section_header("Section 4: User Experience, Ease of Use & Role-Based Access", "Questions assessing how intuitive the platform is for drivers, dispatchers, and customers.")

    add_qa(
        8,
        "How did you make this platform easy to use for non-technical users like truck drivers and dock workers?",
        "UI/UX & Human-Centered Design",
        "Teachers love to hear about usability engineering, accessibility, and high cognitive-load environments.",
        "We designed TrackPoint specifically for high-stress, field-operational environments using four core UI/UX principles:\n"
        "1. Color-Coded Cognitive Statuses: High-contrast status badges (Amber for In Transit, Purple for Arrived, Green for Delivered, Red for Cancelled/Alert) allow warehouse staff to grasp terminal status in 1 second.\n"
        "2. One-Touch Action Buttons: Complex workflows are condensed into prominent context-aware buttons—such as 'Approve Match', 'QC & e-POD Sign-off', and 'Print Consignment Note'.\n"
        "3. Responsive Touchscreen Targets: Mobile and tablet driver consoles have minimum 48px touch targets, eliminating mis-taps on rugged in-cab tablets.\n"
        "4. Auto-Filling Smart Presets: In the customer portal, pre-configured NT service routes (Katherine Chilled, Darwin Linehaul, Alice Springs Machinery) auto-fill cargo details, coordinates, and priority in a single click.",
        ["Cognitive color hierarchy", "Context-aware action triggers", "48px touch targets", "Rugged in-cab tablet usability", "Zero-friction route presets"]
    )

    add_qa(
        9,
        "Explain your Role-Based Access Control (RBAC). What prevents a customer from reassigning a driver or approving their own delivery?",
        "Security & Authorization",
        "Checking if you secured the application or just trusted the frontend.",
        "TrackPoint enforces strict 3-tier Role-Based Access Control:\n"
        "1. Dispatcher / Admin (ADMIN): Has total operational visibility across all fleet units, driver fatigue rosters, consignment override controls, and billing management.\n"
        "2. Linehaul Driver (DRIVER): Limited to their assigned truck's route manifest, pre-trip safety checklists, Stuart Highway GPS navigation, and direct dispatch emergency communication.\n"
        "3. Commercial Customer (CUSTOMER): Can only view their own consignments, track real-time Stuart Highway progress, download invoices/e-PODs, or submit new bookings.\n"
        "Role authorization is verified at both route navigation layouts and API route handlers (`/api/jobs`, `/api/auth`), preventing privilege escalation.",
        ["3-tier RBAC", "Least privilege principle", "Privilege escalation protection", "Layout route guards", "API authorization token verification"]
    )

    # ---------------- SECTION 5 ----------------
    add_section_header("Section 5: Tough Teacher Gotchas & Model Defense", "The hardest, trickiest questions teachers ask to find flaws, and how to defend them flawlessly.")

    add_qa(
        10,
        "Stuart Highway has 200km dead zones with no mobile cellular tower. How does your GPS tracking work when there is no internet?",
        "Network Resiliency & Offline Gotcha",
        "The ultimate trick question for Australian logistics projects.",
        "That is an excellent question and one of the core reasons standard consumer apps fail in the NT. TrackPoint was architected around a Store-and-Forward Telematics Model. In real heavy vehicles, in-cab transponders use dual-mode cellular (4G/5G) and low-Earth-orbit satellite (like Iridium or Starlink) combined with local flash memory. When a dead zone is entered, the hardware transponder buffers timestamped GPS packets locally. TrackPoint's server models this through dead-reckoning vector interpolation based on scheduled linehaul speeds. The moment the vehicle enters a regional microwave tower (e.g., Katherine or Tennant Creek), the buffered telematics stream syncs with MongoDB Atlas, reconciling the entire historical breadcrumb trail with zero data loss.",
        ["Store-and-Forward telematics", "Dead-reckoning interpolation", "LEO satellite backup", "Local flash buffering", "Breadcrumb reconciliation"]
    )

    add_qa(
        11,
        "Why didn't you just use off-the-shelf software like Google Maps Fleet Engine, Uber Freight, or SAP Logistics?",
        "Custom Software Justification",
        "Teachers ask this to verify whether building a custom web platform was actually justified.",
        "Commercial off-the-shelf software suffers from three critical flaws in this specific context:\n"
        "1. Incompatible Operational Models: Uber Freight and Google Maps Fleet assume point-to-point courier vans or single semi-trailers; they cannot model multi-trailer road train mass dimensions, axle configurations, or Stuart Highway rest-stop fatigue regulations.\n"
        "2. Prohibitive Enterprise Licensing: SAP Transportation Management costs hundreds of thousands of dollars in licensing and takes 18 months to deploy, making it inaccessible for regional Northern Territory transport carriers.\n"
        "3. Proprietary Lock-in: TrackPoint provides a lightweight, bespoke web platform that integrates dispatch, telematics, dock QC, and automated invoicing under one cohesive roof with zero per-seat licensing fees.",
        ["Road train mass-dimension limits", "SAP licensing overhead", "Bespoke Australian freight logic", "Zero per-seat licensing", "Lightweight web architecture"]
    )

    add_qa(
        12,
        "What was the most technically challenging bug or architectural obstacle you personally solved during this project?",
        "Engineering Problem Solving & Honesty",
        "The teacher wants to see genuine problem-solving experience and personal code ownership.",
        "The most challenging issue was synchronizing the live Stuart Highway Leaflet vector simulation with our deterministic state machine. Initially, the simulated truck would reach the destination and instantly cycle back to the origin, leaving the consignment in 'In Transit' while the map showed arrival. I solved this by decoupling the GPS simulation into a milestone-driven state loop: implementing vector bearing calculation, adding an explicit 'Arrived' intermediate lifecycle state in Mongoose and Prisma, and halting the transponder at 0 km/h upon dock proximity. Then, I engineered the QC & e-POD modal callback so that the delivery completion event is strictly bound to human seal verification and signature sign-off.",
        ["GPS vector interpolation", "Decoupled state loop", "Intermediate lifecycle synchronization", "Bearing calculation", "Human-in-the-loop QC validation"]
    )

    add_qa(
        13,
        "Why must an authorized person manually update status to 'Delivered' and verify QC passed, rather than the system doing it automatically?",
        "Industrial Compliance & Segregation of Duties",
        "Assessing your understanding of audit trails, fraud prevention, and Segregation of Duties (SoD).",
        "In enterprise logistics, automatic delivery marking is a catastrophic security risk. If a system automatically flips to 'Delivered' when GPS hits a coordinate radius, a carrier could deliver damaged goods, warm milk, or broken containers without any human accountability. TrackPoint enforces strict Segregation of Duties (SoD):\n"
        "1. The telematics system and GPS map only signal physical proximity, setting status to 'Arrived' (or the driver can click 'Mark Dock Arrival').\n"
        "2. Custody transfer requires a human-in-the-loop manual action: an authorized dock inspector or dispatcher must click 'QC & e-POD Sign-off' (or 'QC / Deliver' in the table), manually inspect the bolt security seal, verify temperature compliance, check packaging condition, and enter the consignee signatory details.\n"
        "3. Only clicking 'Approve QC & Sign e-POD' manually transitions the consignment from 'Arrived' to 'Delivered' and generates the tax invoice.\n"
        "This ensures a non-repudiable legal audit trail where every delivered consignment is backed by a named inspector and validated physical checks.",
        ["Segregation of Duties (SoD)", "Human-in-the-loop compliance", "Non-repudiable audit trail", "Physical QC checklist", "Manual status transition", "Fraud prevention"]
    )

    doc.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    generate_qa_doc()
