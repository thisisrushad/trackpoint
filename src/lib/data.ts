/**
 * TrackPoint Comprehensive Real-World Northern Territory Freight Data Store
 * Simulates the complete operational database for NorthLine Freight & Logistics
 * 35 Fleet Vehicles, 10 B2B Commercial Clients, Real Stuart Highway GPS Coordinates
 */

export interface Job {
  id: string;
  customer: string;
  pickup: string;
  dropoff: string;
  goods: string;
  priority: "Standard" | "Express";
  driver: string;
  vehicle: string;
  status: "Booked" | "Assigned" | "In Transit" | "Arrived" | "QC Passed" | "Delivered" | "Invoiced" | "Cancelled";
  eta: string;
  lat: number;
  lng: number;
  recipientName?: string;
  signatureDataUrl?: string;
  photoUrl?: string;
  completedAt?: string;
  overrideReason?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  driver: string;
  depot: "Darwin Metro" | "Katherine Depot" | "Tennant Creek" | "Alice Springs";
  lat: number;
  lng: number;
  status: "In Transit" | "Depot Staging" | "Loading" | "Delivering" | "Off Duty";
  speed: string;
  battery: string;
  fuelLevel: string;
}

export interface Invoice {
  id: string;
  jobId: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  gst: number;
  total: number;
  status: "Draft" | "Issued" | "Paid";
  signatureUrl?: string;
  recipientName?: string;
  deliveryTimestamp?: string;
}

export const NT_COORDINATES = {
  darwin: [-12.4634, 130.8456] as [number, number],
  palmerston: [-12.4935, 130.9850] as [number, number],
  adelaideRiver: [-13.2384, 131.1065] as [number, number],
  pineCreek: [-13.8242, 131.8285] as [number, number],
  katherine: [-14.4652, 132.2635] as [number, number],
  mataranka: [-14.9220, 133.0645] as [number, number],
  larrimah: [-15.5760, 133.2140] as [number, number],
  dalyWaters: [-16.2550, 133.3680] as [number, number],
  elliott: [-17.5580, 133.5420] as [number, number],
  tennantCreek: [-19.6459, 134.1915] as [number, number],
  barrowCreek: [-21.5230, 133.8860] as [number, number],
  tiTree: [-22.1300, 133.4180] as [number, number],
  aliceSprings: [-23.6980, 133.8807] as [number, number]
};

export const STUART_HIGHWAY_WAYPOINTS: [number, number][] = [
  NT_COORDINATES.darwin,
  [-12.7845, 131.0560],
  NT_COORDINATES.adelaideRiver,
  [-13.5200, 131.4500],
  NT_COORDINATES.pineCreek,
  [-14.1500, 132.0200],
  NT_COORDINATES.katherine
];

export function getDestinationCoords(address: string): [number, number] {
  const addr = (address || "").toLowerCase();
  if (addr.includes("airport")) return [-12.4145, 130.8765];
  if (addr.includes("humpty doo")) return [-12.5833, 131.2500];
  if (addr.includes("palmerston")) return NT_COORDINATES.palmerston;
  if (addr.includes("berrimah") || addr.includes("darwin port") || addr.includes("harbour") || addr.includes("frances bay") || addr.includes("darwin")) {
    return NT_COORDINATES.darwin;
  }
  if (addr.includes("adelaide river")) return NT_COORDINATES.adelaideRiver;
  if (addr.includes("pine creek")) return NT_COORDINATES.pineCreek;
  if (addr.includes("katherine")) return NT_COORDINATES.katherine;
  if (addr.includes("mataranka")) return NT_COORDINATES.mataranka;
  if (addr.includes("daly waters")) return NT_COORDINATES.dalyWaters;
  if (addr.includes("elliott")) return NT_COORDINATES.elliott;
  if (addr.includes("tennant")) return NT_COORDINATES.tennantCreek;
  if (addr.includes("barrow creek")) return NT_COORDINATES.barrowCreek;
  if (addr.includes("ti tree")) return NT_COORDINATES.tiTree;
  if (addr.includes("alice springs") || addr.includes("smith st")) return NT_COORDINATES.aliceSprings;
  if (addr.includes("jabiru")) return [-12.6720, 132.8360];
  if (addr.includes("borroloola")) return [-16.0720, 136.3050];
  if (addr.includes("yuendumu")) return [-22.2500, 131.7900];
  return NT_COORDINATES.katherine;
}

export interface LogisticsServiceItem {
  id: string;
  title: string;
  category: "linehaul" | "express" | "coldchain" | "heavy" | "medical" | "metro";
  icon: string;
  badge: string;
  leadTime: string;
  description: string;
  idealFor: string;
  rateBase: string;
  defaultPriority: "Standard" | "Express";
  defaultGoods: string;
  defaultPickup: string;
  defaultDropoff: string;
}

export const NORTHLINE_SERVICES: LogisticsServiceItem[] = [
  {
    id: "scheduled-linehaul",
    title: "Scheduled Stuart Hwy Linehaul",
    category: "linehaul",
    icon: "🚛",
    badge: "Most Popular",
    leadTime: "24 – 48 Hours",
    description: "Daily scheduled consolidated linehaul connecting Darwin, Katherine, Tennant Creek, and Alice Springs depots.",
    idealFor: "Palletized freight, commercial hardware, non-perishables, general cargo",
    rateBase: "From $850 / pallet",
    defaultPriority: "Standard",
    defaultGoods: "6x Palletized Industrial Hardware & Supplies (4.5t)",
    defaultPickup: "Darwin Depot (120 Berrimah Rd, Darwin)",
    defaultDropoff: "Katherine Store (Katherine Terrace)"
  },
  {
    id: "express-hotshot",
    title: "Express Hot-Shot Linehaul",
    category: "express",
    icon: "⚡",
    badge: "Same-Day Priority",
    leadTime: "Same-Day / Direct",
    description: "Dedicated rapid vehicle dispatch with continuous GPS telemetry stream, priority corridor routing, and no depot staging delays.",
    idealFor: "Urgent breakdown machinery parts, time-sensitive linehaul, emergency equipment",
    rateBase: "From $1,450 direct",
    defaultPriority: "Express",
    defaultGoods: "Emergency Mining Replacement Parts & Valves (2.8t)",
    defaultPickup: "Darwin Port Bulk Terminal",
    defaultDropoff: "Tennant Creek Mine Site"
  },
  {
    id: "cold-chain",
    title: "Refrigerated Cold-Chain Logistics",
    category: "coldchain",
    icon: "❄️",
    badge: "Temp-Controlled",
    leadTime: "12 – 24 Hours",
    description: "Climate-controlled linehaul with multi-temperature sensors (-20°C to +4°C) with real-time temperature telemetry feeds.",
    idealFor: "Top End fresh mangoes, chilled meat & dairy, catering supplies, perishable food",
    rateBase: "From $1,200 / load",
    defaultPriority: "Express",
    defaultGoods: "10x Palletized Chilled Mangoes (6.0t, 4°C Monitored)",
    defaultPickup: "Humpty Doo Packhouse Facility",
    defaultDropoff: "Darwin International Airport Freight"
  },
  {
    id: "heavy-oog",
    title: "Heavy Haulage & Out-of-Gauge (OOG)",
    category: "heavy",
    icon: "🏗️",
    badge: "Road Train Up to 79t",
    leadTime: "Scheduled / Custom",
    description: "Multi-combination Road Train haulage (Double/Triple) for heavy industrial machinery, drill rigs, and oversized components.",
    idealFor: "Mining excavators, slurry pumps, drill casings, structural steel beams",
    rateBase: "Custom Manifest Quote",
    defaultPriority: "Standard",
    defaultGoods: "Heavy Slurry Pump Hydraulics & Valve Spares (8.5t)",
    defaultPickup: "Darwin East Arm Logistics Hub",
    defaultDropoff: "Borroloola Mine Site Turnoff"
  },
  {
    id: "medical-dg",
    title: "Medical & Dangerous Goods (DG)",
    category: "medical",
    icon: "💉",
    badge: "Certified & Audited",
    leadTime: "Urgent Priority",
    description: "Strictly compliant cold-chain medical pharmaceuticals, hospital consumables, and accredited Dangerous Goods Class transit.",
    idealFor: "Vaccines, surgical consumables, pathology specimens, certified chemicals",
    rateBase: "From $1,100 / transit",
    defaultPriority: "Express",
    defaultGoods: "Cold-Chain Vaccines & Surgical Consumables (1.2t)",
    defaultPickup: "Royal Darwin Hospital Supply Centre",
    defaultDropoff: "Katherine District Hospital Clinic"
  },
  {
    id: "metro-port",
    title: "Metro Courier & Darwin Port Drayage",
    category: "metro",
    icon: "📦",
    badge: "Urban & Wharf",
    leadTime: "2 – 4 Hours",
    description: "Urban courier van fleet & container wharf cartage between Darwin Port East Arm wharf and Greater Darwin/Palmerston businesses.",
    idealFor: "Small parcels, urgent marine spares, container de-stuffing, inner-city freight",
    rateBase: "From $180 local",
    defaultPriority: "Express",
    defaultGoods: "Emergency Marine Vessel Propulsion Filters (0.8t)",
    defaultPickup: "Frances Bay Slipways",
    defaultDropoff: "Darwin Naval Base HMAS Coonawarra"
  }
];

// Complete 35-Vehicle Northern Territory Fleet
export let fleetDB: Vehicle[] = [
  // 1-10: Darwin Metro & Regional Linehaul
  { id: "NL-01", name: "Van #NL-01 (HiAce Courier)", type: "Courier Van (1.5t)", driver: "Liam Chen", depot: "Darwin Metro", lat: -12.4634, lng: 130.8456, status: "Delivering", speed: "42 km/h", battery: "92%", fuelLevel: "85%" },
  { id: "NL-02", name: "Van #NL-02 (Sprinter Van)", type: "Courier Van (2.0t)", driver: "Chloe Davis", depot: "Darwin Metro", lat: -12.4820, lng: 130.9120, status: "Delivering", speed: "48 km/h", battery: "88%", fuelLevel: "76%" },
  { id: "NL-03", name: "Van #NL-03 (Transit Express)", type: "Courier Van (1.8t)", driver: "Jack Robinson", depot: "Darwin Metro", lat: -12.4350, lng: 130.8640, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "94%" },
  { id: "NL-04", name: "Rigid #NL-04 (Isuzu FSR)", type: "Rigid Truck (6t)", driver: "Marcus Brody", depot: "Darwin Metro", lat: -12.4510, lng: 130.8350, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "89%" },
  { id: "NL-05", name: "Rigid #NL-05 (Hino 500)", type: "Rigid Truck (8t)", driver: "Nathan Kelly", depot: "Darwin Metro", lat: -12.4700, lng: 130.9500, status: "Delivering", speed: "55 km/h", battery: "95%", fuelLevel: "68%" },
  { id: "NL-06", name: "Rigid #NL-06 (Fuso Fighter)", type: "Rigid Truck (10t)", driver: "Samira Patel", depot: "Darwin Metro", lat: -12.4950, lng: 130.9900, status: "In Transit", speed: "62 km/h", battery: "84%", fuelLevel: "72%" },
  { id: "NL-07", name: "Rigid #NL-07 (Isuzu FTR)", type: "Rigid Truck (8t)", driver: "Tom Bradley", depot: "Darwin Metro", lat: -12.4400, lng: 130.8800, status: "Off Duty", speed: "0 km/h", battery: "100%", fuelLevel: "100%" },
  { id: "NL-08", name: "Rigid #NL-08 (Hino 500)", type: "Rigid Truck (8t)", driver: "Sarah Peterson", depot: "Darwin Metro", lat: -12.4634, lng: 130.8456, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "91%" },
  { id: "NL-09", name: "Semi #NL-09 (Freightliner)", type: "Semi-Trailer (22t)", driver: "Brett Walker", depot: "Darwin Metro", lat: -12.8500, lng: 131.0800, status: "In Transit", speed: "85 km/h", battery: "90%", fuelLevel: "64%" },
  { id: "NL-10", name: "Semi #NL-10 (Kenworth T610)", type: "Semi-Trailer (24t)", driver: "Craig Evans", depot: "Darwin Metro", lat: -13.1500, lng: 131.1200, status: "In Transit", speed: "88 km/h", battery: "92%", fuelLevel: "70%" },

  // 11-20: Katherine Corridor & Regional Linehaul
  { id: "NL-11", name: "Semi #NL-11 (Volvo FM)", type: "Semi-Trailer (24t)", driver: "Wayne Campbell", depot: "Katherine Depot", lat: -13.4800, lng: 131.4200, status: "In Transit", speed: "87 km/h", battery: "89%", fuelLevel: "58%" },
  { id: "NL-12", name: "Semi #NL-12 (Mack Anthem)", type: "Semi-Trailer (24t)", driver: "Darren Hughes", depot: "Katherine Depot", lat: -13.7500, lng: 131.7800, status: "In Transit", speed: "89 km/h", battery: "93%", fuelLevel: "82%" },
  { id: "NL-13", name: "Semi #NL-13 (Scania R540)", type: "Semi-Trailer (24t)", driver: "Aaron Scott", depot: "Katherine Depot", lat: -14.1000, lng: 132.0100, status: "In Transit", speed: "86 km/h", battery: "91%", fuelLevel: "67%" },
  { id: "NL-14", name: "Truck #NL-14 (Mack Titan)", type: "Semi-Trailer (24t)", driver: "Dave Miller", depot: "Katherine Depot", lat: -12.9540, lng: 131.7820, status: "In Transit", speed: "88 km/h", battery: "94%", fuelLevel: "74%" },
  { id: "NL-15", name: "B-Double #NL-15 (Kenworth)", type: "B-Double (40t)", driver: "Peter Jenkins", depot: "Katherine Depot", lat: -14.4652, lng: 132.2635, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "95%" },
  { id: "NL-16", name: "B-Double #NL-16 (Volvo FH16)", type: "B-Double (40t)", driver: "Greg Morris", depot: "Katherine Depot", lat: -14.5100, lng: 132.3100, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "88%" },
  { id: "NL-17", name: "Rigid #NL-17 (Hino 500)", type: "Rigid Truck (8t)", driver: "Jason Wright", depot: "Katherine Depot", lat: -14.4500, lng: 132.2500, status: "Delivering", speed: "35 km/h", battery: "96%", fuelLevel: "81%" },
  { id: "NL-18", name: "Van #NL-18 (Sprinter)", type: "Courier Van (2.0t)", driver: "Luke Green", depot: "Katherine Depot", lat: -14.4700, lng: 132.2800, status: "Delivering", speed: "40 km/h", battery: "87%", fuelLevel: "69%" },
  { id: "NL-19", name: "Road Train #NL-19 (Kenworth)", type: "Road Train (52t)", driver: "Mick O'Connor", depot: "Katherine Depot", lat: -14.9220, lng: 133.0645, status: "In Transit", speed: "90 km/h", battery: "91%", fuelLevel: "84%" },
  { id: "NL-20", name: "Road Train #NL-20 (Mack Titan)", type: "Road Train (52t)", driver: "Gavin Price", depot: "Katherine Depot", lat: -15.5760, lng: 133.2140, status: "In Transit", speed: "88 km/h", battery: "93%", fuelLevel: "79%" },

  // 21-28: Tennant Creek & Barkly Highway Corridor
  { id: "NL-21", name: "Road Train #NL-21 (Kenworth)", type: "Road Train (52t)", driver: "Barry King", depot: "Tennant Creek", lat: -16.2550, lng: 133.3680, status: "In Transit", speed: "91 km/h", battery: "89%", fuelLevel: "62%" },
  { id: "NL-22", name: "Road Train #NL-22 (Volvo FH)", type: "Road Train (52t)", driver: "Gary Adams", depot: "Tennant Creek", lat: -17.5580, lng: 133.5420, status: "In Transit", speed: "89 km/h", battery: "94%", fuelLevel: "71%" },
  { id: "NL-23", name: "Semi #NL-23 (Western Star)", type: "Semi-Trailer (24t)", driver: "Keith Phillips", depot: "Tennant Creek", lat: -19.6459, lng: 134.1915, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "90%" },
  { id: "NL-24", name: "Rigid #NL-24 (Isuzu FSR)", type: "Rigid Truck (8t)", driver: "Trevor Hall", depot: "Tennant Creek", lat: -19.6600, lng: 134.2100, status: "Delivering", speed: "45 km/h", battery: "88%", fuelLevel: "83%" },
  { id: "NL-25", name: "Road Train #NL-25 (Kenworth)", type: "Road Train (68t)", driver: "Dean Bennett", depot: "Tennant Creek", lat: -18.8500, lng: 133.9500, status: "In Transit", speed: "92 km/h", battery: "92%", fuelLevel: "77%" },
  { id: "NL-26", name: "B-Double #NL-26 (Mack)", type: "B-Double (40t)", driver: "Colin Foster", depot: "Tennant Creek", lat: -19.4500, lng: 134.1200, status: "In Transit", speed: "88 km/h", battery: "95%", fuelLevel: "85%" },
  { id: "NL-27", name: "Van #NL-27 (Transit Van)", type: "Courier Van (1.8t)", driver: "Paul Carter", depot: "Tennant Creek", lat: -19.6400, lng: 134.1800, status: "Delivering", speed: "38 km/h", battery: "84%", fuelLevel: "65%" },
  { id: "NL-28", name: "Semi #NL-28 (Scania R620)", type: "Semi-Trailer (24t)", driver: "Ross Murphy", depot: "Tennant Creek", lat: -19.6800, lng: 134.2200, status: "Off Duty", speed: "0 km/h", battery: "100%", fuelLevel: "100%" },

  // 29-35: Alice Springs & Adelaide-Darwin Linehaul Corridor
  { id: "NL-29", name: "Road Train #NL-29 (Kenworth)", type: "Triple Road Train (68t)", driver: "Ian Stewart", depot: "Alice Springs", lat: -21.5230, lng: 133.8860, status: "In Transit", speed: "93 km/h", battery: "90%", fuelLevel: "73%" },
  { id: "NL-30", name: "Road Train #NL-30 (Volvo FH16)", type: "Triple Road Train (68t)", driver: "Shane Richardson", depot: "Alice Springs", lat: -22.1300, lng: 133.4180, status: "In Transit", speed: "91 km/h", battery: "92%", fuelLevel: "80%" },
  { id: "NL-31", name: "Road Train #NL-31 (Kenworth)", type: "Triple Road Train (68t)", driver: "Mark Taylor", depot: "Alice Springs", lat: -19.6459, lng: 134.1915, status: "In Transit", speed: "92 km/h", battery: "87%", fuelLevel: "66%" },
  { id: "NL-32", name: "B-Double #NL-32 (Mack Titan)", type: "B-Double (40t)", driver: "Geoff Watson", depot: "Alice Springs", lat: -23.6980, lng: 133.8807, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "92%" },
  { id: "NL-33", name: "Rigid #NL-33 (Hino 500)", type: "Rigid Truck (10t)", driver: "Nigel Cox", depot: "Alice Springs", lat: -23.7100, lng: 133.8950, status: "Delivering", speed: "48 km/h", battery: "91%", fuelLevel: "75%" },
  { id: "NL-34", name: "Van #NL-34 (HiAce Courier)", type: "Courier Van (1.5t)", driver: "Simon Kelly", depot: "Alice Springs", lat: -23.6850, lng: 133.8720, status: "Delivering", speed: "44 km/h", battery: "89%", fuelLevel: "82%" },
  { id: "NL-35", name: "Semi #NL-35 (Kenworth T909)", type: "Semi-Trailer (24t)", driver: "Brian Palmer", depot: "Alice Springs", lat: -23.6980, lng: 133.8807, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "98%" }
];

// 10 Comprehensive Commercial NT Consignments across Lifecycle
export let jobsDB: Job[] = [
  {
    id: "TP-8842",
    customer: "Katherine Mining Supplies Ltd",
    pickup: "Darwin Depot (120 Berrimah Rd, Darwin)",
    dropoff: "Katherine Store (Lot 44 Katherine Terrace)",
    goods: "2x Heavy Mining Replacement Parts (3.4t)",
    priority: "Standard",
    driver: "Dave Miller (#DRV-104)",
    vehicle: "Truck #NL-14 (Mack Titan)",
    status: "In Transit",
    eta: "14:45 ACST",
    lat: -12.9540,
    lng: 131.7820,
    recipientName: "Sandra Wilson"
  },
  {
    id: "TP-8843",
    customer: "Berrimah Timber & Hardware",
    pickup: "Darwin Port Bulk Terminal",
    dropoff: "Palmerston Industrial Zone",
    goods: "Structural Timbers & Reinforcing Mesh (4.8t)",
    priority: "Standard",
    driver: "Sarah Peterson (#DRV-108)",
    vehicle: "Rigid #NL-08 (Hino 500)",
    status: "Assigned",
    eta: "11:30 ACST",
    lat: -12.4634,
    lng: 130.8456
  },
  {
    id: "TP-8844",
    customer: "Alice Springs Pastoral Co.",
    pickup: "Katherine Depot (Stuart Hwy)",
    dropoff: "Tennant Creek Cattle Station",
    goods: "Cattle Fencing Wire & Stock Rations (6.2t)",
    priority: "Express",
    driver: "Mark Taylor (#DRV-112)",
    vehicle: "Road Train #NL-31 (Kenworth T909)",
    status: "In Transit",
    eta: "Tomorrow 09:00 ACST",
    lat: -19.6459,
    lng: 134.1915
  },
  {
    id: "TP-8845",
    customer: "Top End Fresh Mango Export",
    pickup: "Humpty Doo Packhouse Facility",
    dropoff: "Darwin International Airport Freight",
    goods: "10x Palletized Chilled Mangoes (6.0t)",
    priority: "Express",
    driver: "Samira Patel (#DRV-106)",
    vehicle: "Rigid #NL-06 (Fuso Fighter)",
    status: "Delivered",
    eta: "Delivered 08:30 ACST",
    lat: -12.4145,
    lng: 130.8765,
    recipientName: "Arthur King",
    completedAt: "2026-09-24T08:32:00Z"
  },
  {
    id: "TP-8846",
    customer: "Territory Health & Medical Logistics",
    pickup: "Royal Darwin Hospital Supply Centre",
    dropoff: "Katherine District Hospital Clinic",
    goods: "Cold-Chain Vaccines & Surgical Consumables (1.2t)",
    priority: "Express",
    driver: "Wayne Campbell (#DRV-111)",
    vehicle: "Semi #NL-11 (Volvo FM)",
    status: "In Transit",
    eta: "13:15 ACST",
    lat: -13.4800,
    lng: 131.4200
  },
  {
    id: "TP-8847",
    customer: "McArthur River Resource Logistics",
    pickup: "Darwin East Arm Logistics Hub",
    dropoff: "Borroloola Mine Site Turnoff",
    goods: "Heavy Slurry Pump Hydraulics & Valve Spares (8.5t)",
    priority: "Standard",
    driver: "Darren Hughes (#DRV-112)",
    vehicle: "Semi #NL-12 (Mack Anthem)",
    status: "In Transit",
    eta: "17:30 ACST",
    lat: -13.7500,
    lng: 131.7800
  },
  {
    id: "TP-8848",
    customer: "Arnhem Land Community Stores",
    pickup: "Darwin Depot (120 Berrimah Rd)",
    dropoff: "Jabiru Community Distribution Point",
    goods: "Non-Perishable Food Pallets & Dry Groceries (12.0t)",
    priority: "Standard",
    driver: "Brett Walker (#DRV-109)",
    vehicle: "Semi #NL-09 (Freightliner)",
    status: "Delivered",
    eta: "Delivered 10:15 ACST",
    lat: -12.6720,
    lng: 132.8360,
    recipientName: "George Yunupingu",
    completedAt: "2026-09-24T10:18:00Z"
  },
  {
    id: "TP-8849",
    customer: "Red Centre Industrial Hardware",
    pickup: "Adelaide Linehaul Interchange",
    dropoff: "Alice Springs Industrial Hub (Smith St)",
    goods: "Heavy Generator Units & Industrial Compressors (14.2t)",
    priority: "Standard",
    driver: "Ian Stewart (#DRV-129)",
    vehicle: "Road Train #NL-29 (Kenworth)",
    status: "In Transit",
    eta: "Tonight 21:00 ACST",
    lat: -21.5230,
    lng: 133.8860
  },
  {
    id: "TP-8850",
    customer: "Darwin Harbour Marine Spares",
    pickup: "Frances Bay Slipways",
    dropoff: "Darwin Naval Base HMAS Coonawarra",
    goods: "Emergency Marine Vessel Propulsion Filters (0.8t)",
    priority: "Express",
    driver: "Liam Chen (#DRV-101)",
    vehicle: "Van #NL-01 (HiAce Courier)",
    status: "Delivered",
    eta: "Delivered 07:45 ACST",
    lat: -12.4634,
    lng: 130.8456,
    recipientName: "Lt. Cmdr. Harris",
    completedAt: "2026-09-24T07:46:12Z"
  },
  {
    id: "TP-8851",
    customer: "Barkly Regional Council Roadworks",
    pickup: "Tennant Creek Depot",
    dropoff: "Tablelands Hwy Bridge Site (Chainage 140km)",
    goods: "Bitumen Sealant Drums & Culvert Liners (16.0t)",
    priority: "Standard",
    driver: "Dean Bennett (#DRV-125)",
    vehicle: "Road Train #NL-25 (Kenworth)",
    status: "Assigned",
    eta: "Tomorrow 07:30 ACST",
    lat: -18.8500,
    lng: 133.9500
  }
];

// Realistic Tax Invoices Linked to e-POD Records
export let invoicesDB: Invoice[] = [
  {
    id: "INV-2026-8842",
    jobId: "TP-8842",
    customer: "Katherine Mining Supplies Ltd",
    issueDate: "24-Sep-2026",
    dueDate: "08-Oct-2026",
    subtotal: 1200.00,
    gst: 120.00,
    total: 1320.00,
    status: "Draft",
    recipientName: "Sandra Wilson",
    deliveryTimestamp: "24-Sep-2026 14:38:12 ACST"
  },
  {
    id: "INV-2026-8845",
    jobId: "TP-8845",
    customer: "Top End Fresh Mango Export",
    issueDate: "24-Sep-2026",
    dueDate: "08-Oct-2026",
    subtotal: 1850.00,
    gst: 185.00,
    total: 2035.00,
    status: "Issued",
    recipientName: "Arthur King",
    deliveryTimestamp: "24-Sep-2026 08:32:00 ACST"
  },
  {
    id: "INV-2026-8848",
    jobId: "TP-8848",
    customer: "Arnhem Land Community Stores",
    issueDate: "24-Sep-2026",
    dueDate: "08-Oct-2026",
    subtotal: 3400.00,
    gst: 340.00,
    total: 3740.00,
    status: "Paid",
    recipientName: "George Yunupingu",
    deliveryTimestamp: "24-Sep-2026 10:18:00 ACST"
  },
  {
    id: "INV-2026-8850",
    jobId: "TP-8850",
    customer: "Darwin Harbour Marine Spares",
    issueDate: "24-Sep-2026",
    dueDate: "08-Oct-2026",
    subtotal: 650.00,
    gst: 65.00,
    total: 715.00,
    status: "Issued",
    recipientName: "Lt. Cmdr. Harris",
    deliveryTimestamp: "24-Sep-2026 07:46:12 ACST"
  }
];

export interface CommercialClient {
  id: string;
  name: string;
  industry: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  creditTerms: string;
  creditLimit?: string;
  ytdSpend: string;
  activeOrdersCount: number;
  rating: string;
  status?: "Active" | "Credit Hold" | "Review";
  abn?: string;
  address?: string;
  contractTier: "Tier 1 Enterprise" | "Tier 2 Commercial" | "Government / Municipal";
}

export const COMMERCIAL_CLIENTS: CommercialClient[] = [
  {
    id: "CLI-01",
    name: "Katherine Mining Supplies Ltd",
    industry: "Heavy Mining & Earthmoving Spares",
    location: "Katherine Depot Corridor",
    contactPerson: "Mark Henderson (Procurement Lead)",
    phone: "+61 8 8972 1144",
    email: "m.henderson@katherinemining.com.au",
    creditTerms: "14 Days Net",
    ytdSpend: "$142,500 AUD",
    activeOrdersCount: 2,
    rating: "⭐⭐⭐⭐⭐ Top Tier",
    contractTier: "Tier 1 Enterprise"
  },
  {
    id: "CLI-02",
    name: "Red Centre Groceries",
    industry: "Supermarket & Cold-Chain Retail",
    location: "Alice Springs Terminal",
    contactPerson: "Claire Robinson (Supply Officer)",
    phone: "+61 8 8952 8821",
    email: "logistics@redcentregroceries.com.au",
    creditTerms: "30 Days Net",
    ytdSpend: "$218,000 AUD",
    activeOrdersCount: 2,
    rating: "⭐⭐⭐⭐⭐ Critical SLA",
    contractTier: "Tier 1 Enterprise"
  },
  {
    id: "CLI-03",
    name: "Top End Fresh Mango Export",
    industry: "Agricultural Cold-Chain",
    location: "Humpty Doo Packhouse",
    contactPerson: "Arthur King (Export Manager)",
    phone: "+61 8 8988 3310",
    email: "a.king@topendmangoes.com.au",
    creditTerms: "7 Days Net",
    ytdSpend: "$89,200 AUD",
    activeOrdersCount: 1,
    rating: "⭐⭐⭐⭐ Seasonal Priority",
    contractTier: "Tier 2 Commercial"
  },
  {
    id: "CLI-04",
    name: "Arnhem Land Community Stores",
    industry: "Remote Food & General Merchandise",
    location: "Jabiru / West Arnhem",
    contactPerson: "George Yunupingu (Community Officer)",
    phone: "+61 8 8979 4402",
    email: "supply@arnhemstores.org.au",
    creditTerms: "30 Days Net",
    ytdSpend: "$176,800 AUD",
    activeOrdersCount: 1,
    rating: "⭐⭐⭐⭐⭐ Essential Service",
    contractTier: "Government / Municipal"
  },
  {
    id: "CLI-05",
    name: "Darwin Harbour Marine Spares",
    industry: "Defence & Marine Engineering",
    location: "Frances Bay / HMAS Coonawarra",
    contactPerson: "Lt. Cmdr. Harris (Naval Logistics)",
    phone: "+61 8 8946 9912",
    email: "ops@darwinmarinespares.com.au",
    creditTerms: "30 Days Net",
    ytdSpend: "$94,600 AUD",
    activeOrdersCount: 1,
    rating: "⭐⭐⭐⭐⭐ Defence Accredited",
    contractTier: "Government / Municipal"
  },
  {
    id: "CLI-06",
    name: "Barkly Regional Council Roadworks",
    industry: "Civil Infrastructure & Roadworks",
    location: "Tennant Creek Hub",
    contactPerson: "Dean Bennett (Works Supervisor)",
    phone: "+61 8 8962 0000",
    email: "works@barkly.nt.gov.au",
    creditTerms: "30 Days Net",
    ytdSpend: "$134,000 AUD",
    activeOrdersCount: 1,
    rating: "⭐⭐⭐⭐ Municipal Priority",
    contractTier: "Government / Municipal"
  },
  {
    id: "CLI-07",
    name: "Berrimah Timber & Building",
    industry: "Construction & Industrial Hardware",
    location: "Darwin Berrimah Hub",
    contactPerson: "Simon Taylor (Distribution Manager)",
    phone: "+61 8 8947 5500",
    email: "dispatch@berrimahtimber.com.au",
    creditTerms: "14 Days Net",
    ytdSpend: "$112,400 AUD",
    activeOrdersCount: 1,
    rating: "⭐⭐⭐⭐ Commercial Tier",
    contractTier: "Tier 2 Commercial"
  },
  {
    id: "CLI-08",
    name: "Palmerston Cold Storage",
    industry: "Perishable Dairy & Chilled Freight",
    location: "Palmerston Industrial",
    contactPerson: "Elena Vasquez (Warehouse Lead)",
    phone: "+61 8 8932 7788",
    email: "ops@palmerstoncold.com.au",
    creditTerms: "14 Days Net",
    ytdSpend: "$76,900 AUD",
    activeOrdersCount: 1,
    rating: "⭐⭐⭐⭐ Monitored HACCP",
    contractTier: "Tier 2 Commercial"
  }
];

