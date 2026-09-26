"use client";

import React, { useState } from "react";
import { Truck, ShieldCheck, Users, Smartphone, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: "customer" | "admin" | "driver", userProfile: { name: string; org: string; email: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("sandra.wilson@katherinemining.com.au");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState<"customer" | "admin" | "driver">("customer");

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === "customer") {
      onLogin("customer", {
        name: "Sandra Wilson",
        org: "Katherine Mining Supplies Ltd",
        email: email
      });
    } else if (selectedRole === "admin") {
      onLogin("admin", {
        name: "Priya Sharma",
        org: "NorthLine Darwin Ops (Admin)",
        email: "p.sharma@northline.com.au"
      });
    } else {
      onLogin("driver", {
        name: "Dave Miller",
        org: "Truck #NL-14 (Mack Titan)",
        email: "d.miller@northline.com.au"
      });
    }
  };

  const handleQuickPersona = (role: "customer" | "admin" | "driver") => {
    if (role === "customer") {
      onLogin("customer", {
        name: "Sandra Wilson",
        org: "Katherine Mining Supplies Ltd",
        email: "sandra.w@katherinemining.com.au"
      });
    } else if (role === "admin") {
      onLogin("admin", {
        name: "Priya Sharma",
        org: "NorthLine Darwin Ops (Admin)",
        email: "p.sharma@northline.com.au"
      });
    } else {
      onLogin("driver", {
        name: "Dave Miller",
        org: "Truck #NL-14 (Mack Titan)",
        email: "d.miller@northline.com.au"
      });
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card glass-card">
        
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

        {/* Quick Persona Demo Selector (Matches Section 8.2 Personas) */}
        <div className="persona-box">
          <span className="persona-title">Select User Persona to Sign In:</span>
          <div className="persona-grid">
            
            <button
              type="button"
              className={`persona-card ${selectedRole === "customer" ? "selected" : ""}`}
              onClick={() => { setSelectedRole("customer"); handleQuickPersona("customer"); }}
            >
              <div className="persona-icon customer">
                <Users size={20} />
              </div>
              <div className="persona-details">
                <strong>Sandra Wilson</strong>
                <span>Customer (Procurement)</span>
                <small className="text-muted">Katherine Mining Supplies</small>
              </div>
              <ArrowRight size={16} className="persona-arrow" />
            </button>

            <button
              type="button"
              className={`persona-card ${selectedRole === "admin" ? "selected" : ""}`}
              onClick={() => { setSelectedRole("admin"); handleQuickPersona("admin"); }}
            >
              <div className="persona-icon admin">
                <ShieldCheck size={20} />
              </div>
              <div className="persona-details">
                <strong>Priya Sharma</strong>
                <span>Dispatcher / Admin</span>
                <small className="text-muted">NorthLine Depot Control</small>
              </div>
              <ArrowRight size={16} className="persona-arrow" />
            </button>

            <button
              type="button"
              className={`persona-card ${selectedRole === "driver" ? "selected" : ""}`}
              onClick={() => { setSelectedRole("driver"); handleQuickPersona("driver"); }}
            >
              <div className="persona-icon driver">
                <Smartphone size={20} />
              </div>
              <div className="persona-details">
                <strong>Dave Miller</strong>
                <span>Driver (Handset App)</span>
                <small className="text-muted">Mack Titan (Truck #NL-14)</small>
              </div>
              <ArrowRight size={16} className="persona-arrow" />
            </button>

          </div>
        </div>

        {/* Divider */}
        <div className="login-divider">
          <span>or sign in with credentials</span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleCustomLogin} className="form-layout">
          <div className="form-group">
            <label>Work Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              <label>Target Portal Role (NFR-06 RBAC)</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
              >
                <option value="customer">Customer Self-Service Portal (Sandra Wilson)</option>
                <option value="admin">Dispatcher & Fleet Admin Board (Priya Sharma)</option>
                <option value="driver">Driver Mobile Application (Dave Miller)</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <Lock size={16} />
            <span>Authenticate & Access Platform</span>
          </button>
        </form>

        {/* Security & Compliance Footer */}
        <div className="login-compliance-footer">
          <div className="flex-align" style={{ justifyContent: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span>Australian Privacy Principles (APP) & Corporations Act 7-Yr Compliant (CR-01, CR-04)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
