"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function FleetAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAnalyticsData(data);
      })
      .catch(console.error);
  }, []);

  const onTimeChartData = {
    labels: analyticsData?.weeklyOnTimeTrend?.labels || ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8", "Wk 9"],
    datasets: [
      {
        label: "On-Time Delivery %",
        data: analyticsData?.weeklyOnTimeTrend?.data || [88.5, 89.2, 90.0, 91.4, 91.8, 92.5, 93.1, 93.8, 94.2],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#10b981",
        pointRadius: 4
      }
    ]
  };

  const utilisationChartData = {
    labels: analyticsData?.depotUtilisation?.labels || ["Darwin Metro", "Katherine Depot", "Tennant Creek", "Alice Springs"],
    datasets: [
      {
        label: "Active Running %",
        data: analyticsData?.depotUtilisation?.active || [82, 79, 74, 78],
        backgroundColor: "#2563eb",
        borderRadius: 6
      },
      {
        label: "Idle / Loading %",
        data: analyticsData?.depotUtilisation?.idle || [18, 21, 26, 22],
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 6
      }
    ]
  };

  return (
    <div>
      {/* Top 4 KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-title">On-Time Delivery Rate (RR-01)</span>
          <div className="kpi-value text-success">{analyticsData?.kpis?.onTimeDeliveryRate || "94.2%"}</div>
          <div className="kpi-change positive">{analyticsData?.kpis?.onTimeTrendText || "▲ +3.1pp vs last month (Target: +5pp)"}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Fleet Utilisation (RR-02)</span>
          <div className="kpi-value text-primary">{analyticsData?.kpis?.fleetUtilisation || "78.6%"}</div>
          <div className="kpi-change positive">{analyticsData?.kpis?.fleetUtilisationTrendText || "▲ +5.4pp active running time"}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Delivery-to-Invoice Lag (O2)</span>
          <div className="kpi-value text-accent">{analyticsData?.kpis?.invoiceLagDays || "3.1 Days"}</div>
          <div className="kpi-change positive">{analyticsData?.kpis?.invoiceLagTrendText || "▼ -5.9 days reduced (Baseline: 9.0)"}</div>
        </div>

        <div className="kpi-card">
          <span className="kpi-title">Active Delivery Exceptions (RR-03)</span>
          <div className="kpi-value text-warning">{analyticsData?.kpis?.unresolvedExceptions || 1} Late</div>
          <div className="kpi-change neutral">0 unresolved claims</div>
        </div>
      </div>

      {/* Charts */}
      <div className="view-grid grid-2col mt-4">
        <div className="glass-card">
          <div className="card-header">
            <h3>On-Time Delivery Trend (Weekly % — RR-01)</h3>
          </div>
          <div className="chart-container">
            <Line
              data={onTimeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 85, max: 100, grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94a3b8" } },
                  x: { grid: { display: false }, ticks: { color: "#94a3b8" } }
                }
              }}
            />
          </div>
        </div>

        <div className="glass-card">
          <div className="card-header">
            <h3>Fleet Utilisation by Depot (Active vs Idle — RR-02)</h3>
          </div>
          <div className="chart-container">
            <Bar
              data={utilisationChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
                scales: {
                  y: { stacked: true, max: 100, grid: { color: "rgba(255,255,255,0.06)" }, ticks: { color: "#94a3b8" } },
                  x: { stacked: true, grid: { display: false }, ticks: { color: "#94a3b8" } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Exceptions Log Table */}
      <div className="glass-card mt-4">
        <div className="card-header flex-between">
          <div>
            <h3>Delivery Exception Log (RR-03)</h3>
            <p className="text-muted">Auto-flagged delays, detours, and delivery re-attempts</p>
          </div>
          <span className="badge-status delivered">All Clear</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Corridor / Route</th>
              <th>Vehicle & Driver</th>
              <th>Issue Type</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {(analyticsData?.exceptions || []).map((exc: any) => (
              <tr key={exc.id}>
                <td><strong>#{exc.id}</strong></td>
                <td>{exc.corridor}</td>
                <td>{exc.vehicle}</td>
                <td>{exc.issue}</td>
                <td>{exc.variance}</td>
                <td>
                  <span className={`badge-status ${exc.status === "Resolved" || exc.status === "Completed" ? "delivered" : "in-transit"}`}>
                    {exc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
