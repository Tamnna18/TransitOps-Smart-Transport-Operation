import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MapPin, Mail, Award, Clock, AlertOctagon } from "lucide-react";

const DriverProfile: React.FC = () => {
  const { user } = useAuthStore();

  const mockDriver = {
    name: user?.name || "Vikram Singh",
    cdl: "CDL-8842-GJ",
    experience: "8 Years",
    phone: "+91 9876543210",
    email: user?.email || "bruce@transitops.com",
    address: "42 Gamma Ave, GJ 10001",
    performance: {
      score: 98,
      onTime: 96,
      inspections: 100,
    },
    emergency: {
      name: "Neha Singh",
      relationship: "Spouse",
      phone: "+91 9876543211",
    }
  };

  const tripHistory = [
    { route: "Jaipur Depot → Vadodara Hub", date: "2026-07-08", cargo: "Perishables", status: "COMPLETED" },
    { route: "Vadodara Hub → Surat Depot", date: "2026-07-05", cargo: "Chemicals", status: "COMPLETED" },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Driver Profile & Safety Performance"
        description="Verify your personal details, emergency contacts, safety ratings, and route history logs."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card & emergency details */}
        <div className="space-y-6 md:col-span-2">
          {/* Main Info */}
          <Card className="border border-border/50 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4 border-b pb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                {mockDriver.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <CardTitle className="text-base">{mockDriver.name}</CardTitle>
                <CardDescription>CDL: {mockDriver.cdl} • Experience: {mockDriver.experience}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{mockDriver.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{mockDriver.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{mockDriver.address}</span>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border border-border/50 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><AlertOctagon className="h-4 w-4 text-destructive" /> Emergency Contact Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Contact Name</span>
                <span className="font-semibold text-foreground">{mockDriver.emergency.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Relationship</span>
                <span className="font-semibold text-foreground">{mockDriver.emergency.relationship}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted-foreground">Emergency Phone</span>
                <span className="font-semibold text-foreground">{mockDriver.emergency.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Route History */}
          <Card className="border border-border/50 bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5"><Clock className="h-4 w-4 text-muted-foreground" /> Recent Trip Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tripHistory.map((trip, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 bg-muted/20 border rounded-lg">
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground block">{trip.route}</span>
                    <span className="text-[10px] text-muted-foreground block">Cargo: {trip.cargo} • Date: {trip.date}</span>
                  </div>
                  <span className="inline-flex items-center rounded px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-500">
                    {trip.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Safety Ratings Card */}
        <Card className="border border-border/50 bg-card shadow-sm p-6 flex flex-col gap-6">
          <h4 className="font-bold text-sm flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> Safety & Compliance Analytics</h4>
          
          <div className="space-y-5 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Route On-Time Rate</span>
                <span>{mockDriver.performance.onTime}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mockDriver.performance.onTime}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Inspection Pass Rate</span>
                <span>{mockDriver.performance.inspections}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${mockDriver.performance.inspections}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Total Safety Compliance</span>
                <span>{mockDriver.performance.score}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${mockDriver.performance.score}%` }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverProfile;
