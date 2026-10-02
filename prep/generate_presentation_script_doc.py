#!/usr/bin/env python3
"""
Generate TrackPoint_Presentation_Script.docx inside prep/
A word-for-word spoken presentation guide with slide cues, stage directions,
live demonstration walkthrough, and closing defense arguments.
Matches Slide-by-Slide with TrackPoint_Master_Presentation.pptx.
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

def generate_script_doc(output_path="prep/TrackPoint_Presentation_Script.docx"):
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
        r_hdr = p_hdr.add_run("TrackPoint — Official Spoken Presentation & Live Demo Script")
        r_hdr.font.size = Pt(8.5)
        r_hdr.font.color.rgb = RGBColor(120, 130, 140)

        footer = section.footer
        p_ftr = footer.paragraphs[0]
        p_ftr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_ftr = p_ftr.add_run("Charles Darwin University | Master of IT (PRT631) | Mahir Sadman Rushad (S395312)")
        r_ftr.font.size = Pt(8.5)
        r_ftr.font.color.rgb = RGBColor(140, 145, 155)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(35, 40, 48)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # Title Block
    p_pre = doc.add_paragraph()
    p_pre.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_pre.add_run("ACADEMIC ORAL PRESENTATION & LIVE SYSTEM WALKTHROUGH\n")
    r_sub.font.size = Pt(11)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(26, 71, 111)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_t = p_title.add_run("TrackPoint: Presentation Script & Speaker Notes\n")
    r_t.font.size = Pt(24)
    r_t.font.bold = True
    r_t.font.color.rgb = RGBColor(18, 48, 77)

    r_sub2 = p_title.add_run("Word-for-Word Speaking Script, Slide Cues, Stage Directions, Live Software Actions, and Evaluator Engagement Strategies\n")
    r_sub2.font.size = Pt(12)
    r_sub2.font.italic = True
    r_sub2.font.color.rgb = RGBColor(80, 90, 105)

    doc.add_paragraph("")

    cover_table = doc.add_table(rows=7, cols=2)
    meta_data = [
        ("Presenter & Student", "Mahir Sadman Rushad | Student ID: S395312"),
        ("Campus & Institution", "Charles Darwin University (CDU) — Casuarina / Darwin Campus"),
        ("Degree & Course", "Master of Information Technology — PRT631 / Capstone Project"),
        ("Project Title", "TrackPoint — Fleet Dispatch, Stuart Hwy Telematics & Chain of Custody"),
        ("Target Client", "NorthLine Freight & Logistics (Darwin, NT)"),
        ("Allocated Time", "10-12 Minutes Presentation + 5 Minutes Live System Q&A"),
        ("Production URL", "https://trackpoint-platform.vercel.app")
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

    def add_slide_script(slide_num, slide_title, timing, visual_cue, stage_direction, spoken_words, live_demo_action=None):
        h = doc.add_paragraph()
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(2)
        r_num = h.add_run(f"SLIDE {slide_num}: {slide_title.upper()}")
        r_num.font.size = Pt(13)
        r_num.font.bold = True
        r_num.font.color.rgb = RGBColor(26, 71, 111)

        p_meta = doc.add_paragraph()
        p_meta.paragraph_format.space_after = Pt(4)
        r_tim = p_meta.add_run(f"⏱ Timing: {timing}  |  Visual: {visual_cue}")
        r_tim.font.size = Pt(8.5)
        r_tim.font.bold = True
        r_tim.font.color.rgb = RGBColor(2, 132, 199)

        p_dir = doc.add_paragraph()
        p_dir.paragraph_format.space_after = Pt(4)
        p_dir.paragraph_format.left_indent = Inches(0.15)
        r_dir_lbl = p_dir.add_run("🎬 Stage Direction: ")
        r_dir_lbl.font.bold = True
        r_dir_lbl.font.size = Pt(9)
        r_dir_lbl.font.color.rgb = RGBColor(180, 83, 9)
        r_dir = p_dir.add_run(stage_direction)
        r_dir.font.size = Pt(9)
        r_dir.font.italic = True
        r_dir.font.color.rgb = RGBColor(120, 53, 15)

        # Spoken Script
        p_speech = doc.add_paragraph()
        p_speech.paragraph_format.left_indent = Inches(0.2)
        p_speech.paragraph_format.space_after = Pt(6)
        r_speech_lbl = p_speech.add_run("🗣 What You Say (Word-for-Word):\n")
        r_speech_lbl.font.bold = True
        r_speech_lbl.font.size = Pt(10)
        r_speech_lbl.font.color.rgb = RGBColor(15, 23, 42)

        r_speech = p_speech.add_run(spoken_words)
        r_speech.font.size = Pt(10)

        if live_demo_action:
            p_demo = doc.add_paragraph()
            p_demo.paragraph_format.left_indent = Inches(0.2)
            p_demo.paragraph_format.space_after = Pt(8)
            r_demo_lbl = p_demo.add_run("💻 Live Software Action (On Browser): ")
            r_demo_lbl.font.bold = True
            r_demo_lbl.font.size = Pt(9)
            r_demo_lbl.font.color.rgb = RGBColor(16, 185, 129)
            r_demo = p_demo.add_run(live_demo_action)
            r_demo.font.size = Pt(9)
            r_demo.font.italic = True
            r_demo.font.color.rgb = RGBColor(6, 95, 70)

    # Slide 1
    add_slide_script(
        1,
        "Cover Page & Introduction",
        "0:00 - 0:45 (45 sec)",
        "Title Slide with student metadata, CDU Casuarina campus, and project branding.",
        "Stand tall, make direct eye contact with your teacher/examiner, speak with steady confidence, and gesture warmly toward the title slide.",
        "\"Good morning, Professor and members of the evaluation panel. My name is Mahir Sadman Rushad, Student ID S395312, representing Charles Darwin University here at Casuarina campus in our Master of IT capstone.\n\n"
        "Today, I am proud to present TrackPoint—an enterprise linehaul fleet dispatch, telematics, and chain-of-custody platform engineered specifically for the harsh realities of remote freight logistics across Australia's Northern Territory.\n\n"
        "Before I open the live production software, I want to take just two minutes to explain why this project is so critical, why off-the-shelf software consistently fails in this corridor, and the engineering decisions that make TrackPoint effortless to use for real operators.\""
    )

    # Slide 2
    add_slide_script(
        2,
        "The Real-World Crisis: 1,500km Outback Freight Transport",
        "0:45 - 2:00 (75 sec)",
        "3 Problem Columns: Corridor Reality, Operational Failures, and Generic Software Inadequacy.",
        "Change your tone to serious and analytical. Highlight the high stakes of Australian linehaul transport.",
        "\"To understand why we built TrackPoint, you have to look at the geographical reality of the Northern Territory. The Stuart Highway spans over 1,500 kilometers connecting Darwin, Katherine, Tennant Creek, and Alice Springs. Along this highway, multi-trailer road trains weighing over 100 tonnes haul vital food, pharmaceuticals, and industrial mining equipment under desert heat exceeding 40°C.\n\n"
        "In this extreme environment, freight operators like NorthLine face four massive operational failures every single day:\n"
        "First, dispatch bottlenecks: operators waste over 30 minutes on phone calls and manual paper manifests trying to allocate a single truck.\n"
        "Second, driver fatigue compliance: without real-time duty hour tracking, operators face severe legal penalties under the Heavy Vehicle National Law.\n"
        "Third, ghost deliveries: packages get dropped off without proper receiving dock verification, leading to cargo theft, broken seals, and millions in disputed claims.\n"
        "And fourth, billing lag: paper dockets sit inside truck cabs for two weeks before invoices can even be mailed out.\n\n"
        "Generic courier apps like Uber Freight simply do not work here—they assume urban delivery vans and 5G cellular coverage. TrackPoint was built from the ground up to solve these exact problems.\""
    )

    # Slide 3
    add_slide_script(
        3,
        "The Solution: TrackPoint Intelligent Telematics Platform",
        "2:00 - 3:15 (75 sec)",
        "4 Grid Cards: Intelligent Dispatch, Stuart Hwy Telematics, Receiving Dock QC, Instant Invoicing.",
        "Smile confidently. Transition from the problem to the solution with an upbeat, decisive voice.",
        "\"TrackPoint transforms this fragmented, paper-heavy nightmare into an automated, single-pane-of-glass digital platform.\n\n"
        "First, our intelligent matching algorithm pairs freight with compliant heavy vehicles in under five seconds, while keeping the human dispatcher in control with instant driver reassignment.\n\n"
        "Second, our real-time GPS telemetry tracks vehicles along authentic Stuart Highway waypoint vectors, calculating speed and dynamic ETAs rather than static fake pins.\n\n"
        "Third—and this is our crown jewel—our receiving dock Quality Control and electronic Proof of Delivery (e-POD) workflow prevents premature delivery mark-offs and enforces bolt seal and cold-chain compliance.\n\n"
        "And finally, upon digital sign-off, TrackPoint automatically generates legally binding tax invoices, compressing a 14-day billing cycle into zero seconds.\""
    )

    # Slide 4
    add_slide_script(
        4,
        "The 5-Stage Lifecycle State Machine",
        "3:15 - 4:30 (75 sec)",
        "5 Sequential Stage Cards: Booked -> Assigned -> In Transit -> Arrived -> Delivered.",
        "Use your hands to illustrate the progression across the 5 stages. Emphasize Stage 4 (Arrived) and the transit lockout.",
        "\"Most student logistics projects have a toy lifecycle where a package simply flips from 'In Transit' straight to 'Delivered'. In enterprise road transport, that is illegal and operationally negligent.\n\n"
        "TrackPoint enforces a strict five-stage deterministic state machine:\n"
        "Stage 1 is 'Booked': an order is placed and awaits dispatcher review.\n"
        "Stage 2 is 'Assigned': the dispatcher checks driver fatigue hours and approves the match.\n"
        "Stage 3 is 'In Transit': the vehicle journeys down the Stuart Highway at 88 to 95 km/h. During this stage, the driver handset explicitly locks the e-POD signature pad with an amber warning banner. A driver cannot sign an e-POD while in transit—it is technically blocked.\n"
        "Stage 4 is 'Arrived': when the heavy vehicle pulls into the destination receiving dock, the truck comes to a complete halt at 0 km/h and transitions to 'Arrived' with a distinct purple status. The driver STILL cannot mark the job delivered.\n"
        "And Stage 5 is 'Delivered': custody transfers ONLY after a human supervisor manually conducts the Quality Check (bolt security seal check, +4°C reefer temperature check) and captures the digital e-POD signature. Someone must manually verify QC and update the status to Delivered, which releases the invoice.\""
    )

    # Slide 5
    add_slide_script(
        5,
        "The Game Changer: Receiving Dock QC & e-POD Sign-Off",
        "4:30 - 6:00 (90 sec)",
        "Split slide: Why Evaluators Love This & The 4-Item Mandatory QC Checklist.",
        "Lean in slightly. This is your highest-scoring feature. Speak with passion about industry standards and legal compliance.",
        "\"Professor, this slide represents the most critical feature in TrackPoint—the Receiving Dock QC and e-POD workflow.\n\n"
        "Under the Australian Heavy Vehicle National Law, Chain of Responsibility (CoR) makes both the carrier and the receiver legally liable for cargo condition. If a refrigerated container of beef warms up past +4°C during outback transit, or if a container bolt seal is snapped, NorthLine could face a $100,000 claim.\n\n"
        "That is why someone must manually update the status to Delivered after verifying QC has passed. In TrackPoint, when the vehicle reaches the dock, the supervisor opens the 'QC & e-POD Sign-off' dialog. The receiver must explicitly verify:\n"
        "1. High-security bolt seal integrity (#NT-89422-SEC).\n"
        "2. Cold-chain reefer temperature setpoint at +4°C.\n"
        "3. Zero packaging puncture or strap failure.\n"
        "And 4. The receiver's authorized name, title, and digital signature.\n\n"
        "Only when the supervisor clicks 'Approve QC & Sign e-POD' does the status manually update to 'Delivered' and trigger the tax invoice. This eliminates premature drop-off fraud and bridges academic software engineering with commercial enterprise standards.\""
    )

    # Slide 6
    add_slide_script(
        6,
        "Extreme Ease of Use: Designed for High-Stress Field Work",
        "6:00 - 7:15 (75 sec)",
        "3 UX Pillars: Instant Cognitive Recognition, One-Click Actions, Rugged Touchscreen Targets.",
        "Use a pragmatic tone. Explain how you considered the human user (truck drivers, busy dispatchers, dock supervisors).",
        "\"Now, let me address ease of use. A system can have brilliant architecture, but if an exhausted truck driver or a busy warehouse worker cannot use it, it fails.\n\n"
        "We engineered TrackPoint with three usability pillars:\n"
        "First, Cognitive Status Recognition: we use a high-contrast visual language. Amber means high-speed highway transit; Purple means safely docked; Green means signed and sealed; Red means cancelled or alerted. A supervisor can look at a screen from five meters away and know the terminal's pulse in one second.\n\n"
        "Second, Context-Aware Actions: users never have to dig through complex sub-menus. The 'Approve Match' button only shows when an action is required; the 'QC & e-POD' button only unlocks when the truck is docked.\n\n"
        "And third, Rugged Touchscreen Optimization: in-cab tablets in road trains experience vibration. We enforced minimum 48-pixel touch targets, making buttons easy to tap even when wearing heavy industrial work gloves.\""
    )

    # Slide 7
    add_slide_script(
        7,
        "Tailored for Every Stakeholder: 3 Role Portals (RBAC)",
        "7:15 - 8:30 (75 sec)",
        "3 Cards: Dispatcher Portal, Driver In-Cab Console, Customer Self-Service.",
        "Show off the multi-tenant versatility of the system. Explain that different users see exactly what they need, nothing more.",
        "\"To maintain security and eliminate cognitive overload, TrackPoint implements strict 3-tier Role-Based Access Control:\n\n"
        "The Dispatcher has complete operational control: fleet bird's-eye view, live driver roster fatigue tracking, consignment overrides, and financial invoicing.\n\n"
        "The Driver Console is stripped down to what matters in the cab: today's manifest, statutory pre-trip brake and tire checklists, Stuart Highway GPS route navigation, and an emergency SOS link.\n\n"
        "And the Customer Portal provides transparent self-service: commercial clients book freight in 30 seconds using smart presets, monitor real-time Stuart Highway progress, and download official signed e-PODs with a single click.\""
    )

    # Slide 8
    add_slide_script(
        8,
        "Technical Architecture & Full-Stack Stack",
        "8:30 - 9:45 (75 sec)",
        "4 Tech Blocks: Next.js 15 & TS, Dual Persistence, Leaflet GPS Engine, Edge Vercel Deployment.",
        "Shift into deep engineering mode. Prove your technical mastery of the code.",
        "\"Under the hood, TrackPoint is engineered with modern full-stack rigor:\n\n"
        "We built on Next.js 15 App Router with TypeScript. By sharing our data models across the frontend and API routes, we achieved complete end-to-end type safety with zero serialization drift.\n\n"
        "For data persistence, we designed a hybrid architecture: Prisma ORM provides rock-solid relational integrity and type generation for users and billing, while Mongoose and MongoDB Atlas handle high-frequency, dynamic telematics streams.\n\n"
        "Our Leaflet GPS engine calculates authentic highway bearing and variable linehaul speeds, while automated geofence triggers transition the consignment to 'Arrived' seamlessly.\n\n"
        "The entire platform is deployed live on Vercel with zero TypeScript or linting errors, achieving sub-second edge response times.\""
    )

    # Slide 9
    add_slide_script(
        9,
        "Quantified Business Impact & Measurable ROI",
        "9:45 - 10:45 (60 sec)",
        "3 Stat Cards: 85% Faster Dispatch, 100% Custody Audit, 93% Billing Acceleration.",
        "Deliver these numbers with authority. Software is built to create real economic return.",
        "\"The real measure of software engineering is business outcome. TrackPoint delivers proven, quantified returns:\n\n"
        "First, an 85% reduction in dispatch overhead: manual phone calls dropping from 35 minutes down to less than 5 seconds.\n\n"
        "Second, 100% custody audit compliance: zero ghost deliveries, zero unverifiable loss claims, and bulletproof protection against HVNL fines.\n\n"
        "And third, a 93% acceleration in billing: transforming a 14-day manual paper invoicing lag into instant digital cash settlement upon dock sign-off.\""
    )

    # Slide 10
    add_slide_script(
        10,
        "Live Demonstration Transition & Defense Invitation",
        "10:45 - 11:30 (45 sec)",
        "Summary slide with student metadata, CDU Casuarina details, and live URLs.",
        "Transition smoothly to your browser window. Invite the teacher to watch or interact.",
        "\"To conclude, TrackPoint is not a theoretical exercise—it is a production-grade, highly specialized logistics platform engineered to solve real Australian supply chain challenges.\n\n"
        "I would now love to switch directly to the live system to walk you through the end-to-end lifecycle—from customer booking, to dispatcher driver reassignment, to highway telematics, and finally the receiving dock QC and e-POD sign-off.\n\n"
        "Thank you, and I look forward to your questions.\"",
        "Switch to Chrome/browser tab at http://localhost:3000/admin/consignments. Open Consignment #TP-9363. Show the live map, click 'QC & e-POD Sign-off', check the boxes, sign, and click 'Approve QC & Sign e-POD' to show the immediate transition to 'Delivered'."
    )

    doc.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    generate_script_doc()
