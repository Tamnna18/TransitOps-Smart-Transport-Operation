import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTripStore, type Trip } from "@/store/useTripStore";
import { useFleetStore } from "@/store/useFleetStore";
import { useDriverStore } from "@/store/useDriverStore";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TRIP_STATUSES } from "@/constants";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  X,
  Navigation,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Play,
  Copy,
  MapPin
} from "lucide-react";
import { toast } from "sonner";

// Zod validation schema for Trip Registry
const tripFormSchema = z.object({
  tripNumber: z.string().min(3, "Trip number is required"),
  vehicleId: z.number().min(1, "Vehicle assignment is required"),
  driverId: z.number().min(1, "Driver assignment is required"),
  origin: z.string().min(2, "Origin location is required"),
  destination: z.string().min(2, "Destination location is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  estimatedArrivalDate: z.string().min(1, "Estimated arrival date is required"),
  estimatedArrivalTime: z.string().min(1, "Estimated arrival time is required"),
  cargoType: z.string().min(1, "Cargo type is required"),
  cargoWeight: z.number().positive("Cargo weight must be positive"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  notes: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripFormSchema>;

const Dispatch: React.FC = () => {
  const { trips, filters, setFilters, addTrip, updateTrip, deleteTrip, dispatchTrip, completeTrip, cancelTrip, duplicateTrip } = useTripStore();
  const { vehicles } = useFleetStore();
  const { drivers } = useDriverStore();

  // Control Dialog and Drawer states
  const [selectedTrip, setSelectedTrip] = React.useState<Trip | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = React.useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingTripId, setEditingTripId] = React.useState<number | null>(null);
  const [activeDropdownId, setActiveDropdownId] = React.useState<number | null>(null);

  // Form Management
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      priority: "MEDIUM",
      cargoWeight: 10000,
    },
  });

  // Action Dialog Forms
  const [completeForm, setCompleteForm] = React.useState({ distanceCovered: 240, fuelUsed: 45, remarks: "Delivery on time without incidents." });
  const [cancelForm, setCancelForm] = React.useState({ cancelReason: "Weather Delay", cancelComment: "Severe snowstorm alert along route vectors." });

  const onSubmit = (data: TripFormValues) => {
    if (editingTripId) {
      updateTrip(editingTripId, data);
      toast.success("Trip details updated successfully");
    } else {
      addTrip(data);
      toast.success("Trip created and scheduled successfully");
    }
    setIsFormOpen(false);
    reset();
    setEditingTripId(null);
  };

  const handleOpenEditForm = (trip: Trip) => {
    setEditingTripId(trip.id);
    setValue("tripNumber", trip.tripNumber);
    setValue("vehicleId", trip.vehicleId);
    setValue("driverId", trip.driverId);
    setValue("origin", trip.origin);
    setValue("destination", trip.destination);
    setValue("departureDate", trip.departureDate);
    setValue("departureTime", trip.departureTime);
    setValue("estimatedArrivalDate", trip.estimatedArrivalDate);
    setValue("estimatedArrivalTime", trip.estimatedArrivalTime);
    setValue("cargoType", trip.cargoType);
    setValue("cargoWeight", trip.cargoWeight);
    setValue("priority", trip.priority);
    setValue("notes", trip.notes || "");
    setIsFormOpen(true);
    setActiveDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedTrip) {
      deleteTrip(selectedTrip.id);
      toast.success(`Trip ${selectedTrip.tripNumber} deleted`);
      setIsDeleteOpen(false);
      setSelectedTrip(null);
    }
  };

  const handleConfirmDispatch = () => {
    if (selectedTrip) {
      dispatchTrip(selectedTrip.id);
      toast.success(`Trip ${selectedTrip.tripNumber} dispatched! Driver and Vehicle statuses set to In Transit.`);
      setIsDispatchOpen(false);
      setSelectedTrip(null);
    }
  };

  const handleConfirmCompletion = () => {
    if (selectedTrip) {
      completeTrip(selectedTrip.id, {
        distanceCovered: Number(completeForm.distanceCovered),
        fuelUsed: Number(completeForm.fuelUsed),
        remarks: completeForm.remarks,
        completedTime: new Date().toISOString(),
      });
      toast.success(`Trip ${selectedTrip.tripNumber} completed! Resources returned to Active pool.`);
      setIsCompleteOpen(false);
      setSelectedTrip(null);
    }
  };

  const handleConfirmCancellation = () => {
    if (selectedTrip) {
      cancelTrip(selectedTrip.id, {
        cancelReason: cancelForm.cancelReason,
        cancelComment: cancelForm.cancelComment,
      });
      toast.success(`Trip ${selectedTrip.tripNumber} cancelled.`);
      setIsCancelOpen(false);
      setSelectedTrip(null);
    }
  };

  const handleDuplicate = (id: number) => {
    duplicateTrip(id);
    toast.success("Trip duplicated successfully");
    setActiveDropdownId(null);
  };

  // Filtered trips list
  const filteredTrips = trips.filter((t) => {
    const vehiclePlate = vehicles.find(v => v.id === t.vehicleId)?.licensePlate || "";
    const driverName = drivers.find(d => d.id === t.driverId)?.name || "";
    
    const matchSearch =
      t.tripNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      t.destination.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehiclePlate.toLowerCase().includes(filters.search.toLowerCase()) ||
      driverName.toLowerCase().includes(filters.search.toLowerCase());

    const matchStatus = filters.status === "ALL" || t.status === filters.status;
    const matchPriority = filters.priority === "ALL" || t.priority === filters.priority;
    
    return matchSearch && matchStatus && matchPriority;
  });

  // Calculate statistics
  const stats = {
    total: trips.length,
    scheduled: trips.filter(t => t.status === TRIP_STATUSES.SCHEDULED).length,
    transit: trips.filter(t => t.status === TRIP_STATUSES.IN_TRANSIT).length,
    completed: trips.filter(t => t.status === TRIP_STATUSES.COMPLETED).length,
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Dispatch Center"
        description="Schedule routes, track vehicle assignments, and monitor active transit states."
        actions={
          <Button onClick={() => { setEditingTripId(null); reset(); setIsFormOpen(true); }} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Create Trip
          </Button>
        }
      />

      {/* KPI Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Total Scheduled Routes</p>
          <h3 className="text-3xl font-extrabold mt-2">{stats.total}</h3>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Pending Dispatch</p>
          <h3 className="text-3xl font-extrabold mt-2 text-indigo-500">{stats.scheduled}</h3>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Active In-Transit</p>
          <h3 className="text-3xl font-extrabold mt-2 text-sky-500 animate-pulse">{stats.transit}</h3>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase">Completed Deliveries</p>
          <h3 className="text-3xl font-extrabold mt-2 text-emerald-500">{stats.completed}</h3>
        </div>
      </div>

      {/* Toolbar Search and Filters */}
      <Card className="border border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by trip number, destination, plate, or driver..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none w-full sm:w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value={TRIP_STATUSES.SCHEDULED}>Scheduled</option>
              <option value={TRIP_STATUSES.IN_TRANSIT}>In Transit</option>
              <option value={TRIP_STATUSES.COMPLETED}>Completed</option>
              <option value={TRIP_STATUSES.CANCELLED}>Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ priority: e.target.value })}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none w-full sm:w-36"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Trips Data Table */}
      <Card className="border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse text-left">
            <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Trip Number</th>
                <th className="px-6 py-4">Origin / Destination</th>
                <th className="px-6 py-4">Assigned Resources</th>
                <th className="px-6 py-4">Cargo details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b text-foreground">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No scheduled dispatches matching query.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => {
                  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                  const driver = drivers.find((d) => d.id === trip.driverId);
                  return (
                    <tr key={trip.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm">{trip.tripNumber}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Priority: {trip.priority}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          {trip.origin} <ArrowRight className="h-3 w-3 text-muted-foreground" /> {trip.destination}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Departs: {trip.departureDate} at {trip.departureTime}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>Plate: {vehicle?.licensePlate || "Unassigned"}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Driver: {driver?.name || "Unassigned"}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>{trip.cargoType}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{trip.cargoWeight.toLocaleString()} kg</div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveDropdownId(activeDropdownId === trip.id ? null : trip.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {activeDropdownId === trip.id && (
                          <div className="absolute right-6 mt-1 w-44 rounded-md border bg-card shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1 text-left animate-fade-in">
                            <button
                              onClick={() => { setSelectedTrip(trip); setIsDrawerOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Timeline
                            </button>
                            {trip.status === TRIP_STATUSES.SCHEDULED && (
                              <>
                                <button
                                  onClick={() => handleOpenEditForm(trip)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                  <Edit2 className="h-3.5 w-3.5" /> Edit Trip
                                </button>
                                <button
                                  onClick={() => { setSelectedTrip(trip); setIsDispatchOpen(true); setActiveDropdownId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-indigo-500 hover:bg-indigo-500/10"
                                >
                                  <Play className="h-3.5 w-3.5" /> Dispatch Trip
                                </button>
                              </>
                            )}
                            {trip.status === TRIP_STATUSES.IN_TRANSIT && (
                              <>
                                <button
                                  onClick={() => { setSelectedTrip(trip); setIsCompleteOpen(true); setActiveDropdownId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-emerald-500 hover:bg-emerald-500/10"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" /> Complete Trip
                                </button>
                                <button
                                  onClick={() => { setSelectedTrip(trip); setIsCancelOpen(true); setActiveDropdownId(null); }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" /> Cancel Trip
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDuplicate(trip.id)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Copy className="h-3.5 w-3.5" /> Duplicate Route
                            </button>
                            {trip.status === TRIP_STATUSES.SCHEDULED && (
                              <button
                                onClick={() => { setSelectedTrip(trip); setIsDeleteOpen(true); setActiveDropdownId(null); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Trip
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* TRIP SPECIFIC DETAILS DRAWER WITH TIMELINE */}
      {isDrawerOpen && selectedTrip && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-card border-l shadow-2xl z-50 flex flex-col animate-slide-in">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <CardTitle className="text-lg">Trip Ticket: {selectedTrip.tripNumber}</CardTitle>
              <CardDescription>{selectedTrip.origin} to {selectedTrip.destination}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> Route details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Departs</span>
                  <span className="font-semibold text-foreground">{selectedTrip.departureDate} at {selectedTrip.departureTime}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Est. Arrival</span>
                  <span className="font-semibold text-foreground">{selectedTrip.estimatedArrivalDate} at {selectedTrip.estimatedArrivalTime}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Cargo Specification</span>
                  <span className="font-semibold text-foreground">{selectedTrip.cargoType} ({selectedTrip.cargoWeight.toLocaleString()} kg)</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Priority</span>
                  <span className="font-semibold text-foreground">{selectedTrip.priority}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Trip Status Timeline
              </h3>
              <div className="relative border-l pl-4 ml-2 border-border space-y-5 text-xs">
                {selectedTrip.timeline.map((event, index) => (
                  <div key={index} className="relative">
                    <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-primary border border-background" />
                    <div>
                      <span className="font-semibold text-foreground">{event.status.replace(/_/g, " ")}</span>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE/EDIT TRIP DIALOG FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl border border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">
                  {editingTripId ? "Edit Dispatch Route" : "Create Trip Dispatch Ticket"}
                </CardTitle>
                <CardDescription>
                  Configure active route vectors and assign driver and vehicle resources
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="tripNumber">Trip Number</Label>
                    <Input id="tripNumber" placeholder="TO-9942" {...register("tripNumber")} />
                    {errors.tripNumber && <p className="text-xs text-destructive">{errors.tripNumber.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="priority">Priority</Label>
                    <select id="priority" {...register("priority")} className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm focus-visible:outline-none">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="vehicleId">Assign Vehicle</Label>
                    <select
                      id="vehicleId"
                      {...register("vehicleId", { valueAsNumber: true })}
                      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none"
                    >
                      <option value="0">-- Select Active Vehicle --</option>
                      {vehicles
                        .filter(v => v.status === "ACTIVE" || v.id === selectedTrip?.vehicleId)
                        .map(v => (
                          <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                        ))}
                    </select>
                    {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="driverId">Assign Driver</Label>
                    <select
                      id="driverId"
                      {...register("driverId", { valueAsNumber: true })}
                      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none"
                    >
                      <option value="0">-- Select Available Driver --</option>
                      {drivers
                        .filter(d => d.status === "AVAILABLE" || d.id === selectedTrip?.driverId)
                        .map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    {errors.driverId && <p className="text-xs text-destructive">{errors.driverId.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="origin">Origin Hub</Label>
                    <Input id="origin" placeholder="Ahmedabad Depot" {...register("origin")} />
                    {errors.origin && <p className="text-xs text-destructive">{errors.origin.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="destination">Destination Hub</Label>
                    <Input id="destination" placeholder="Pune Depot" {...register("destination")} />
                    {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="departureDate">Departure Date</Label>
                    <Input id="departureDate" type="date" {...register("departureDate")} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input id="departureTime" type="time" {...register("departureTime")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="estimatedArrivalDate">Est. Arrival Date</Label>
                    <Input id="estimatedArrivalDate" type="date" {...register("estimatedArrivalDate")} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="estimatedArrivalTime">Est. Arrival Time</Label>
                    <Input id="estimatedArrivalTime" type="time" {...register("estimatedArrivalTime")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Input id="cargoType" placeholder="Pharmaceuticals" {...register("cargoType")} />
                    {errors.cargoType && <p className="text-xs text-destructive">{errors.cargoType.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="cargoWeight">Weight (kg)</Label>
                    <Input id="cargoWeight" type="number" placeholder="12000" {...register("cargoWeight", { valueAsNumber: true })} />
                    {errors.cargoWeight && <p className="text-xs text-destructive">{errors.cargoWeight.message}</p>}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Dispatch Notes / Remarks</Label>
                  <textarea id="notes" placeholder="Specify loading dock specifications or lock keys notes." {...register("notes")} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm focus-visible:outline-none" />
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 border-t p-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTripId ? "Save Changes" : "Create Trip"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DISPATCH CONFIRMATION DIALOG */}
      {isDispatchOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader>
              <CardTitle className="text-base text-primary flex items-center gap-2">
                <Navigation className="h-5 w-5" /> Dispatch Route Confirmation
              </CardTitle>
              <CardDescription>
                Confirm immediate activation of Trip <strong>#{selectedTrip.tripNumber}</strong>?
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-2 pt-0 leading-relaxed text-muted-foreground">
              <div>
                <strong>Route:</strong> {selectedTrip.origin} to {selectedTrip.destination}
              </div>
              <div>
                <strong>Cargo:</strong> {selectedTrip.cargoType} ({selectedTrip.cargoWeight.toLocaleString()} kg)
              </div>
              <div>
                <strong>Odometer and Driver state locks will be applied.</strong>
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" size="sm" onClick={() => setIsDispatchOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleConfirmDispatch}>
                Dispatch Now
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* COMPLETE TRIP DIALOG */}
      {isCompleteOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-card shadow-2xl border border-border/60">
            <CardHeader>
              <CardTitle className="text-base text-emerald-600 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" /> Complete Trip Logs Reconcile
              </CardTitle>
              <CardDescription>
                Record closure statistics for Trip <strong>#{selectedTrip.tripNumber}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="distance">Actual Distance Covered (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={completeForm.distanceCovered}
                    onChange={(e) => setCompleteForm({ ...completeForm, distanceCovered: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="fuel">Actual Fuel Used (L)</Label>
                  <Input
                    id="fuel"
                    type="number"
                    value={completeForm.fuelUsed}
                    onChange={(e) => setCompleteForm({ ...completeForm, fuelUsed: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="remarks">Completion Notes / Auditing Remarks</Label>
                <Input
                  id="remarks"
                  value={completeForm.remarks}
                  onChange={(e) => setCompleteForm({ ...completeForm, remarks: e.target.value })}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" size="sm" onClick={() => setIsCompleteOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none" onClick={handleConfirmCompletion}>
                Complete Trip
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* CANCEL TRIP DIALOG */}
      {isCancelOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-destructive/30">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Cancel Active Route
              </CardTitle>
              <CardDescription>
                Specify cancellation reason for Trip <strong>#{selectedTrip.tripNumber}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-1.5">
                <Label htmlFor="cancelReason">Cancellation Reason Category</Label>
                <select
                  id="cancelReason"
                  value={cancelForm.cancelReason}
                  onChange={(e) => setCancelForm({ ...cancelForm, cancelReason: e.target.value })}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm focus-visible:outline-none"
                >
                  <option value="Weather Delay">Weather Delay</option>
                  <option value="Mechanical Breakdown">Mechanical Breakdown</option>
                  <option value="Driver Illness">Driver Illness</option>
                  <option value="Cargo Rejection">Cargo Rejection</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cancelComment">Detailed Comments</Label>
                <Input
                  id="cancelComment"
                  value={cancelForm.cancelComment}
                  onChange={(e) => setCancelForm({ ...cancelForm, cancelComment: e.target.value })}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" size="sm" onClick={() => setIsCancelOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmCancellation}>
                Cancel Route
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {isDeleteOpen && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border border-destructive/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                Are you absolutely sure you want to delete Trip <strong>{selectedTrip.tripNumber}</strong>? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dispatch;
