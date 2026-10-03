"""Speaker notes data — importable dict mapping slide number → presentation script."""

notes = {
    1: """Good day examiners and colleagues. Today, I am proud to present TrackPoint—an enterprise fleet dispatch, Stuart Highway GPS telematics, and automated invoicing platform engineered for NorthLine Freight & Logistics in Darwin. This capstone project addresses the severe operational, geographical, and technological challenges of remote Northern Territory linehaul freight, replacing fragile 1990s paper processes with a unified, offline-first digital architecture.""",

    2: """To understand the necessity of TrackPoint, we must look at the regional operating environment. NorthLine operates triple road trains hauling up to 85 tonnes along the 1,500-kilometer Stuart Highway corridor between Darwin, Katherine, Alice Springs, and southern intermodal terminals in Sydney and Adelaide. In this harsh environment—marked by tropical monsoonal flooding in the Top End and 45-degree desert heat—equipment downtime at remote iron ore and gold mines costs upwards of $50,000 an hour. Yet over 800 kilometers of this vital route completely lack cellular mobile coverage.""",

    3: """These harsh conditions created three critical operational bottlenecks for NorthLine:
First, a 15-hour tracking blind spot where dispatchers lose all visibility of drivers and freight between depots.
Second, a 45-minute dispatch bottleneck where loading teams manually juggle physical whiteboards and phone check-ins, creating dock queuing and compliance risks under Heavy Vehicle National Law.
And third, a 14-day paper billing lag caused by physical carbon-copy dockets being lost, soiled, or delayed in truck cabs, trapping over $400,000 in unbilled working capital.""",

    4: """TrackPoint solves this crisis by deploying a unified, offline-first cloud ecosystem. Instead of disjointed spreadsheets and phone calls, TrackPoint establishes a single source of operational truth connecting all five key stakeholder groups: B2B Enterprise Customers, Operations Dispatchers, Linehaul Drivers, Receiving Dock Quality Assurance leads, and Financial Billing auditors.""",

    5: """In strict accordance with enterprise architecture standards, TrackPoint is structured using the TOGAF 4-Layer framework:
At the Business Layer, we govern Chain of Responsibility compliance, SLA commitments, and automated order-to-cash workflows.
At the Application Layer, we provide granular Role-Based Access Control, an automated vehicle dispatch engine, and digital proof of delivery.
At the Data Layer, we maintain normalized MongoDB Atlas schemas and edge LocalStorage queues.
And at the Technology Layer, we leverage Vercel serverless edge computing and resilient stateless REST polling.""",

    6: """Our technical stack was engineered specifically for durability and resilience:
We built the frontend and API layers using Next.js 15 App Router with React 19 and full TypeScript type safety to eliminate runtime exceptions.
Tailwind CSS provides high-contrast UI theming tailored for extreme sun glare inside truck cabins.
Prisma ORM handles typed data access, while Leaflet.js provides high-performance GIS tracking.
Crucially, we replaced brittle WebSocket connections with lightweight 15-second stateless REST polling to prevent reconnection storms when driving through weak cellular fringes.""",

    7: """Here we showcase our primary technical breakthrough: the Outback Offline-First Engine.
Most web applications crash when connection is lost. TrackPoint implements a 4-stage resilient state machine:
When a driver reaches a remote cattle station or mine with zero mobile signal, the device captures the GPS coordinates, timestamp, and recipient glass signature.
This payload is instantly buffered into browser LocalStorage, and a high-visibility badge alerts the driver that data is safely secured locally.
The moment the vehicle encounters a roadside cell tower, a background reconciliation worker syncs the data to MongoDB Atlas using an idempotent transaction UUID—guaranteeing zero data loss and zero duplicate records.""",

    8: """Now, let us examine the complete 5-stage freight lifecycle implemented in TrackPoint.
We take freight through a continuous, closed-loop pipeline:
Stage 1: Self-Service Customer Booking.
Stage 2: Sub-5-second Auto-Match Dispatching.
Stage 3: Real-Time Stuart Highway Corridor Telematics.
Stage 4: Receiving Dock Arrival and Mandatory Quality Inspection.
And Stage 5: Electronic Proof of Delivery resulting in instantaneous ATO-compliant Tax Invoicing.""",

    9: """Here on screen is our live B2B Customer Portal, shown through the perspective of Sandra Wilson from Katherine Mining Supplies.
Clients choose from 6 enterprise freight tiers—including Heavy Machinery and Express Hot-Shot—with real-time automated distance and dynamic rate calculation.
Clients have live visibility of their road train on the Stuart Highway map, eliminating dozens of anxious phone calls and allowing depot forklift operators to stage loading bays right on time.""",

    10: """Next is the Operations Command Center in Darwin, used by lead dispatcher Priya Sharma.
Our Sub-5-Second Auto-Match Engine analyzes vehicle availability, trailer capabilities, and current location.
Crucially, it calculates cargo mass against vehicle Gross Combination Mass (GCM) limits to prevent dangerous highway axle overloading.
To maintain strict Heavy Vehicle National Law compliance, any manual override requires selecting an auditable reason code such as driver fatigue or scheduled maintenance.""",

    11: """This is the live Stuart Highway Corridor Telematics Map, powered by Leaflet.js and OpenStreetMap.
Dispatchers monitor all commercial vehicles across our four main Northern Territory hubs: Darwin, Katherine, Tennant Creek, and Alice Springs.
The map plots real-time road train velocity, reefer temperature sensor pings, and waypoint milestones, instantly flagging unexpected route stoppages or schedule exceptions.""",

    12: """For the linehaul driver in the cabin—such as Dave Miller in Truck NL-14—we designed an ergonomic mobile handset console.
The interface features large touch targets and glare-optimized contrast designed for high-vibration driving in intense Australian sunlight.
It features a sequential manifest workflow and an automated rest-break timer enforcing mandatory NHVR fatigue stops along the 1,500km journey.""",

    13: """A major innovation in TrackPoint is our Receiving Dock Arrival and Quality Assurance Protocol, led by Marcus Vance at Receiving Bay 3.
Before a consignment can be closed, receiving teams must clear three non-negotiable gates:
First, confirming that the container security seal is intact.
Second, verifying cold-chain temperature logs.
And third, certifying cargo integrity without physical transit damage.
This timestamped audit log permanently eliminates disputes between transport carriers and consignees.""",

    14: """Upon passing dock inspection, the driver captures the consignee's Electronic Proof of Delivery using this interactive HTML5 digital glass signature pad.
The recipient's signature vector, legal name, and precise GPS geostamp are committed into an immutable audit package.
Even in remote outback dead zones with zero bars of 4G, this transaction is guaranteed safe in local storage, eliminating lost or damaged paper dockets.""",

    15: """The exact millisecond that delivery signature is confirmed, TrackPoint's automated billing engine generates an official Australian Tax Invoice.
It features itemized 10% GST calculation, verified ABN numbers, and embeds the recipient's digital signature directly onto the invoice record.
This collapses NorthLine's billing cycle from 14 days down to zero seconds, shrinking Days Sales Outstanding by 31% and unlocking $400,000 in trapped working capital.""",

    16: """Senior logistics executives monitor operational health through our Executive Analytics Hub.
Using real-time Chart.js visualizations, management tracks NorthLine's 96.4% on-time delivery SLA, depot bay turnaround velocity, and fleet utilization rates.
The system automatically logs delivery exceptions—categorizing delays by monsoonal weather, road detours, or mechanical servicing—providing actionable data for continuous operational improvement.""",

    17: """Security and legal governance are woven into every tier of TrackPoint.
We enforce strict Role-Based Access Control partitioning customer, dispatcher, driver, QC, and finance privileges.
Client commercial data and driver identities are protected under the Australian Privacy Principles.
Our Chain of Responsibility audit logging ensures legal defensibility under the Heavy Vehicle National Law, while all invoices and proof-of-delivery records are immutably archived for 7 years in accordance with Section 286 of the Corporations Act.""",

    18: """To satisfy PRT631 Requirement 6, we conducted a rigorous threat analysis and built automated contingency plans:
For prolonged outback cellular blackspots, our offline buffer and satellite SMS check-in ensure operational continuity.
For wet-season monsoonal road closures, TrackPoint provides dynamic detour routing and integration with the Adelaide-to-Darwin freight railway.
For cloud infrastructure resilience, Vercel serverless edge failover and hourly automated MongoDB Atlas snapshots provide a Recovery Point Objective of under 15 minutes.""",

    19: """The platform was executed across a disciplined 12-week Agile implementation roadmap:
Sprints 1 through 3 progressed from initial stakeholder analysis at NorthLine's Darwin terminal to core telematics and offline signature engineering.
Sprint 4 culminated in a live production pilot on the Darwin-to-Katherine corridor, supported by driver usability training and change management workshops to ensure 100% field adoption.""",

    20: """In conclusion, TrackPoint delivers $205,000 in recurring net annual savings, eliminates paper docket loss, and achieves a full financial payback in just 2.4 years.
The project 100% fulfills all PRT631 capstone objectives and is deployed live today on Vercel at trackpoint-platform.vercel.app.
Looking ahead, our architecture is ready for Phase 2 AI weather rerouting and Phase 3 IoT cold-chain trailer sensors.
Thank you very much for your time. I am now delighted to answer any questions from the panel."""
}
