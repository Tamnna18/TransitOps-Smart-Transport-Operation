import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFleetStore, type Vehicle } from "@/store/useFleetStore";
import { useDriverStore } from "@/store/useDriverStore";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { VEHICLE_STATUSES } from "@/constants";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  X,
  FileText,
  Calendar,
  Layers,
  Scale
} from "lucide-react";
import { toast } from "sonner";

// Zod schema for vehicle registration validation
const vehicleFormSchema = z.object({
  vin: z.string().min(10, "VIN must be at least 10 characters"),
  licensePlate: z.string().min(3, "License plate is required"),
  name: z.string().min(2, "Vehicle name is required"),
  make: z.string().min(2, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1, "Invalid year"),
  capacity: z.number().positive("Capacity must be positive"),
  fuelType: z.string().min(1, "Fuel type is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  insuranceExpiry: z.string().min(1, "Insurance expiry is required"),
  fitnessExpiry: z.string().min(1, "Fitness checking expiry is required"),
  permitExpiry: z.string().min(1, "Permit expiry is required"),
  status: z.string(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

const Fleet: React.FC = () => {
  const { vehicles, filters, setFilters, addVehicle, updateVehicle, deleteVehicle } = useFleetStore();
  const { drivers } = useDriverStore();

  // Dialog and drawer visibility states
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingVehicleId, setEditingVehicleId] = React.useState<number | null>(null);
  const [activeDropdownId, setActiveDropdownId] = React.useState<number | null>(null);

  // Form management
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      status: VEHICLE_STATUSES.ACTIVE,
      fuelType: "Diesel",
      vin: "",
      licensePlate: "",
      name: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      capacity: 45000,
      purchaseDate: new Date().toISOString().split("T")[0],
      insuranceExpiry: "",
      fitnessExpiry: "",
      permitExpiry: "",
    },
  });

  const onSubmit = (data: VehicleFormValues) => {
    if (editingVehicleId) {
      updateVehicle(editingVehicleId, data as any);
      toast.success("Vehicle updated successfully");
    } else {
      addVehicle(data as any);
      toast.success("Vehicle registered successfully");
    }
    setIsFormOpen(false);
    reset();
    setEditingVehicleId(null);
  };

  const handleOpenEditForm = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setValue("vin", vehicle.vin);
    setValue("licensePlate", vehicle.licensePlate);
    setValue("name", vehicle.name);
    setValue("make", vehicle.make);
    setValue("model", vehicle.model);
    setValue("year", vehicle.year);
    setValue("capacity", vehicle.capacity);
    setValue("fuelType", vehicle.fuelType);
    setValue("purchaseDate", vehicle.purchaseDate);
    setValue("insuranceExpiry", vehicle.insuranceExpiry);
    setValue("fitnessExpiry", vehicle.fitnessExpiry);
    setValue("permitExpiry", vehicle.permitExpiry);
    setValue("status", vehicle.status);
    setIsFormOpen(true);
    setActiveDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedVehicle) {
      deleteVehicle(selectedVehicle.id);
      toast.success(`Vehicle ${selectedVehicle.licensePlate} deleted`);
      setIsDeleteOpen(false);
      setSelectedVehicle(null);
    }
  };

  const handleAssignDriver = (driverId: number | undefined) => {
    if (selectedVehicle) {
      updateVehicle(selectedVehicle.id, { driverId });
      toast.success(driverId ? "Driver assigned successfully" : "Driver unassigned");
      setIsAssignOpen(false);
      setSelectedVehicle(null);
    }
  };

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.licensePlate.toLowerCase().includes(filters.search.toLowerCase()) ||
      v.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      v.model.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === "ALL" || v.status === filters.status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Fleet Registry"
        description="Central repository managing active freight vehicles and tracking compliance certificates."
        actions={
          <Button onClick={() => { setEditingVehicleId(null); reset(); setIsFormOpen(true); }} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Register Vehicle
          </Button>
        }
      />

      {/* Toolbar Search and Filters */}
      <Card className="border border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by license plate, name or model..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full md:w-44"
            >
              <option value="ALL">All Statuses</option>
              <option value={VEHICLE_STATUSES.ACTIVE}>Active</option>
              <option value={VEHICLE_STATUSES.IN_SERVICE}>In Service</option>
              <option value={VEHICLE_STATUSES.MAINTENANCE}>Maintenance</option>
              <option value={VEHICLE_STATUSES.OUT_OF_SERVICE}>Out Of Service</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Fleet Table and Grid */}
      <Card className="border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse text-left">
            <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Vehicle Specs</th>
                <th className="px-6 py-4">License Plate</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Odometer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b text-foreground">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No vehicles found match your criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const driverName = drivers.find((d) => d.id === vehicle.driverId)?.name || "Unassigned";
                  return (
                    <tr key={vehicle.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm">{vehicle.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-xs">{vehicle.licensePlate}</td>
                      <td className="px-6 py-4 text-xs font-medium">{vehicle.capacity.toLocaleString()} lbs</td>
                      <td className="px-6 py-4 text-xs font-mono">{vehicle.currentOdometer.toLocaleString()} mi</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${vehicle.driverId ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                          {driverName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveDropdownId(activeDropdownId === vehicle.id ? null : vehicle.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {activeDropdownId === vehicle.id && (
                          <div className="absolute right-6 mt-1 w-44 rounded-md border bg-card shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1 text-left animate-fade-in">
                            <button
                              onClick={() => { setSelectedVehicle(vehicle); setIsDrawerOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Details
                            </button>
                            <button
                              onClick={() => handleOpenEditForm(vehicle)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit Specs
                            </button>
                            <button
                              onClick={() => { setSelectedVehicle(vehicle); setIsAssignOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Assign Driver
                            </button>
                            <button
                              onClick={() => { setSelectedVehicle(vehicle); setIsDeleteOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete Vehicle
                            </button>
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

      {/* VEHICLE SPEC DETAILS DRAWER */}
      {isDrawerOpen && selectedVehicle && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-card border-l shadow-2xl z-50 flex flex-col animate-slide-in">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <CardTitle className="text-lg">{selectedVehicle.name}</CardTitle>
              <CardDescription>{selectedVehicle.licensePlate}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="h-4 w-4" /> Specs Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">VIN</span>
                  <span className="font-semibold text-foreground font-mono">{selectedVehicle.vin}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Make & Model</span>
                  <span className="font-semibold text-foreground">{selectedVehicle.make} {selectedVehicle.model}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Year</span>
                  <span className="font-semibold text-foreground">{selectedVehicle.year}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Capacity</span>
                  <span className="font-semibold text-foreground flex items-center gap-1"><Scale className="h-3.5 w-3.5" /> {selectedVehicle.capacity.toLocaleString()} lbs</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Fuel Type</span>
                  <span className="font-semibold text-foreground">{selectedVehicle.fuelType}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Compliance Certificates
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Insurance Expiry</span>
                  <span className="font-medium text-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedVehicle.insuranceExpiry}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Fitness Expiry</span>
                  <span className="font-medium text-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedVehicle.fitnessExpiry}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Permit Expiry</span>
                  <span className="font-medium text-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedVehicle.permitExpiry}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT VEHICLE REGISTRATION FORM DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl border border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">
                  {editingVehicleId ? "Edit Vehicle Specs" : "Register Fleet Vehicle"}
                </CardTitle>
                <CardDescription>
                  Enter official telematics details and compliance checks
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
                    <Label htmlFor="licensePlate">Registration Number</Label>
                    <Input id="licensePlate" placeholder="NY-9942-TX" {...register("licensePlate")} />
                    {errors.licensePlate && <p className="text-xs text-destructive">{errors.licensePlate.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="name">Vehicle Name</Label>
                    <Input id="name" placeholder="Freightliner Cascadia" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                  <Input id="vin" placeholder="1FM5K8HC1KGD9942" {...register("vin")} />
                  {errors.vin && <p className="text-xs text-destructive">{errors.vin.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="make">Manufacturer</Label>
                    <Input id="make" placeholder="Volvo" {...register("make")} />
                    {errors.make && <p className="text-xs text-destructive">{errors.make.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="VNL 860" {...register("model")} />
                    {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" type="number" placeholder="2022" {...register("year", { valueAsNumber: true })} />
                    {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="capacity">Capacity (lbs)</Label>
                    <Input id="capacity" type="number" placeholder="45000" {...register("capacity", { valueAsNumber: true })} />
                    {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <select
                      id="fuelType"
                      {...register("fuelType")}
                      className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none"
                    >
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Gasoline">Gasoline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="status">Current Status</Label>
                    <select id="status" {...register("status")} className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none">
                      <option value={VEHICLE_STATUSES.ACTIVE}>Active</option>
                      <option value={VEHICLE_STATUSES.IN_SERVICE}>In Service</option>
                      <option value={VEHICLE_STATUSES.MAINTENANCE}>Maintenance</option>
                      <option value={VEHICLE_STATUSES.OUT_OF_SERVICE}>Out of Service</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compliance Dates</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                      <Input id="insuranceExpiry" type="date" {...register("insuranceExpiry")} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="fitnessExpiry">Fitness Expiry</Label>
                      <Input id="fitnessExpiry" type="date" {...register("fitnessExpiry")} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="permitExpiry">Permit Expiry</Label>
                      <Input id="permitExpiry" type="date" {...register("permitExpiry")} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 border-t p-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicleId ? "Save Changes" : "Register"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ASSIGN DRIVER DIALOG */}
      {isAssignOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Assign Driver</CardTitle>
              <CardDescription>Select an available driver for {selectedVehicle.licensePlate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-1.5">
                <Label htmlFor="driverSelect">Available Drivers</Label>
                <select
                  id="driverSelect"
                  defaultValue={selectedVehicle.driverId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleAssignDriver(val ? Number(val) : undefined);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none"
                >
                  <option value="">-- Unassign Driver --</option>
                  {drivers
                    .filter((d) => d.status === "AVAILABLE" || d.id === selectedVehicle.driverId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.status})
                      </option>
                    ))}
                </select>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 border-t p-4">
              <Button variant="outline" size="sm" onClick={() => setIsAssignOpen(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DELETE DIALOG CONFIRMATION */}
      {isDeleteOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border border-destructive/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                Are you absolutely sure you want to delete vehicle <strong>{selectedVehicle.licensePlate}</strong>? This action cannot be undone.
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

export default Fleet;
