import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Download,
  Printer,
  RefreshCw,
  Search,
  Filter,
  Truck,
  Wrench,
  Wallet,
  Clock
} from "lucide-react";
import { toast } from "sonner";

interface ReportRow {
  [key: string]: string | number;
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"fleet" | "trips" | "maintenance" | "fuel" | "expenses">("fleet");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterDate, setFilterDate] = React.useState("");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRefreshing(false);
    toast.success("Report data refreshed");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = (reportName: string, headers: string[], data: ReportRow[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || "")).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transitops_${reportName}_report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded CSV for ${reportName} report`);
  };

  // Mock Report Data
  const fleetData = [
    { plate: "GJ-9942-TX", name: "Tata Prima", odometer: 142050, efficiency: "7.2 km/L", status: "Active", downtime: "2 days" },
    { plate: "MH-8853-RD", name: "BharatBenz 3528", odometer: 98120, efficiency: "7.5 km/L", status: "In Service", downtime: "0 days" },
    { plate: "MH-1142-FL", name: "Ashok Leyland 2820", odometer: 215400, efficiency: "6.8 km/L", status: "Maintenance", downtime: "5 days" },
    { plate: "GJ-5562-HD", name: "Mahindra Blazo", odometer: 54100, efficiency: "7.4 km/L", status: "Out Of Service", downtime: "12 days" },
  ];

  const tripData = [
    { id: "TO-9942", route: "Ahmedabad Hub → Surat Depot", driver: "Rahul Sharma", cargo: "Electronics", weight: "15,000 kg", status: "In Transit" },
    { id: "TO-8853", route: "Mumbai Warehouse → Ahmedabad Hub", driver: "Amit Patel", cargo: "Automotive Parts", weight: "22,000 kg", status: "Scheduled" },
    { id: "TO-4402", route: "Jaipur Depot → Vadodara Hub", driver: "Vikram Singh", cargo: "Perishables", weight: "18,500 kg", status: "Completed" },
  ];

  const maintenanceData = [
    { vehicle: "Ashok Leyland 2820", type: "Brake Overhaul", cost: 1250, technician: "Fleet Mechanic Group", date: "2026-07-08", status: "Approved" },
    { vehicle: "BharatBenz 3528", type: "Engine Oil Change", cost: 350, technician: "Jiffy Lube Fleet", date: "2026-05-18", status: "Approved" },
    { vehicle: "Mahindra Blazo", type: "Tire Replacement", cost: 980, technician: "Bridgestone Commercial", date: "2026-03-02", status: "Approved" },
  ];

  const fuelData = [
    { date: "2026-07-12", vehicle: "Tata Prima", volume: "120 Gal", cost: 456.00, location: "Love's #412, GJ", efficiency: "7.1 km/L" },
    { date: "2026-07-10", vehicle: "BharatBenz 3528", volume: "95 Gal", cost: 361.00, location: "Pilot Travel #88, MH", efficiency: "7.6 km/L" },
    { date: "2026-07-08", vehicle: "Tata Prima", volume: "115 Gal", cost: 437.00, location: "TA Center #22, MH", efficiency: "6.9 km/L" },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Reports Library"
        description="Compile operational summary logs, financial expense ledgers, and vehicle utilization records."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="flex items-center gap-1.5 text-xs">
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print Page
            </Button>
          </div>
        }
      />

      {/* Tabs list */}
      <div className="flex border-b overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("fleet")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "fleet" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="h-4 w-4" /> Fleet Utilization
        </button>
        <button
          onClick={() => setActiveTab("trips")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "trips" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="h-4 w-4" /> Operational Trips
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "maintenance" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="h-4 w-4" /> Maintenance Summary
        </button>
        <button
          onClick={() => setActiveTab("fuel")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "fuel" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wallet className="h-4 w-4" /> Fuel Consumption
        </button>
      </div>

      {/* Filters Toolbar */}
      <Card className="border border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports parameters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-9 text-xs focus-visible:outline-none w-full md:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tables based on tabs */}
      <Card className="border border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-base">Consolidated Metrics Table</CardTitle>
            <CardDescription>Filtered operational log reports</CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (activeTab === "fleet") handleDownloadCSV("fleet_utilization", ["plate", "name", "odometer", "efficiency", "status", "downtime"], fleetData);
              if (activeTab === "trips") handleDownloadCSV("trips_summary", ["id", "route", "driver", "cargo", "weight", "status"], tripData);
              if (activeTab === "maintenance") handleDownloadCSV("maintenance_summary", ["vehicle", "type", "cost", "technician", "date", "status"], maintenanceData);
              if (activeTab === "fuel") handleDownloadCSV("fuel_consumption", ["date", "vehicle", "volume", "cost", "location", "efficiency"], fuelData);
            }}
            className="flex items-center gap-1.5 text-xs h-8"
          >
            <Download className="h-3.5 w-3.5" /> Download CSV
          </Button>
        </CardHeader>

        <div className="overflow-x-auto w-full">
          {activeTab === "fleet" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">License Plate</th>
                  <th className="px-6 py-4">Vehicle Name</th>
                  <th className="px-6 py-4">Current Odometer</th>
                  <th className="px-6 py-4">Fuel Efficiency</th>
                  <th className="px-6 py-4">Downtime Index</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {fleetData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono">{row.plate}</td>
                    <td className="px-6 py-4">{row.name}</td>
                    <td className="px-6 py-4">{row.odometer.toLocaleString()} km</td>
                    <td className="px-6 py-4">{row.efficiency}</td>
                    <td className="px-6 py-4 text-amber-500">{row.downtime}</td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "trips" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Trip ID</th>
                  <th className="px-6 py-4">Route Info</th>
                  <th className="px-6 py-4">Assigned Driver</th>
                  <th className="px-6 py-4">Cargo Specification</th>
                  <th className="px-6 py-4">Payload Weight</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {tripData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{row.id}</td>
                    <td className="px-6 py-4">{row.route}</td>
                    <td className="px-6 py-4">{row.driver}</td>
                    <td className="px-6 py-4">{row.cargo}</td>
                    <td className="px-6 py-4">{row.weight}</td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "maintenance" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Vehicle Details</th>
                  <th className="px-6 py-4">Repair Type</th>
                  <th className="px-6 py-4">Invoice Cost</th>
                  <th className="px-6 py-4">Service Center</th>
                  <th className="px-6 py-4">Completion Date</th>
                  <th className="px-6 py-4">Approval status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {maintenanceData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-semibold">{row.vehicle}</td>
                    <td className="px-6 py-4">{row.type}</td>
                    <td className="px-6 py-4">${row.cost.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.technician}</td>
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "fuel" && (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Log Date</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Volume filled</th>
                  <th className="px-6 py-4">Total Cost</th>
                  <th className="px-6 py-4">Purchase Location</th>
                  <th className="px-6 py-4">Fuel Economy</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {fuelData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono">{row.date}</td>
                    <td className="px-6 py-4 font-semibold">{row.vehicle}</td>
                    <td className="px-6 py-4">{row.volume}</td>
                    <td className="px-6 py-4">${row.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.location}</td>
                    <td className="px-6 py-4">{row.efficiency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
