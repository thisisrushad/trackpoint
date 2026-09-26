import { prisma } from "@/lib/prisma";
import { signJWT, JWTPayload } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { getDriverByEmail, DRIVER_ACCOUNTS } from "@/lib/drivers";

// Predefined demo personas for instantaneous sign-in
export const DEMO_USERS: Record<string, JWTPayload> = {
  customer: {
    userId: "USR-001",
    email: "sandra.wilson@katherinemining.com.au",
    name: "Sandra Wilson",
    role: "customer",
    org: "Katherine Mining Supplies Ltd"
  },
  admin: {
    userId: "USR-002",
    email: "p.sharma@northline.com.au",
    name: "Priya Sharma",
    role: "admin",
    org: "NorthLine Darwin Depot Ops"
  },
  driver: {
    userId: "USR-003",
    email: "d.miller@northline.com.au",
    name: "Dave Miller",
    role: "driver",
    org: "Truck #NL-14 (Mack Titan)"
  }
};

export class AuthService {
  /**
   * Authenticate user and issue signed JWT token
   */
  async login(email: string, role?: string): Promise<{ token: string; user: JWTPayload }> {
    // If Prisma connection is active, search in DB
    try {
      if (process.env.DATABASE_URL) {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) {
          const payload: JWTPayload = {
            userId: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role as any,
            org: dbUser.org
          };
          const token = signJWT(payload);
          return { token, user: payload };
        }
      }
    } catch (e) {
      // Prisma database connection fallback
    }

    // Match or create from demo personas
    const matchedRole = (role as "customer" | "admin" | "driver") || "customer";

    if (matchedRole === "driver" || email?.includes("@northline.com.au") || role === "driver") {
      const driverAcc = (email ? getDriverByEmail(email) : undefined) || DRIVER_ACCOUNTS[0];
      const payload: JWTPayload = {
        userId: driverAcc.id,
        email: driverAcc.email,
        name: driverAcc.name,
        role: "driver",
        org: driverAcc.vehicleName
      };
      const token = signJWT(payload);
      return { token, user: payload };
    }

    const demoUser = DEMO_USERS[matchedRole] || DEMO_USERS.customer;
    const payload: JWTPayload = {
      ...demoUser,
      email: email || demoUser.email
    };

    const token = signJWT(payload);
    return { token, user: payload };
  }

  /**
   * Register a new B2B commercial customer account
   */
  async register(data: {
    name: string;
    email: string;
    companyName: string;
    password?: string;
    abn?: string;
    industry?: string;
    creditTerms?: string;
    phone?: string;
    location?: string;
  }): Promise<{ token: string; user: JWTPayload }> {
    const cleanEmail = data.email.toLowerCase().trim();
    let userId = `USR-${Math.floor(100 + Math.random() * 900)}`;

    try {
      if (process.env.DATABASE_URL) {
        const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : "demo123";
        const created = await prisma.user.create({
          data: {
            email: cleanEmail,
            password: hashedPassword,
            name: data.name,
            role: "customer",
            org: data.companyName
          }
        });
        if (created) userId = created.id;
      }
    } catch (e) {
      console.warn("Prisma registration fallback to stateless session:", e);
    }

    const payload: JWTPayload = {
      userId,
      email: cleanEmail,
      name: data.name,
      role: "customer",
      org: data.companyName
    };

    const token = signJWT(payload);
    return { token, user: payload };
  }
}

export const authService = new AuthService();
