export class AnalyticsService {
  async getMetrics() {
    return {
      kpis: {
        onTimeDeliveryRate: "94.2%",
        onTimeTrendText: "▲ +3.1pp vs last month (Target: +5pp)",
        fleetUtilisation: "78.6%",
        fleetUtilisationTrendText: "▲ +5.4pp active running time",
        invoiceLagDays: "3.1 Days",
        invoiceLagTrendText: "▼ -5.9 days reduced (Baseline: 9.0)",
        overtimeReduction: "$95,000 / yr saved",
        unresolvedExceptions: 1
      },
      weeklyOnTimeTrend: {
        labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8", "Wk 9"],
        data: [88.5, 89.2, 90.0, 91.4, 91.8, 92.5, 93.1, 93.8, 94.2]
      },
      depotUtilisation: {
        labels: ["Darwin Metro", "Katherine Depot", "Tennant Creek", "Alice Springs"],
        active: [82, 79, 74, 78],
        idle: [18, 21, 26, 22]
      },
      exceptions: [
        { id: "TP-8839", corridor: "Darwin Metro Same-Day", vehicle: "Van #NL-02 (Liam Chen)", issue: "Client Gate Locked", variance: "+18 mins", status: "Resolved" },
        { id: "TP-8841", corridor: "Darwin → Alice Springs", vehicle: "Road Train #NL-31 (Mark T.)", issue: "Stuart Hwy Roadwork", variance: "+35 mins", status: "In Transit" },
        { id: "TP-8830", corridor: "Darwin → Katherine", vehicle: "Truck #NL-14 (Dave M.)", issue: "Heavy Wet Weather", variance: "+12 mins", status: "Completed" }
      ]
    };
  }
}

export const analyticsService = new AnalyticsService();
