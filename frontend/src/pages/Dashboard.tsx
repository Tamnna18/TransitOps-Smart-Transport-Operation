import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { useFleetStore } from "@/store/useFleetStore";
import { useDriverStore } from "@/store/useDriverStore";
import { VEHICLE_STATUSES, DRIVER_STATUSES } from "@/constants";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Users,
  Wrench,
  Navigation,
  Wallet,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  FileSpreadsheet,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { vehicles } = useFleetStore();
  const { drivers } = useDriverStore();

  // Dynamically compute metrics from stores to link views cohesively
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === VEHICLE_STATUSES.ACTIVE).length;
  const inServiceVehicles = vehicles.filter(v => v.status === VEHICLE_STATUSES.IN_SERVICE).length;
  const maintenanceVehicles = vehicles.filter(v => v.status === VEHICLE_STATUSES.MAINTENANCE).length;

  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === DRIVER_STATUSES.AVAILABLE).length;
  const transitDrivers = drivers.filter(d => d.status === DRIVER_STATUSES.IN_TRANSIT).length;

  const handleQuickAction = (action: string, path: string) => {
    toast.info(`Navigating to ${action}...`);
    navigate(path);
  };

  const recentActivities = [
    { id: 1, action: "Vehicle Added", desc: "Tata Prima #GJ-9942-TX registered by Safety Officer", time: "2 hours ago", icon: Truck, color: "text-blue-500 bg-blue-500/10" },
    { id: 2, action: "Driver Registered", desc: " Vikram Singh added to driver roster with CDL class A", time: "4 hours ago", icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
    { id: 3, action: "Scheduled Maintenance", desc: "Vehicle #MH-1142-FL sent to workshop for brake pads inspection", time: "1 day ago", icon: Wrench, color: "text-amber-500 bg-amber-500/10" },
    { id: 4, action: "Fuel Log Added", desc: "Driver Rahul Sharma logged 120 Gal diesel fuel purchase", time: "1 day ago", icon: Wallet, color: "text-sky-500 bg-sky-500/10" },
  ];

  const alerts = [
    { id: 1, type: "expiry", title: "Insurance Expiry Alert", desc: "BharatBenz 3528 (#MH-8853-RD) insurance policy expires in 12 days.", status: "warning" },
    { id: 2, type: "licence", title: "CDL License Expired", desc: "Driver Rohit Verma is currently suspended due to license expiry.", status: "destructive" },
    { id: 3, type: "maintenance", title: "Overdue Vehicle Inspection", desc: "Ashok Leyland 2820 (#MH-1142-FL) missed scheduled fitness checking.", status: "warning" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Smart Transport Operations Platform telemetry overview."
      />

      {/* Welcome Card banner */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950 text-white border-none shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Truck size={180} />
        </div>
        <CardHeader className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary-foreground mb-2 border border-primary/30 w-fit">
            <Zap className="h-3 w-3 fill-current" /> Active Portal: {user?.role}
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight">
            Welcome Back, {user?.name || "Operations Officer"}
          </CardTitle>
          <CardDescription className="text-slate-300 text-sm max-w-xl mt-1">
            TransitOps is managing {totalVehicles} fleet vehicles and {totalDrivers} active drivers. All safety checks and telemetry triggers are normal.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Actions Panel */}
      <Card className="border border-border/50 shadow-sm bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Launch Control</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-20 items-center justify-center text-xs"
            onClick={() => handleQuickAction("Register Vehicle", "/app/fleet?action=new")}
          >
            <PlusCircle className="h-5 w-5 text-primary" />
            <span>Register Vehicle</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-20 items-center justify-center text-xs"
            onClick={() => handleQuickAction("Register Driver", "/app/drivers?action=new")}
          >
            <PlusCircle className="h-5 w-5 text-emerald-500" />
            <span>Register Driver</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-20 items-center justify-center text-xs"
            onClick={() => handleQuickAction("Create Trip", "/app/dispatch")}
          >
            <Navigation className="h-5 w-5 text-indigo-500" />
            <span>Create Trip</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-20 items-center justify-center text-xs"
            onClick={() => handleQuickAction("Schedule Maintenance", "/app/maintenance")}
          >
            <Wrench className="h-5 w-5 text-amber-500" />
            <span>Maintenance</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-20 items-center justify-center text-xs"
            onClick={() => handleQuickAction("Add Fuel Log", "/app/expenses")}
          >
            <Wallet className="h-5 w-5 text-sky-500" />
            <span>Add Fuel Log</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col gap-2 h-20 items-center justify-center text-xs"
            onClick={() => handleQuickAction("View Reports", "/app/reports")}
          >
            <FileSpreadsheet className="h-5 w-5 text-violet-500" />
            <span>View Reports</span>
          </Button>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Registered Fleet"
          value={totalVehicles}
          icon={Truck}
          description="Operational heavy freight vehicles"
        />
        <StatsCard
          title="Fleet Utilization"
          value={`${Math.round(((availableVehicles + inServiceVehicles) / totalVehicles) * 100)}%`}
          icon={Navigation}
          trend={{ value: 4.2, isPositive: true }}
        />
        <StatsCard
          title="Drivers Active"
          value={`${transitDrivers}/${totalDrivers}`}
          icon={Users}
          description={`${availableDrivers} available for immediate trip dispatch`}
        />
        <StatsCard
          title="Fleet Under Maintenance"
          value={maintenanceVehicles}
          icon={Wrench}
          description="Vehicles disabled in repair logs"
          className={maintenanceVehicles > 0 ? "border-amber-500/30" : ""}
        />
      </div>

      {/* Detail Modules and Activity Feed Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity Timeline */}
        <Card className="md:col-span-2 border border-border/50 bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Audit Logs</CardTitle>
              <CardDescription>Tamper-proof system activity log stream</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/reports")}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative border-l pl-4 ml-2 border-border/60">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="relative group">
                    <div className={`absolute -left-[27px] top-0.5 p-1 rounded-full border bg-background ${act.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {act.action}
                        </p>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {act.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{act.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Alerts / Notifications Panel */}
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Urgent Alerts</CardTitle>
            </div>
            <CardDescription>Critical safety and compliance reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 ${
                  alert.status === "destructive"
                    ? "bg-destructive/5 border-destructive/20 text-destructive-foreground"
                    : "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-500"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{alert.title}</span>
                  <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                </div>
                <p className="text-muted-foreground font-normal leading-relaxed">{alert.desc}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
