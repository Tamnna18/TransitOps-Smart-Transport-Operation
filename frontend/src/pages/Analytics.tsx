import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFleetStore } from "@/store/useFleetStore";
import { useDriverStore } from "@/store/useDriverStore";
import {
  Award,
  Wallet,
  Percent,
  Clock
} from "lucide-react";

const Analytics: React.FC = () => {
  const { vehicles } = useFleetStore();
  const { drivers } = useDriverStore();

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === "ACTIVE" || v.status === "IN_SERVICE").length;

  const fleetUtilizationRate = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;
  const averagePerformanceScore = drivers.length > 0
    ? Math.round(drivers.reduce((acc, d) => acc + (d.performanceScore || 0), 0) / drivers.length)
    : 0;

  // Mock analytics arrays
  const monthlyTrips = [
    { month: "Jan", count: 42 },
    { month: "Feb", count: 48 },
    { month: "Mar", count: 55 },
    { month: "Apr", count: 68 },
    { month: "May", count: 72 },
    { month: "Jun", count: 85 },
  ];

  const expenseCategories = [
    { category: "Fuel", percentage: 55, amount: "INR 13,718", color: "bg-primary" },
    { category: "Maintenance", percentage: 22, amount: "INR 5,487", color: "bg-amber-500" },
    { category: "Tolls & Permits", percentage: 15, amount: "INR 3,741", color: "bg-sky-500" },
    { category: "Lodging & Other", percentage: 8, amount: "INR 1,996", color: "bg-violet-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Operations Analytics"
        description="Deep dive analytical indexes on asset performance, cost allocations, and driver safety curves."
      />

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Fleet Utilization Rate"
          value={`${fleetUtilizationRate}%`}
          icon={Percent}
          trend={{ value: 5.4, isPositive: true }}
        />
        <StatsCard
          title="Avg Driver Roster Score"
          value={`${averagePerformanceScore}%`}
          icon={Award}
          description="Roster safety compliance score"
        />
        <StatsCard
          title="Average Trip Duration"
          value="4.8 Hours"
          icon={Clock}
          description="Computed from route logs"
        />
        <StatsCard
          title="Active Cost Per Mile"
          value="INR 1.84"
          icon={Wallet}
          trend={{ value: 2.1, isPositive: false }}
        />
      </div>

      {/* Custom Graphic Widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trips Chart Widget */}
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Trips Timeline</CardTitle>
            <CardDescription>Ramp capacity curves for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-end justify-around pt-6 pb-2">
            {monthlyTrips.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 w-1/8 group">
                {/* Visual Bar */}
                <div className="relative w-8 bg-primary/10 rounded-t-md h-48 flex items-end">
                  <div
                    style={{ height: `${(data.count / 100) * 100}%` }}
                    className="w-full bg-primary group-hover:bg-primary/80 rounded-t-md transition-all duration-300"
                  />
                  {/* Tooltip */}
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded shadow border border-border opacity-0 group-hover:opacity-100 transition-opacity">
                    {data.count}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Operating Expense Distribution */}
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Operating Expense Allocation</CardTitle>
            <CardDescription>Percentage distribution of total ledger expenses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {expenseCategories.map((exp, idx) => (
              <div key={idx} className="space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-foreground">{exp.category}</span>
                  <span className="text-muted-foreground">{exp.amount} ({exp.percentage}%)</span>
                </div>
                {/* Horizontal Progress Bar */}
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    style={{ width: `${exp.percentage}%` }}
                    className={`h-full rounded-full ${exp.color}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance & Safety Scores */}
      <Card className="border border-border/50 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Driver Roster Score Distribution</CardTitle>
          <CardDescription>Safety checks and route logging compliance indices</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {drivers.map((d) => (
            <div key={d.id} className="p-4 rounded-lg border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-foreground">{d.name}</span>
                <span className={`h-2 w-2 rounded-full ${d.status === "AVAILABLE" ? "bg-emerald-500" : "bg-primary"}`} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">{d.performanceScore || 85}%</span>
                <span className="text-[10px] text-muted-foreground">score</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  style={{ width: `${d.performanceScore || 85}%` }}
                  className={`h-full rounded-full ${
                    (d.performanceScore || 85) >= 90
                      ? "bg-emerald-500"
                      : (d.performanceScore || 85) >= 75
                      ? "bg-primary"
                      : "bg-destructive"
                  }`}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
