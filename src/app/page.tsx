"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  ShieldCheck,
  Users,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  FileCheck,
  CreditCard,
  Zap,
  Sparkles,
  Phone,
  Mail,
  User
} from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import { DRIVER_ACCOUNTS } from "@/lib/drivers";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  // Sign In State
  const [email, setEmail] = useState("sandra.wilson@katherinemining.com.au");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<"customer" | "admin" | "driver">("customer");
  const [selectedDriverEmail, setSelectedDriverEmail] = useState("d.miller@northline.com.au");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Sign Up (Commercial Customer Onboarding) State
  const [signupForm, setSignupForm] = useState({
    companyName: "",
    abn: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    industry: "Heavy Mining & Earthmoving Spares",
    location: "Darwin Metro & Port",
    serviceTier: "Scheduled Stuart Hwy Linehaul",
    creditTerms: "14 Days Net"
  });

  const performLogin = async (role: "customer" | "admin" | "driver", userEmail: string) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, role })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("trackpoint_token", data.token);
        localStorage.setItem("trackpoint_user", JSON.stringify(data.user));

        if (role === "customer") {
          router.push("/customer");
        } else if (role === "admin") {
          router.push("/admin");
        } else if (role === "driver") {
          router.push("/driver");
        }
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch (err: any) {
      setAuthError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "driver") {
      performLogin("driver", selectedDriverEmail);
    } else {
      performLogin(selectedRole, email);
    }
  };

  // Submit Commercial Account Application (Sign Up)
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();

      if (data.success) {
        // Save user session
        localStorage.setItem("trackpoint_token", data.token);
        localStorage.setItem("trackpoint_user", JSON.stringify(data.user));

        // Save new customer into commercial clients directory
        try {
          const raw = localStorage.getItem("trackpoint_commercial_clients");
          let existing = raw ? JSON.parse(raw) : [];
          const newClient = {
            id: `CLI-0${existing.length + 1}`,
            name: signupForm.companyName,
            industry: signupForm.industry,
            location: signupForm.location,
            contactPerson: signupForm.name,
            phone: signupForm.phone || "+61 8 8984 0000",
            email: signupForm.email,
            creditTerms: signupForm.creditTerms,
            creditLimit: "$150,000 AUD",
            ytdSpend: "$0 AUD",
            activeOrdersCount: 0,
            rating: "⭐⭐⭐⭐⭐ New Enterprise Account",
            status: "Active",
            contractTier: "Tier 1 Enterprise",
            abn: signupForm.abn || "51 824 753 190"
          };
          localStorage.setItem("trackpoint_commercial_clients", JSON.stringify([newClient, ...existing]));
        } catch (e) {}

        // Direct route into the customer portal
        router.push("/customer");
      } else {
        setAuthError(data.error || "Failed to register account.");
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to submit registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientOnly>
      <div className="login-wrapper">
        <div
          className="login-card glass-card"
          style={{
            maxWidth: activeTab === "signup" ? "680px" : "560px",
            transition: "max-width 0.3s ease"
          }}
        >
          {/* Brand Header */}
          <div className="login-brand-header">
            <div className="login-brand-icon">
              <Truck size={32} />
            </div>
            <h1 className="login-title">TrackPoint</h1>
            <p className="login-subtitle">
              Fleet Dispatch, GPS Tracking & Management Platform<br />
              <strong>NorthLine Freight & Logistics (Darwin, NT)</strong>
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.5rem",
              background: "rgba(15, 23, 42, 0.7)",
              padding: "0.35rem",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "1.5rem"
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setAuthError("");
              }}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "9px",
                border: "none",
                background: activeTab === "signin" ? "rgba(56, 189, 248, 0.2)" : "transparent",
                color: activeTab === "signin" ? "#38bdf8" : "#94a3b8",
                fontWeight: activeTab === "signin" ? 800 : 600,
                fontSize: "0.86rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                transition: "all 0.2s"
              }}
            >
              <Lock size={15} />
              <span>Sign In / Demo Access</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setAuthError("");
              }}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "9px",
                border: "none",
                background: activeTab === "signup" ? "rgba(16, 185, 129, 0.2)" : "transparent",
                color: activeTab === "signup" ? "#34d399" : "#94a3b8",
                fontWeight: activeTab === "signup" ? 800 : 600,
                fontSize: "0.86rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                transition: "all 0.2s"
              }}
            >
              <Building2 size={15} />
              <span>Open Commercial Account</span>
            </button>
          </div>

          {authError && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#ef4444",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                marginBottom: "1rem",
                textAlign: "center"
              }}
            >
              ⚠️ {authError}
            </div>
          )}

          {/* ================= TAB 1: SIGN IN ================= */}
          {activeTab === "signin" && (
            <div>
              {/* 1-Click Role Login Selection */}
              <div className="persona-box">
                <span className="persona-title">Select Portal to Enter:</span>
                <div className="persona-grid">
                  
                  <button
                    type="button"
                    className={`persona-card ${selectedRole === "customer" ? "selected" : ""}`}
                    onClick={() => performLogin("customer", "sandra.wilson@katherinemining.com.au")}
                    disabled={isLoading}
                  >
                    <div className="persona-icon customer">
                      <Users size={20} />
                    </div>
                    <div className="persona-details">
                      <strong>Customer Portal</strong>
                      <span>Sandra Wilson (Procurement)</span>
                      <small className="text-muted">Katherine Mining Supplies Ltd</small>
                    </div>
                    <ArrowRight size={16} className="persona-arrow" />
                  </button>

                  <button
                    type="button"
                    className={`persona-card ${selectedRole === "admin" ? "selected" : ""}`}
                    onClick={() => performLogin("admin", "p.sharma@northline.com.au")}
                    disabled={isLoading}
                  >
                    <div className="persona-icon admin">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="persona-details">
                      <strong>Dispatcher / Admin Portal</strong>
                      <span>Priya Sharma (Operations)</span>
                      <small className="text-muted">NorthLine Depot Control Center</small>
                    </div>
                    <ArrowRight size={16} className="persona-arrow" />
                  </button>

                  <div className={`persona-card ${selectedRole === "driver" ? "selected" : ""}`} style={{ flexDirection: "column", alignItems: "stretch", gap: "0.5rem" }}>
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => performLogin("driver", selectedDriverEmail)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="persona-icon driver">
                          <Smartphone size={20} />
                        </div>
                        <div className="persona-details text-left">
                          <strong>Driver Mobile App (e-POD)</strong>
                          <span>Select Individual Driver Account:</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="persona-arrow" />
                    </div>

                    <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {DRIVER_ACCOUNTS.map((drv) => {
                        const isSelected = selectedDriverEmail === drv.email;
                        return (
                          <button
                            key={drv.id}
                            type="button"
                            onClick={() => {
                              setSelectedDriverEmail(drv.email);
                              performLogin("driver", drv.email);
                            }}
                            disabled={isLoading}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                              isSelected
                                ? "bg-emerald-500/25 border-emerald-400 text-emerald-300"
                                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                            title={`${drv.name} • ${drv.vehicleName} (${drv.depot})`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{drv.name}</span>
                            <span className="text-[10px] text-slate-400">({drv.vehicleId})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Divider */}
              <div className="login-divider">
                <span>or sign in with credentials</span>
              </div>

              {/* Standard Form */}
              <form onSubmit={handleCustomForm} className="form-layout">
                <div className="form-group">
                  <label>Work Email Address</label>
                  <input
                    type="text"
                    value={selectedRole === "driver" ? selectedDriverEmail : email}
                    onChange={(e) => {
                      if (selectedRole === "driver") {
                        setSelectedDriverEmail(e.target.value);
                      } else {
                        setEmail(e.target.value);
                      }
                    }}
                    placeholder="name@company.com.au"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Security Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ gridColumn: "span 2" }}>
                    <label>Target Role (NFR-06 RBAC)</label>
                    <select
                      value={selectedRole === "driver" ? `driver:${selectedDriverEmail}` : selectedRole}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith("driver:")) {
                          setSelectedRole("driver");
                          setSelectedDriverEmail(val.replace("driver:", ""));
                        } else {
                          setSelectedRole(val as any);
                        }
                      }}
                    >
                      <option value="customer">Customer Portal (Sandra Wilson)</option>
                      <option value="admin">Dispatcher / Admin Portal (Priya Sharma)</option>
                      <optgroup label="Driver Mobile Handset Accounts">
                        {DRIVER_ACCOUNTS.map((drv) => (
                          <option key={drv.id} value={`driver:${drv.email}`}>
                            Driver: {drv.name} ({drv.vehicleName})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  <Lock size={16} />
                  <span>{isLoading ? "Authenticating..." : "Authenticate & Open Dashboard"}</span>
                </button>
              </form>
            </div>
          )}

          {/* ================= TAB 2: OPEN COMMERCIAL ACCOUNT (SIGN UP) ================= */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  fontSize: "0.78rem",
                  color: "#e2e8f0"
                }}
              >
                <div style={{ color: "#34d399", fontWeight: 800, marginBottom: "3px", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Sparkles size={14} />
                  <span>Commercial Freight Credit Application & Instant Portal Access</span>
                </div>
                <span>
                  Register your business entity to book scheduled linehaul, express hot-shots, and reefer cargo across the Stuart Highway with customized payment terms.
                </span>
              </div>

              {/* Company Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Company / Trading Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Barkly Mining & Minerals Ltd"
                    value={signupForm.companyName}
                    onChange={(e) => setSignupForm({ ...signupForm, companyName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Australian Business Number (ABN)</label>
                  <input
                    type="text"
                    placeholder="e.g. 51 892 411 902"
                    value={signupForm.abn}
                    onChange={(e) => setSignupForm({ ...signupForm, abn: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact Person Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Primary Contact Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Corporate Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="m.vance@company.com.au"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone & Password */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Contact Phone Number</label>
                  <input
                    type="text"
                    placeholder="+61 8 8900 0000"
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Account Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Create secure password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Industry & Corridor */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Freight Industry Sector</label>
                  <select
                    value={signupForm.industry}
                    onChange={(e) => setSignupForm({ ...signupForm, industry: e.target.value })}
                  >
                    <option value="Heavy Mining & Earthmoving Spares">Heavy Mining & Earthmoving Spares</option>
                    <option value="Supermarket & Cold-Chain Retail">Supermarket & Cold-Chain Retail</option>
                    <option value="Agricultural & Pastoral Cargo">Agricultural & Pastoral Cargo</option>
                    <option value="Civil Infrastructure & Construction">Civil Infrastructure & Construction</option>
                    <option value="Medical Cold-Chain & Urgent Spares">Medical Cold-Chain & Urgent Spares</option>
                    <option value="General Commercial Freight">General Commercial Freight</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Primary Corridor Hub</label>
                  <select
                    value={signupForm.location}
                    onChange={(e) => setSignupForm({ ...signupForm, location: e.target.value })}
                  >
                    <option value="Darwin Metro & Port">Darwin Metro & Port</option>
                    <option value="Katherine Depot Corridor">Katherine Depot Corridor</option>
                    <option value="Tennant Creek Barkly Hub">Tennant Creek Barkly Hub</option>
                    <option value="Alice Springs Terminal">Alice Springs Terminal</option>
                  </select>
                </div>
              </div>

              {/* Service & Credit Terms */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Primary Service Need</label>
                  <select
                    value={signupForm.serviceTier}
                    onChange={(e) => setSignupForm({ ...signupForm, serviceTier: e.target.value })}
                  >
                    <option value="Scheduled Stuart Hwy Linehaul">Scheduled Stuart Hwy Linehaul (24–48h)</option>
                    <option value="Express Hot-Shot Linehaul">Express Hot-Shot Linehaul (Sub-16h)</option>
                    <option value="Refrigerated Cold-Chain (-20°C to +4°C)">Refrigerated Cold-Chain (-20°C to +4°C)</option>
                    <option value="Triple Road Train Bulk Haulage">Triple Road Train Bulk Haulage (68t)</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Requested Credit Terms</label>
                  <select
                    value={signupForm.creditTerms}
                    onChange={(e) => setSignupForm({ ...signupForm, creditTerms: e.target.value })}
                  >
                    <option value="14 Days Net">14 Days Net (Standard Commercial)</option>
                    <option value="30 Days Net">30 Days Net (Enterprise Tier 1)</option>
                    <option value="7 Days Net">7 Days Net (Seasonal / Accelerated)</option>
                  </select>
                </div>
              </div>

              {/* Value Highlights */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.5rem",
                  fontSize: "0.68rem",
                  color: "#94a3b8",
                  padding: "0.5rem 0",
                  textAlign: "center"
                }}
              >
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.4rem", borderRadius: "6px" }}>
                  ⚡ Auto-Dispatch &lt; 5s (FR-02)
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.4rem", borderRadius: "6px" }}>
                  🛰️ 15s GPS Stream (NFR-02)
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.4rem", borderRadius: "6px" }}>
                  📄 Instant ATO Tax Invoicing (FR-07)
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={isLoading}
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  borderColor: "#10b981",
                  padding: "0.75rem",
                  fontSize: "0.92rem",
                  fontWeight: 800
                }}
              >
                <Building2 size={18} />
                <span>{isLoading ? "Creating Account..." : "Create Account & Enter Customer Portal →"}</span>
              </button>
            </form>
          )}

          {/* Compliance Footer */}
          <div className="login-compliance-footer">
            <div className="flex-align" style={{ justifyContent: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={14} color="#10b981" />
              <span>Australian Privacy Principles (APP) & Corporations Act 7-Yr Compliant (CR-01, CR-04)</span>
            </div>
          </div>

        </div>
      </div>
    </ClientOnly>
  );
}
