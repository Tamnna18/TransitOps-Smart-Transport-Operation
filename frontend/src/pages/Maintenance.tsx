import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFleetStore } from "@/store/useFleetStore";
import { useDriverStore } from "@/store/useDriverStore";
import {
  Wrench,
  FileCheck,
  AlertOctagon,
  ShieldAlert,
  Plus,
  X,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

// Zod schemas for validation
const workOrderSchema = z.object({
  vehicleId: z.number().min(1, "Vehicle is required"),
  serviceType: z.string().min(1, "Service type is required"),
  description: z.string().min(3, "Description is required"),
  estimatedCost: z.number().positive("Estimated cost must be positive"),
  scheduledDate: z.string().min(1, "Scheduled date is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

const dvirSchema = z.object({
  vehicleId: z.number().min(1, "Vehicle is required"),
  driverId: z.number().min(1, "Driver is required"),
  brakesPass: z.boolean(),
  lightsPass: z.boolean(),
  steeringPass: z.boolean(),
  tiresPass: z.boolean(),
  remarks: z.string().optional(),
});

const incidentSchema = z.object({
  vehicleId: z.number().min(1, "Vehicle is required"),
  driverId: z.number().min(1, "Driver is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  description: z.string().min(5, "Description is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

type WorkOrderFormValues = z.infer<typeof workOrderSchema>;
type DvirFormValues = z.infer<typeof dvirSchema>;
type IncidentFormValues = z.infer<typeof incidentSchema>;

interface WorkOrder {
  id: number;
  vehicleId: number;
  serviceType: string;
  description: string;
  estimatedCost: number;
  scheduledDate: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

interface DvirLog {
  id: number;
  vehicleId: number;
  driverId: number;
  date: string;
  status: "PASS" | "FAIL";
  remarks?: string;
}

interface IncidentLog {
  id: number;
  vehicleId: number;
  driverId: number;
  date: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  status: "UNDER_REVIEW" | "RESOLVED";
}

const Maintenance: React.FC = () => {
  const { vehicles, updateVehicle } = useFleetStore();
  const { drivers } = useDriverStore();

  const [activeTab, setActiveTab] = React.useState<"orders" | "inspections" | "incidents" | "safety">("orders");

  // Form toggle states
  const [isOrderOpen, setIsOrderOpen] = React.useState(false);
  const [isDvirOpen, setIsDvirOpen] = React.useState(false);
  const [isIncidentOpen, setIsIncidentOpen] = React.useState(false);

  // Mock list states
  const [workOrders, setWorkOrders] = React.useState<WorkOrder[]>([
    { id: 1, vehicleId: 3, serviceType: "Brake Overhaul", description: "Worn brake pads replace on rear axles", estimatedCost: 850, scheduledDate: "2026-07-14", priority: "HIGH", status: "PENDING" },
    { id: 2, vehicleId: 1, serviceType: "Engine Oil Change", description: "Periodic maintenance and oil change checks", estimatedCost: 350, scheduledDate: "2026-07-15", priority: "LOW", status: "IN_PROGRESS" },
  ]);

  const [dvirLogs, setDvirLogs] = React.useState<DvirLog[]>([
    { id: 1, vehicleId: 1, driverId: 1, date: "2026-07-12", status: "PASS", remarks: "All vectors operating within spec parameters." },
    { id: 2, vehicleId: 3, driverId: 2, date: "2026-07-11", status: "FAIL", remarks: "Rear brake indicators showing severe wear." },
  ]);

  const [incidentLogs, setIncidentLogs] = React.useState<IncidentLog[]>([
    { id: 1, vehicleId: 2, driverId: 2, date: "2026-07-08", description: "Subtle bumper scratching while backing into docks", severity: "LOW", status: "RESOLVED" }
  ]);

  // Form Hooks
  const { register: registerOrder, handleSubmit: handleOrderSubmit, reset: resetOrder, formState: { errors: orderErrors } } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      vehicleId: 0,
      serviceType: "",
      description: "",
      estimatedCost: 0,
      scheduledDate: "",
      priority: "MEDIUM",
    }
  });

  const { register: registerDvir, handleSubmit: handleDvirSubmit, reset: resetDvir } = useForm<DvirFormValues>({
    resolver: zodResolver(dvirSchema),
    defaultValues: {
      vehicleId: 0,
      driverId: 0,
      brakesPass: true,
      lightsPass: true,
      steeringPass: true,
      tiresPass: true,
      remarks: "",
    }
  });

  const { register: registerIncident, handleSubmit: handleIncidentSubmit, reset: resetIncident, formState: { errors: incidentErrors } } = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      vehicleId: 0,
      driverId: 0,
      incidentDate: "",
      description: "",
      severity: "MEDIUM",
    }
  });

  const onOrderSubmit = (data: WorkOrderFormValues) => {
    const newOrder: WorkOrder = {
      id: workOrders.length + 1,
      vehicleId: data.vehicleId,
      serviceType: data.serviceType,
      description: data.description,
      estimatedCost: data.estimatedCost,
      scheduledDate: data.scheduledDate,
      priority: data.priority,
      status: "PENDING",
    };
    setWorkOrders([...workOrders, newOrder]);
    updateVehicle(data.vehicleId, { status: "MAINTENANCE" });
    toast.success("Maintenance Work Order registered. Vehicle set to Maintenance.");
    setIsOrderOpen(false);
    resetOrder();
  };

  const onDvirSubmit = (data: DvirFormValues) => {
    const pass = data.brakesPass && data.lightsPass && data.steeringPass && data.tiresPass;
    const newLog: DvirLog = {
      id: dvirLogs.length + 1,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      date: new Date().toISOString().split("T")[0],
      status: pass ? "PASS" : "FAIL",
      remarks: data.remarks,
    };
    setDvirLogs([newLog, ...dvirLogs]);
    if (!pass) {
      updateVehicle(data.vehicleId, { status: "OUT_OF_SERVICE" });
      toast.warning("Vehicle inspection failed. Flagged Out of Service.");
    } else {
      toast.success("Safety inspection checklist submitted successfully.");
    }
    setIsDvirOpen(false);
    resetDvir();
  };

  const onIncidentSubmit = (data: IncidentFormValues) => {
    const newLog: IncidentLog = {
      id: incidentLogs.length + 1,
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      date: data.incidentDate,
      description: data.description,
      severity: data.severity,
      status: "UNDER_REVIEW",
    };
    setIncidentLogs([newLog, ...incidentLogs]);
    toast.success("Incident registered. Safety Officer review initiated.");
    setIsIncidentOpen(false);
    resetIncident();
  };

  const handleToggleOrderStatus = (id: number, status: "IN_PROGRESS" | "COMPLETED") => {
    setWorkOrders(workOrders.map(o => {
      if (o.id === id) {
        if (status === "COMPLETED") {
          updateVehicle(o.vehicleId, { status: "ACTIVE" });
        }
        return { ...o, status };
      }
      return o;
    }));
    toast.success(`Work order status updated to ${status.toLowerCase()}`);
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Safety & Maintenance Center"
        description="Monitor vehicle compliance checklists, schedule service tickets, and record incident logs."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsOrderOpen(true)} className="flex items-center gap-1.5 text-xs">
              <Plus className="h-4 w-4" /> Schedule Service
            </Button>
            <Button onClick={() => setIsDvirOpen(true)} variant="outline" className="flex items-center gap-1.5 text-xs">
              <FileCheck className="h-4 w-4" /> Submit DVIR Check
            </Button>
            <Button onClick={() => setIsIncidentOpen(true)} variant="destructive" className="flex items-center gap-1.5 text-xs">
              <ShieldAlert className="h-4 w-4" /> Log Incident
            </Button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "orders" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wrench className="h-4 w-4" /> Work Orders
        </button>
        <button
          onClick={() => setActiveTab("inspections")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "inspections" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileCheck className="h-4 w-4" /> DVIR Inspection Logs
        </button>
        <button
          onClick={() => setActiveTab("incidents")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "incidents" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <AlertOctagon className="h-4 w-4" /> Incident Reports
        </button>
        <button
          onClick={() => setActiveTab("safety")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "safety" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="h-4 w-4" /> Compliance Monitor
        </button>
      </div>

      {/* RENDER ACTIVE TAB VIEW */}
      <Card className="border border-border/50 bg-card shadow-sm overflow-hidden">
        {activeTab === "orders" && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Service Details</th>
                  <th className="px-6 py-4">Est. Cost</th>
                  <th className="px-6 py-4">Scheduled Date</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {workOrders.map((o) => {
                  const plate = vehicles.find(v => v.id === o.vehicleId)?.licensePlate || "Unknown";
                  return (
                    <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold">{plate}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm">{o.serviceType}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{o.description}</div>
                      </td>
                      <td className="px-6 py-4">${o.estimatedCost.toLocaleString()}</td>
                      <td className="px-6 py-4">{o.scheduledDate}</td>
                      <td className="px-6 py-4">{o.priority}</td>
                      <td className="px-6 py-4"><StatusBadge status={o.status} /></td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {o.status === "PENDING" && (
                          <Button size="sm" onClick={() => handleToggleOrderStatus(o.id, "IN_PROGRESS")} className="h-7 text-[10px] py-0 px-2.5">
                            Start Service
                          </Button>
                        )}
                        {o.status === "IN_PROGRESS" && (
                          <Button size="sm" onClick={() => handleToggleOrderStatus(o.id, "COMPLETED")} className="h-7 text-[10px] py-0 px-2.5 bg-emerald-600 hover:bg-emerald-700 border-none">
                            Resolve Order
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "inspections" && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Inspection Date</th>
                  <th className="px-6 py-4">Vehicle Plate</th>
                  <th className="px-6 py-4">Driver Name</th>
                  <th className="px-6 py-4">Audited Remarks</th>
                  <th className="px-6 py-4">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {dvirLogs.map((l) => {
                  const plate = vehicles.find(v => v.id === l.vehicleId)?.licensePlate || "Unknown";
                  const driverName = drivers.find(d => d.id === l.driverId)?.name || "Unknown";
                  return (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono">{l.date}</td>
                      <td className="px-6 py-4 font-bold">{plate}</td>
                      <td className="px-6 py-4">{driverName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{l.remarks || "No defects registered."}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          l.status === "PASS" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                        }`}>
                          {l.status === "PASS" ? "PASSED" : "FAILED DEFECTS"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "incidents" && (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Log Date</th>
                  <th className="px-6 py-4">Vehicle / Driver</th>
                  <th className="px-6 py-4">Incident description</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Review status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {incidentLogs.map((i) => {
                  const plate = vehicles.find(v => v.id === i.vehicleId)?.licensePlate || "Unknown";
                  const driverName = drivers.find(d => d.id === i.driverId)?.name || "Unknown";
                  return (
                    <tr key={i.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono">{i.date}</td>
                      <td className="px-6 py-4">
                        <div>Plate: {plate}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Driver: {driverName}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{i.description}</td>
                      <td className="px-6 py-4 font-semibold text-amber-500">{i.severity}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={i.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "safety" && (
          <CardContent className="p-6 space-y-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Compliance Document Monitoring Alerts</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg border border-border bg-muted/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">Upcoming CDL License Expiries</p>
                  <p className="text-muted-foreground">Driver **Vikram Singh** license CDL-8842 expires on 2026-08-01.</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-muted/20 flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">Fleet Insurance Expiries</p>
                  <p className="text-muted-foreground">Vehicle **Tata Prima** insurance certificate renewal is due in 15 days.</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* SCHEDULE SERVICE DIALOG */}
      {isOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base">Schedule Preventative Service</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsOrderOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleOrderSubmit(onOrderSubmit)}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid gap-1.5 text-xs">
                  <Label htmlFor="vehicleId">Assign Fleet Vehicle</Label>
                  <select id="vehicleId" {...registerOrder("vehicleId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                    <option value="0">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                    ))}
                  </select>
                  {orderErrors.vehicleId && <p className="text-xs text-destructive">{orderErrors.vehicleId.message}</p>}
                </div>
                <div className="grid gap-1.5 text-xs">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input id="serviceType" placeholder="Tire Rotation / Oil Change" {...registerOrder("serviceType")} />
                  {orderErrors.serviceType && <p className="text-xs text-destructive">{orderErrors.serviceType.message}</p>}
                </div>
                <div className="grid gap-1.5 text-xs">
                  <Label htmlFor="description">Defect / Work Scope Details</Label>
                  <Input id="description" placeholder="Check tire tread depth index" {...registerOrder("description")} />
                  {orderErrors.description && <p className="text-xs text-destructive">{orderErrors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5 text-xs">
                    <Label htmlFor="estimatedCost">Estimated Cost (INR )</Label>
                    <Input id="estimatedCost" type="number" placeholder="250" {...registerOrder("estimatedCost", { valueAsNumber: true })} />
                    {orderErrors.estimatedCost && <p className="text-xs text-destructive">{orderErrors.estimatedCost.message}</p>}
                  </div>
                  <div className="grid gap-1.5 text-xs">
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" {...registerOrder("priority")} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-1.5 text-xs">
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input id="scheduledDate" type="date" {...registerOrder("scheduledDate")} />
                  {orderErrors.scheduledDate && <p className="text-xs text-destructive">{orderErrors.scheduledDate.message}</p>}
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOrderOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Register</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DVIR INSPECTION CHECKLIST DIALOG */}
      {isDvirOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base">Submit Driver-Vehicle Inspection Report</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsDvirOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleDvirSubmit(onDvirSubmit)}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid gap-1.5">
                  <Label htmlFor="vehicleDvir">Vehicle Reference</Label>
                  <select id="vehicleDvir" {...registerDvir("vehicleId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                    <option value="0">-- Select Vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.licensePlate}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="driverDvir">Inspected By Driver</Label>
                  <select id="driverDvir" {...registerDvir("driverId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                    <option value="0">-- Select Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 border-t pt-3">
                  <span className="font-semibold text-muted-foreground uppercase block text-[10px] tracking-wider mb-2">Safety Checkpoints</span>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="brakes" defaultChecked {...registerDvir("brakesPass")} />
                    <Label htmlFor="brakes">Brakes & Lines function correctly</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="lights" defaultChecked {...registerDvir("lightsPass")} />
                    <Label htmlFor="lights">Lights & Indicators pass visual inspection</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="tires" defaultChecked {...registerDvir("tiresPass")} />
                    <Label htmlFor="tires">Tires tread depth & inflation pass</Label>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="remarksDvir">Defect Descriptions / Notes</Label>
                  <Input id="remarksDvir" placeholder="Describe any leaks or cosmetic scratches" {...registerDvir("remarks")} />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsDvirOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Submit Report</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* LOG INCIDENT DIALOG */}
      {isIncidentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base text-destructive flex items-center gap-1.5">
                <ShieldAlert className="h-5 w-5" /> Log Safety Incident Report
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsIncidentOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleIncidentSubmit(onIncidentSubmit)}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="vehicleIncident">Vehicle</Label>
                    <select id="vehicleIncident" {...registerIncident("vehicleId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                      <option value="0">-- Select --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.licensePlate}</option>
                      ))}
                    </select>
                    {incidentErrors.vehicleId && <p className="text-xs text-destructive">{incidentErrors.vehicleId.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="driverIncident">Driver</Label>
                    <select id="driverIncident" {...registerIncident("driverId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                      <option value="0">-- Select --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    {incidentErrors.driverId && <p className="text-xs text-destructive">{incidentErrors.driverId.message}</p>}
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="incidentDate">Incident Occurrence Date</Label>
                  <Input id="incidentDate" type="date" {...registerIncident("incidentDate")} />
                  {incidentErrors.incidentDate && <p className="text-xs text-destructive">{incidentErrors.incidentDate.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="descIncident">Incident Details / Severity Description</Label>
                  <textarea id="descIncident" placeholder="Provide accurate sequence of events." {...registerIncident("description")} className="flex min-h-[60px] rounded-md border bg-transparent px-3 py-2 focus:outline-none" />
                  {incidentErrors.description && <p className="text-xs text-destructive">{incidentErrors.description.message}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="severity">Safety Alert Level</Label>
                  <select id="severity" {...registerIncident("severity")} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                    <option value="LOW">Low (Cosmetic/Minor Delay)</option>
                    <option value="MEDIUM">Medium (Tow required/Partial Damage)</option>
                    <option value="HIGH">High (Accident/Property Loss/Injury)</option>
                  </select>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsIncidentOpen(false)}>Cancel</Button>
                <Button type="submit" variant="destructive" size="sm">Register Log</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
