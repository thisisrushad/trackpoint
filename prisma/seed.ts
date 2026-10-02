import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚛 [TrackPoint Database Seeder] Initializing seeding to MongoDB Atlas...");

  // 1. Clear existing database collections
  console.log("🧹 Clearing old collections...");
  try {
    await prisma.invoice.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.vehicle.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ Cleared previous collections.");
  } catch (err) {
    console.log("ℹ️ Initial collection clear notice:", err);
  }

  // 2. Hash default password
  const defaultPassword = await bcrypt.hash("password123", 10);

  // 3. Seed Users
  console.log("👤 Seeding User Accounts (Customer, Dispatcher, Driver personas)...");
  const users = [
    {
      email: "sandra.w@katherinemining.com.au",
      password: defaultPassword,
      name: "Sandra Wilson",
      role: "customer",
      org: "Katherine Mining Supplies Ltd"
    },
    {
      email: "mahir.sadman17@gmail.com",
      password: defaultPassword,
      name: "Mahir Sadman",
      role: "admin",
      org: "NorthLine Operations Center (S395312)"
    },
    {
      email: "dave.m@northline.com.au",
      password: defaultPassword,
      name: "Dave Miller",
      role: "driver",
      org: "NorthLine Heavy Haulage (#DRV-104)"
    },
    {
      email: "berrimah.ops@timber.com.au",
      password: defaultPassword,
      name: "Arthur King",
      role: "customer",
      org: "Berrimah Timber & Hardware"
    },
    {
      email: "dispatch@alicepastoral.com.au",
      password: defaultPassword,
      name: "Mark Taylor",
      role: "customer",
      org: "Alice Springs Pastoral Co."
    }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }
  console.log(`✅ Seeded ${users.length} user accounts.`);

  // 4. Seed 35 Fleet Vehicles
  console.log("🚛 Seeding 35 Fleet Vehicles (Darwin, Katherine, Tennant Creek, Alice Springs)...");
  const vehicles = [
    // 1-10: Darwin Metro & Regional Linehaul
    { vehicleId: "NL-01", name: "Van #NL-01 (HiAce Courier)", type: "Courier Van (1.5t)", driver: "Liam Chen", depot: "Darwin Metro", lat: -12.4634, lng: 130.8456, status: "Delivering", speed: "42 km/h", battery: "92%", fuelLevel: "85%" },
    { vehicleId: "NL-02", name: "Van #NL-02 (Sprinter Van)", type: "Courier Van (2.0t)", driver: "Chloe Davis", depot: "Darwin Metro", lat: -12.4820, lng: 130.9120, status: "Delivering", speed: "48 km/h", battery: "88%", fuelLevel: "76%" },
    { vehicleId: "NL-03", name: "Van #NL-03 (Transit Express)", type: "Courier Van (1.8t)", driver: "Jack Robinson", depot: "Darwin Metro", lat: -12.4350, lng: 130.8640, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "94%" },
    { vehicleId: "NL-04", name: "Rigid #NL-04 (Isuzu FSR)", type: "Rigid Truck (6t)", driver: "Marcus Brody", depot: "Darwin Metro", lat: -12.4510, lng: 130.8350, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "89%" },
    { vehicleId: "NL-05", name: "Rigid #NL-05 (Hino 500)", type: "Rigid Truck (8t)", driver: "Nathan Kelly", depot: "Darwin Metro", lat: -12.4700, lng: 130.9500, status: "Delivering", speed: "55 km/h", battery: "95%", fuelLevel: "68%" },
    { vehicleId: "NL-06", name: "Rigid #NL-06 (Fuso Fighter)", type: "Rigid Truck (10t)", driver: "Samira Patel", depot: "Darwin Metro", lat: -12.4950, lng: 130.9900, status: "In Transit", speed: "62 km/h", battery: "84%", fuelLevel: "72%" },
    { vehicleId: "NL-07", name: "Rigid #NL-07 (Isuzu FTR)", type: "Rigid Truck (8t)", driver: "Tom Bradley", depot: "Darwin Metro", lat: -12.4400, lng: 130.8800, status: "Off Duty", speed: "0 km/h", battery: "100%", fuelLevel: "100%" },
    { vehicleId: "NL-08", name: "Rigid #NL-08 (Hino 500)", type: "Rigid Truck (8t)", driver: "Sarah Peterson", depot: "Darwin Metro", lat: -12.4634, lng: 130.8456, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "91%" },
    { vehicleId: "NL-09", name: "Semi #NL-09 (Freightliner)", type: "Semi-Trailer (22t)", driver: "Brett Walker", depot: "Darwin Metro", lat: -12.8500, lng: 131.0800, status: "In Transit", speed: "85 km/h", battery: "90%", fuelLevel: "64%" },
    { vehicleId: "NL-10", name: "Semi #NL-10 (Kenworth T610)", type: "Semi-Trailer (24t)", driver: "Craig Evans", depot: "Darwin Metro", lat: -13.1500, lng: 131.1200, status: "In Transit", speed: "88 km/h", battery: "92%", fuelLevel: "70%" },

    // 11-20: Katherine Corridor & Regional Linehaul
    { vehicleId: "NL-11", name: "Semi #NL-11 (Volvo FM)", type: "Semi-Trailer (24t)", driver: "Wayne Campbell", depot: "Katherine Depot", lat: -13.4800, lng: 131.4200, status: "In Transit", speed: "87 km/h", battery: "89%", fuelLevel: "58%" },
    { vehicleId: "NL-12", name: "Semi #NL-12 (Mack Anthem)", type: "Semi-Trailer (24t)", driver: "Darren Hughes", depot: "Katherine Depot", lat: -13.7500, lng: 131.7800, status: "In Transit", speed: "89 km/h", battery: "93%", fuelLevel: "82%" },
    { vehicleId: "NL-13", name: "Semi #NL-13 (Scania R540)", type: "Semi-Trailer (24t)", driver: "Aaron Scott", depot: "Katherine Depot", lat: -14.1000, lng: 132.0100, status: "In Transit", speed: "86 km/h", battery: "91%", fuelLevel: "67%" },
    { vehicleId: "NL-14", name: "Truck #NL-14 (Mack Titan)", type: "Semi-Trailer (24t)", driver: "Dave Miller", depot: "Katherine Depot", lat: -12.9540, lng: 131.7820, status: "In Transit", speed: "88 km/h", battery: "94%", fuelLevel: "74%" },
    { vehicleId: "NL-15", name: "Semi #NL-15 (Kenworth K200)", type: "Semi-Trailer (24t)", driver: "Justin Young", depot: "Katherine Depot", lat: -14.4652, lng: 132.2635, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "95%" },
    { vehicleId: "NL-16", name: "Rigid #NL-16 (Isuzu FSR)", type: "Rigid Truck (8t)", driver: "Paul Jenkins", depot: "Katherine Depot", lat: -14.4500, lng: 132.2800, status: "Delivering", speed: "40 km/h", battery: "96%", fuelLevel: "81%" },
    { vehicleId: "NL-17", name: "Rigid #NL-17 (Hino 500)", type: "Rigid Truck (8t)", driver: "Gary Mitchell", depot: "Katherine Depot", lat: -14.4800, lng: 132.2400, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "88%" },
    { vehicleId: "NL-18", name: "Van #NL-18 (HiAce Courier)", type: "Courier Van (1.5t)", driver: "Luke Taylor", depot: "Katherine Depot", lat: -14.4652, lng: 132.2635, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "90%" },
    { vehicleId: "NL-19", name: "Semi #NL-19 (Volvo FH16)", type: "Semi-Trailer (24t)", driver: "Simon Reed", depot: "Katherine Depot", lat: -14.9220, lng: 133.0645, status: "In Transit", speed: "84 km/h", battery: "88%", fuelLevel: "61%" },
    { vehicleId: "NL-20", name: "Semi #NL-20 (Mack Super-Liner)", type: "Semi-Trailer (24t)", driver: "Ben Foster", depot: "Katherine Depot", lat: -15.5760, lng: 133.2140, status: "In Transit", speed: "88 km/h", battery: "91%", fuelLevel: "75%" },

    // 21-28: Tennant Creek Outback Transit Corridor
    { vehicleId: "NL-21", name: "Semi #NL-21 (Kenworth T610)", type: "Semi-Trailer (24t)", driver: "Scott Adams", depot: "Tennant Creek", lat: -16.2550, lng: 133.3680, status: "In Transit", speed: "89 km/h", battery: "85%", fuelLevel: "52%" },
    { vehicleId: "NL-22", name: "Semi #NL-22 (Western Star)", type: "Semi-Trailer (24t)", driver: "Trevor Price", depot: "Tennant Creek", lat: -17.5580, lng: 133.5420, status: "In Transit", speed: "86 km/h", battery: "89%", fuelLevel: "69%" },
    { vehicleId: "NL-23", name: "Rigid #NL-23 (Isuzu FTR)", type: "Rigid Truck (8t)", driver: "Dean Bennett", depot: "Tennant Creek", lat: -19.6459, lng: 134.1915, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "93%" },
    { vehicleId: "NL-24", name: "Road Train #NL-24 (Kenworth T909)", type: "Road Train (Triple 79t)", driver: "Clint Russell", depot: "Tennant Creek", lat: -19.6459, lng: 134.1915, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "100%" },
    { vehicleId: "NL-25", name: "Road Train #NL-25 (Mack Titan)", type: "Road Train (Double 50t)", driver: "George Harris", depot: "Tennant Creek", lat: -18.6000, lng: 133.8500, status: "In Transit", speed: "85 km/h", battery: "90%", fuelLevel: "66%" },
    { vehicleId: "NL-26", name: "Semi #NL-26 (Freightliner Cascadia)", type: "Semi-Trailer (24t)", driver: "Ross Martin", depot: "Tennant Creek", lat: -19.2000, lng: 134.0200, status: "In Transit", speed: "88 km/h", battery: "92%", fuelLevel: "71%" },
    { vehicleId: "NL-27", name: "Van #NL-27 (Sprinter 4x4)", type: "Outback Courier Van (2t)", driver: "Kyle Cooper", depot: "Tennant Creek", lat: -19.6459, lng: 134.1915, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "87%" },
    { vehicleId: "NL-28", name: "Semi #NL-28 (Volvo FH)", type: "Semi-Trailer (24t)", driver: "Shane Ward", depot: "Tennant Creek", lat: -20.5000, lng: 134.0500, status: "In Transit", speed: "87 km/h", battery: "86%", fuelLevel: "59%" },

    // 29-35: Alice Springs & Central Australia Heavy Haulage
    { vehicleId: "NL-29", name: "Road Train #NL-29 (Kenworth C509)", type: "Road Train (Triple 79t)", driver: "Ian Stewart", depot: "Alice Springs", lat: -21.5230, lng: 133.8860, status: "In Transit", speed: "83 km/h", battery: "91%", fuelLevel: "68%" },
    { vehicleId: "NL-30", name: "Road Train #NL-30 (Mack Titan)", type: "Road Train (Double 50t)", driver: "Mick Collins", depot: "Alice Springs", lat: -22.1300, lng: 133.4180, status: "In Transit", speed: "85 km/h", battery: "89%", fuelLevel: "74%" },
    { vehicleId: "NL-31", name: "Road Train #NL-31 (Kenworth T909)", type: "Road Train (Triple 79t)", driver: "Mark Taylor", depot: "Alice Springs", lat: -22.9000, lng: 133.6500, status: "In Transit", speed: "86 km/h", battery: "93%", fuelLevel: "80%" },
    { vehicleId: "NL-32", name: "Semi #NL-32 (Scania R620)", type: "Semi-Trailer (24t)", driver: "Colin Murphy", depot: "Alice Springs", lat: -23.6980, lng: 133.8807, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "92%" },
    { vehicleId: "NL-33", name: "Rigid #NL-33 (Hino 500)", type: "Rigid Truck (8t)", driver: "Alan Price", depot: "Alice Springs", lat: -23.7100, lng: 133.8700, status: "Delivering", speed: "38 km/h", battery: "94%", fuelLevel: "78%" },
    { vehicleId: "NL-34", name: "Van #NL-34 (HiAce Courier)", type: "Courier Van (1.5t)", driver: "Dan Wilson", depot: "Alice Springs", lat: -23.6980, lng: 133.8807, status: "Depot Staging", speed: "0 km/h", battery: "100%", fuelLevel: "89%" },
    { vehicleId: "NL-35", name: "Semi #NL-35 (Kenworth T909)", type: "Semi-Trailer (24t)", driver: "Brian Palmer", depot: "Alice Springs", lat: -23.6980, lng: 133.8807, status: "Loading", speed: "0 km/h", battery: "100%", fuelLevel: "98%" }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }
  console.log(`✅ Seeded ${vehicles.length} fleet heavy vehicles.`);

  // 5. Seed 10 Consignments / Jobs
  console.log("📦 Seeding 10 B2B Commercial Consignments (FR-01 to FR-11)...");
  const jobs = [
    {
      jobId: "TP-8842",
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
      jobId: "TP-8843",
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
      jobId: "TP-8844",
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
      jobId: "TP-8845",
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
      completedAt: "24-Sep-2026 08:32:00 ACST"
    },
    {
      jobId: "TP-8846",
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
      jobId: "TP-8847",
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
      jobId: "TP-8848",
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
      completedAt: "24-Sep-2026 10:18:00 ACST"
    },
    {
      jobId: "TP-8849",
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
      jobId: "TP-8850",
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
      completedAt: "24-Sep-2026 07:48:00 ACST"
    },
    {
      jobId: "TP-8851",
      customer: "Central Desert Regional Council",
      pickup: "Alice Springs Logistics Centre",
      dropoff: "Yuendumu Community Council Store",
      goods: "Water Bore Drilling Rods & Well Casings (5.5t)",
      priority: "Standard",
      driver: "Craig Evans (#DRV-110)",
      vehicle: "Semi #NL-10 (Kenworth T610)",
      status: "In Transit",
      eta: "Tomorrow 14:00 ACST",
      lat: -22.2500,
      lng: 131.7900
    }
  ];

  for (const j of jobs) {
    await prisma.job.create({ data: j });
  }
  console.log(`✅ Seeded ${jobs.length} commercial consignments.`);

  // 6. Seed 4 Invoices
  console.log("🧾 Seeding 4 Official Tax Invoices & e-POD Receipts...");
  const invoices = [
    {
      invoiceId: "INV-2026-8842",
      jobId: "TP-8842",
      customer: "Katherine Mining Supplies Ltd",
      issueDate: "24-Sep-2026",
      dueDate: "08-Oct-2026",
      subtotal: 1200.0,
      gst: 120.0,
      total: 1320.0,
      status: "Issued",
      recipientName: "Sandra Wilson",
      deliveryTimestamp: "24-Sep-2026 14:38:12 ACST"
    },
    {
      invoiceId: "INV-2026-8845",
      jobId: "TP-8845",
      customer: "Top End Fresh Mango Export",
      issueDate: "24-Sep-2026",
      dueDate: "08-Oct-2026",
      subtotal: 1850.0,
      gst: 185.0,
      total: 2035.0,
      status: "Paid",
      recipientName: "Arthur King",
      deliveryTimestamp: "24-Sep-2026 08:32:00 ACST"
    },
    {
      invoiceId: "INV-2026-8848",
      jobId: "TP-8848",
      customer: "Arnhem Land Community Stores",
      issueDate: "24-Sep-2026",
      dueDate: "08-Oct-2026",
      subtotal: 2400.0,
      gst: 240.0,
      total: 2640.0,
      status: "Paid",
      recipientName: "George Yunupingu",
      deliveryTimestamp: "24-Sep-2026 10:18:00 ACST"
    },
    {
      invoiceId: "INV-2026-8850",
      jobId: "TP-8850",
      customer: "Darwin Harbour Marine Spares",
      issueDate: "24-Sep-2026",
      dueDate: "08-Oct-2026",
      subtotal: 650.0,
      gst: 65.0,
      total: 715.0,
      status: "Paid",
      recipientName: "Lt. Cmdr. Harris",
      deliveryTimestamp: "24-Sep-2026 07:48:00 ACST"
    }
  ];

  for (const inv of invoices) {
    await prisma.invoice.create({ data: inv });
  }
  console.log(`✅ Seeded ${invoices.length} official tax invoices.`);

  console.log("🌟 [TrackPoint Database Seeder] MongoDB Atlas Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
