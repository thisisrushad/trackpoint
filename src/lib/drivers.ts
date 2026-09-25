export interface DriverAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleId: string;
  vehicleName: string;
  vehicleType: string;
  licenseClass: "MC" | "HC" | "HR" | "MR" | "C";
  licenseNumber: string;
  depot: string;
  status: "Active" | "On Break" | "Off Duty";
  fatigueHours: string;
  bfmCertified: boolean;
  emergencyContact: string;
  avatarBg: string;
  specialization: string;
}

export const DRIVER_ACCOUNTS: DriverAccount[] = [
  {
    id: "DRV-104",
    name: "Dave Miller",
    email: "d.miller@northline.com.au",
    phone: "+61 488 901 234",
    vehicleId: "NL-14",
    vehicleName: "Truck #NL-14 (Mack Titan)",
    vehicleType: "Semi-Trailer (24t)",
    licenseClass: "HC",
    licenseNumber: "NT-78219-HC",
    depot: "Katherine Corridor",
    status: "Active",
    fatigueHours: "5.2 / 12 hrs",
    bfmCertified: true,
    emergencyContact: "Sarah Miller (+61 488 111 222)",
    avatarBg: "linear-gradient(135deg, #10b981, #059669)",
    specialization: "Stuart Highway Heavy Linehaul & Mining Freight"
  },
  {
    id: "DRV-NL-01",
    name: "Liam Chen",
    email: "l.chen@northline.com.au",
    phone: "+61 477 234 567",
    vehicleId: "NL-01",
    vehicleName: "Van #NL-01 (HiAce Courier)",
    vehicleType: "Courier Van (1.5t)",
    licenseClass: "C",
    licenseNumber: "NT-62910-C",
    depot: "Darwin Metro & Port",
    status: "Active",
    fatigueHours: "3.5 / 10 hrs",
    bfmCertified: true,
    emergencyContact: "Mei Chen (+61 477 999 888)",
    avatarBg: "linear-gradient(135deg, #38bdf8, #0284c7)",
    specialization: "Metro Rapid Dispatch, Express Parcels & Port Staging"
  },
  {
    id: "DRV-NL-19",
    name: "Mick O'Connor",
    email: "m.oconnor@northline.com.au",
    phone: "+61 488 345 678",
    vehicleId: "NL-19",
    vehicleName: "Road Train #NL-19 (Kenworth)",
    vehicleType: "Road Train (52t)",
    licenseClass: "MC",
    licenseNumber: "NT-49102-MC",
    depot: "Katherine Depot",
    status: "Active",
    fatigueHours: "7.0 / 14 hrs",
    bfmCertified: true,
    emergencyContact: "Brenda O'Connor (+61 488 444 333)",
    avatarBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    specialization: "Double Road Train Outback Bulk Haulage"
  },
  {
    id: "DRV-NL-31",
    name: "Mark Taylor",
    email: "m.taylor@northline.com.au",
    phone: "+61 488 567 890",
    vehicleId: "NL-31",
    vehicleName: "Road Train #NL-31 (Triple Kenworth)",
    vehicleType: "Triple Road Train (68t)",
    licenseClass: "MC",
    licenseNumber: "NT-33928-MC",
    depot: "Alice Springs Hub",
    status: "On Break",
    fatigueHours: "8.5 / 14 hrs",
    bfmCertified: true,
    emergencyContact: "Kelly Taylor (+61 488 777 666)",
    avatarBg: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    specialization: "Triple Road Train Trans-Continental Heavy Haul"
  },
  {
    id: "DRV-NL-06",
    name: "Samira Patel",
    email: "s.patel@northline.com.au",
    phone: "+61 477 678 901",
    vehicleId: "NL-06",
    vehicleName: "Rigid #NL-06 (Fuso Fighter)",
    vehicleType: "Rigid Truck (10t)",
    licenseClass: "HR",
    licenseNumber: "NT-51280-HR",
    depot: "Darwin Metro",
    status: "Active",
    fatigueHours: "2.8 / 12 hrs",
    bfmCertified: true,
    emergencyContact: "Vikram Patel (+61 477 555 111)",
    avatarBg: "linear-gradient(135deg, #ec4899, #be185d)",
    specialization: "Regional Heavy Rigid Freight & Dangerous Goods"
  },
  {
    id: "DRV-NL-02",
    name: "Chloe Davis",
    email: "c.davis@northline.com.au",
    phone: "+61 477 890 123",
    vehicleId: "NL-02",
    vehicleName: "Van #NL-02 (Sprinter Van)",
    vehicleType: "Courier Van (2.0t)",
    licenseClass: "MR",
    licenseNumber: "NT-19842-MR",
    depot: "Darwin Metro",
    status: "Off Duty",
    fatigueHours: "0.0 / 10 hrs",
    bfmCertified: true,
    emergencyContact: "Danielle Davis (+61 477 222 333)",
    avatarBg: "linear-gradient(135deg, #14b8a6, #0d9488)",
    specialization: "Medical Cold-Chain & Urgent Aircraft Spares"
  }
];

const STORAGE_KEY = "trackpoint_drivers_roster";

export function loadStoredDrivers(): DriverAccount[] {
  if (typeof window === "undefined") return DRIVER_ACCOUNTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading stored drivers:", e);
  }
  return DRIVER_ACCOUNTS;
}

export function saveStoredDrivers(drivers: DriverAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drivers));
    window.dispatchEvent(new CustomEvent("trackpoint_drivers_updated", { detail: drivers }));
  } catch (e) {
    console.error("Error saving drivers:", e);
  }
}

export function getDriverByEmail(email: string): DriverAccount | undefined {
  const drivers = loadStoredDrivers();
  const clean = email.toLowerCase().trim();
  return drivers.find((d) => d.email.toLowerCase() === clean);
}

export function getDriverById(id: string): DriverAccount | undefined {
  const drivers = loadStoredDrivers();
  return drivers.find((d) => d.id === id);
}

export function getDriverByName(name: string): DriverAccount | undefined {
  const drivers = loadStoredDrivers();
  const clean = name.toLowerCase().trim();
  return drivers.find((d) => clean.includes(d.name.toLowerCase()) || d.name.toLowerCase().includes(clean));
}
