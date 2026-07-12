import React from "react";
import { useTripStore } from "@/store/useTripStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useFleetStore } from "@/store/useFleetStore";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Play,
  Truck,
  Activity,
  MapPin,
  Clock,
  ClipboardCheck,
  X
} from "lucide-react";
import { toast } from "sonner";

const ActiveTrip: React.FC = () => {
  const { user } = useAuthStore();
  const { trips, completeTrip, updateTrip } = useTripStore();
  const { vehicles } = useFleetStore();

  // Find active/assigned trip for the logged-in driver
  // Vikram Singh has driverId 3, Amit Patel has driverId 2, Rahul Sharma has driverId 1
  const driverId = user?.name === "Vikram Singh" ? 3 : user?.name === "Amit Patel" ? 2 : 1;
  const activeTrip = trips.find(t => t.driverId === driverId && (t.status === "IN_TRANSIT" || t.status === "SCHEDULED"));
  const vehicle = activeTrip ? vehicles.find(v => v.id === activeTrip.vehicleId) : null;

  // Pre-departure inspection checks
  const [inspections, setInspections] = React.useState({ brakes: false, lights: false, tires: false });

  // Complete Trip Form
  const [completeForm, setCompleteForm] = React.useState({ endingOdometer: "", fuelUsed: "", remarks: "" });
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);

  const handleStartRoute = () => {
    if (!inspections.brakes || !inspections.lights || !inspections.tires) {
      toast.warning("You must complete the safety pre-departure inspection checklist first.");
      return;
    }
    if (activeTrip) {
      updateTrip(activeTrip.id, {
        status: "IN_TRANSIT" as any,
        timeline: [
          ...activeTrip.timeline,
          {
            status: "IN_TRANSIT" as any,
            timestamp: new Date().toISOString(),
            description: "Driver departed. Route set to active transit."
          }
        ]
      });
      toast.success("Safe travels! Route marked In Transit.");
    }
  };

  const handleCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTrip) {
      completeTrip(activeTrip.id, {
        distanceCovered: 180, // Mock distance
        fuelUsed: Number(completeForm.fuelUsed) || 30,
        remarks: completeForm.remarks || "Delivered safely.",
        completedTime: new Date().toISOString(),
      });
      toast.success("Trip completed. Great job!");
      setIsCompleteOpen(false);
      setCompleteForm({ endingOdometer: "", fuelUsed: "", remarks: "" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Driver Command Portal"
        description="View your active dispatch ticket, record pre-departure inspection forms, and close out trips."
      />

      {/* Roster Overview cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 border bg-card shadow-sm flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="text-muted-foreground uppercase block font-semibold text-[10px]">Portal Session Role</span>
            <span className="font-bold text-foreground">{user?.name} (Driver)</span>
          </div>
        </Card>
        <Card className="p-4 border bg-card shadow-sm flex items-center gap-3">
          <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
          <div className="text-xs">
            <span className="text-muted-foreground uppercase block font-semibold text-[10px]">Safety Score</span>
            <span className="font-bold text-foreground">98% Compliant</span>
          </div>
        </Card>
        <Card className="p-4 border bg-card shadow-sm flex items-center gap-3">
          <Truck className="h-5 w-5 text-sky-500 shrink-0" />
          <div className="text-xs">
            <span className="text-muted-foreground uppercase block font-semibold text-[10px]">Vehicle Match</span>
            <span className="font-bold text-foreground">{vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : "Unassigned"}</span>
          </div>
        </Card>
      </div>

      {/* RENDER CURRENT ASSIGNED TRIP */}
      {activeTrip ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Trip Info Card */}
          <Card className="md:col-span-2 border border-border/50 bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-base">Current Assigned Dispatch Route</CardTitle>
                <CardDescription>Ticket Number: {activeTrip.tripNumber}</CardDescription>
              </div>
              <StatusBadge status={activeTrip.status} />
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Route vectors */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="text-xs space-y-1">
                  <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Origin Point</span>
                  <span className="font-bold text-sm text-foreground flex items-center gap-1"><MapPin className="h-4 w-4 text-muted-foreground" /> {activeTrip.origin}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-xs space-y-1 text-right">
                  <span className="text-muted-foreground font-semibold block uppercase text-[10px]">Destination Point</span>
                  <span className="font-bold text-sm text-foreground flex items-center gap-1 justify-end">{activeTrip.destination} <MapPin className="h-4 w-4 text-muted-foreground" /></span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Payload Specs</span>
                  <span className="font-semibold text-foreground">{activeTrip.cargoType} ({activeTrip.cargoWeight.toLocaleString()} kg)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Departure Time</span>
                  <span className="font-semibold text-foreground">{activeTrip.departureDate} at {activeTrip.departureTime}</span>
                </div>
              </div>

              {/* Action triggers */}
              <div className="border-t pt-4 flex gap-3">
                {activeTrip.status === "SCHEDULED" ? (
                  <Button onClick={handleStartRoute} className="flex items-center gap-1.5 text-xs">
                    <Play className="h-4 w-4" /> Start Active Route
                  </Button>
                ) : (
                  <Button onClick={() => setIsCompleteOpen(true)} className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 border-none">
                    <CheckCircle className="h-4 w-4" /> Complete Trip Delivery
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pre-Departure Checklist Panel */}
          {activeTrip.status === "SCHEDULED" && (
            <Card className="border border-border/50 bg-card shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4" /> Pre-Departure Inspections</h4>
              <p className="text-[11px] text-muted-foreground">You must physically audit the following parameters before starting the engine.</p>
              <div className="space-y-3 text-xs pt-2">
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input type="checkbox" checked={inspections.brakes} onChange={(e) => setInspections({ ...inspections, brakes: e.target.checked })} />
                  <span>Brake systems and airline hoses sound</span>
                </label>
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input type="checkbox" checked={inspections.lights} onChange={(e) => setInspections({ ...inspections, lights: e.target.checked })} />
                  <span>Headlights, tail lights, indicators operational</span>
                </label>
                <label className="flex items-center gap-2 font-medium cursor-pointer">
                  <input type="checkbox" checked={inspections.tires} onChange={(e) => setInspections({ ...inspections, tires: e.target.checked })} />
                  <span>Tire inflation pressure and lug nuts tight</span>
                </label>
              </div>
            </Card>
          )}

          {/* Timeline Panel */}
          {activeTrip.status === "IN_TRANSIT" && (
            <Card className="border border-border/50 bg-card shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-sm flex items-center gap-1.5"><Clock className="h-4 w-4" /> Trip Activity Logs</h4>
              <div className="relative border-l pl-4 ml-2 border-border space-y-4 text-[11px]">
                {activeTrip.timeline.map((event, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <span className="font-bold text-foreground block">{event.status.replace(/_/g, " ")}</span>
                      <span className="text-[9px] text-muted-foreground">{new Date(event.timestamp).toLocaleTimeString()}</span>
                      <p className="text-muted-foreground mt-0.5">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border border-border/50 bg-card shadow-sm p-8 text-center text-muted-foreground text-xs">
          No dispatch routes scheduled for your driver profile at this moment. Relax and stand by!
        </Card>
      )}

      {/* COMPLETE TRIP MODAL */}
      {isCompleteOpen && activeTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5" /> Complete Route Log Verification
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsCompleteOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCompleteSubmit}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid gap-1.5">
                  <Label htmlFor="endingOdo">Ending Odometer Reading (km)</Label>
                  <Input
                    id="endingOdo"
                    type="number"
                    required
                    value={completeForm.endingOdometer}
                    onChange={(e) => setCompleteForm({ ...completeForm, endingOdometer: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="fuelUsed">Fuel Used Volume (L)</Label>
                  <Input
                    id="fuelUsed"
                    type="number"
                    required
                    value={completeForm.fuelUsed}
                    onChange={(e) => setCompleteForm({ ...completeForm, fuelUsed: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="remarks">Arrival Comments / Remarks</Label>
                  <Input
                    id="remarks"
                    placeholder="No cargo damages. Trip completed successfully."
                    value={completeForm.remarks}
                    onChange={(e) => setCompleteForm({ ...completeForm, remarks: e.target.value })}
                  />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCompleteOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 border-none">Complete</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ActiveTrip;
