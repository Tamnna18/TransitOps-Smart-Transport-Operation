import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDriverStore, type Driver } from "@/store/useDriverStore";
import { useFleetStore } from "@/store/useFleetStore";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DRIVER_STATUSES } from "@/constants";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Truck,
  X,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertOctagon,
  Award
} from "lucide-react";
import { toast } from "sonner";

// Zod validation schema for Driver operations
const driverFormSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  phone: z.string().min(6, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address is required"),
  licenseNumber: z.string().min(3, "License number is required"),
  licenseExpiry: z.string().min(1, "License expiry date is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  experienceYears: z.number().min(0, "Experience cannot be negative"),
  status: z.string(),
  emergencyContactName: z.string().min(2, "Contact name is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  emergencyContactPhone: z.string().min(6, "Contact phone is required"),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

const Drivers: React.FC = () => {
  const { drivers, filters, setFilters, addDriver, updateDriver, deleteDriver } = useDriverStore();
  const { vehicles } = useFleetStore();

  // Modal and details drawer states
  const [selectedDriver, setSelectedDriver] = React.useState<Driver | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isAssignOpen, setIsAssignOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [editingDriverId, setEditingDriverId] = React.useState<number | null>(null);
  const [activeDropdownId, setActiveDropdownId] = React.useState<number | null>(null);

  // Form hooks
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      status: DRIVER_STATUSES.AVAILABLE,
      name: "",
      phone: "",
      email: "",
      address: "",
      licenseNumber: "",
      licenseExpiry: "",
      joiningDate: "",
      experienceYears: 0,
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
    },
  });

  const onSubmit = (data: DriverFormValues) => {
    const formattedData = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      address: data.address,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      joiningDate: data.joiningDate,
      experienceYears: data.experienceYears,
      status: data.status as any,
      emergencyContact: {
        name: data.emergencyContactName,
        relationship: data.emergencyContactRelationship,
        phone: data.emergencyContactPhone,
      },
      performanceScore: editingDriverId ? (drivers.find(d => d.id === editingDriverId)?.performanceScore || 90) : 90,
      vehicleId: editingDriverId ? (drivers.find(d => d.id === editingDriverId)?.vehicleId || undefined) : undefined,
    };

    if (editingDriverId) {
      updateDriver(editingDriverId, formattedData);
      toast.success("Driver details updated");
    } else {
      addDriver(formattedData);
      toast.success("Driver registered on roster");
    }
    setIsFormOpen(false);
    reset();
    setEditingDriverId(null);
  };

  const handleOpenEditForm = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setValue("name", driver.name);
    setValue("phone", driver.phone);
    setValue("email", driver.email);
    setValue("address", driver.address);
    setValue("licenseNumber", driver.licenseNumber);
    setValue("licenseExpiry", driver.licenseExpiry);
    setValue("joiningDate", driver.joiningDate);
    setValue("experienceYears", driver.experienceYears);
    setValue("status", driver.status);
    setValue("emergencyContactName", driver.emergencyContact.name);
    setValue("emergencyContactRelationship", driver.emergencyContact.relationship);
    setValue("emergencyContactPhone", driver.emergencyContact.phone);
    setIsFormOpen(true);
    setActiveDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedDriver) {
      deleteDriver(selectedDriver.id);
      toast.success(`Driver ${selectedDriver.name} removed from registry`);
      setIsDeleteOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleAssignVehicle = (vehicleId: number | undefined) => {
    if (selectedDriver) {
      updateDriver(selectedDriver.id, { vehicleId });
      toast.success(vehicleId ? "Vehicle assigned successfully" : "Vehicle unassigned");
      setIsAssignOpen(false);
      setSelectedDriver(null);
    }
  };

  const handleToggleStatus = (driver: Driver) => {
    const nextStatus = driver.status === DRIVER_STATUSES.SUSPENDED ? DRIVER_STATUSES.AVAILABLE : DRIVER_STATUSES.SUSPENDED;
    updateDriver(driver.id, { status: nextStatus });
    toast.success(`Driver status updated to ${nextStatus.toLowerCase()}`);
    setActiveDropdownId(null);
  };

  // Filtered driver list
  const filteredDrivers = drivers.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      d.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchStatus = filters.status === "ALL" || d.status === filters.status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Driver Operations"
        description="Roster management, hours of service compliance, license monitoring, and emergency profiles."
        actions={
          <Button onClick={() => { setEditingDriverId(null); reset(); setIsFormOpen(true); }} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Register Driver
          </Button>
        }
      />

      {/* Toolbar Search and Filters */}
      <Card className="border border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by driver name, license number, or email..."
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
              <option value={DRIVER_STATUSES.AVAILABLE}>Available</option>
              <option value={DRIVER_STATUSES.IN_TRANSIT}>In Transit</option>
              <option value={DRIVER_STATUSES.ON_REST}>On Rest</option>
              <option value={DRIVER_STATUSES.SUSPENDED}>Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Driver Roster Data Table */}
      <Card className="border border-border/50 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm border-collapse text-left">
            <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Driver Profile</th>
                <th className="px-6 py-4">License Number</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Vehicle</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b text-foreground">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No drivers registered matching query.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => {
                  const vehiclePlate = vehicles.find((v) => v.id === driver.vehicleId)?.licensePlate || "Unassigned";
                  return (
                    <tr key={driver.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sm">{driver.name}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Joined: {driver.joiningDate}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{driver.licenseNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs">{driver.phone}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{driver.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">{driver.experienceYears} Years</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={driver.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                          {vehiclePlate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setActiveDropdownId(activeDropdownId === driver.id ? null : driver.id)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {activeDropdownId === driver.id && (
                          <div className="absolute right-6 mt-1 w-44 rounded-md border bg-card shadow-lg ring-1 ring-black ring-opacity-5 z-50 py-1 text-left animate-fade-in">
                            <button
                              onClick={() => { setSelectedDriver(driver); setIsDrawerOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Profile
                            </button>
                            <button
                              onClick={() => handleOpenEditForm(driver)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Edit2 className="h-3.5 w-3.5" /> Edit Profile
                            </button>
                            <button
                              onClick={() => { setSelectedDriver(driver); setIsAssignOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <Truck className="h-3.5 w-3.5" /> Assign Vehicle
                            </button>
                            <button
                              onClick={() => handleToggleStatus(driver)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              <AlertOctagon className="h-3.5 w-3.5" /> {driver.status === DRIVER_STATUSES.SUSPENDED ? "Activate" : "Suspend"}
                            </button>
                            <button
                              onClick={() => { setSelectedDriver(driver); setIsDeleteOpen(true); setActiveDropdownId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Remove Driver
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

      {/* DRIVER SPECIFIC DETAIL PROFILE DRAWER */}
      {isDrawerOpen && selectedDriver && (
        <div className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-card border-l shadow-2xl z-50 flex flex-col animate-slide-in">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                {selectedDriver.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <CardTitle className="text-sm font-bold">{selectedDriver.name}</CardTitle>
                <CardDescription>Driver ID: #DRV-0{selectedDriver.id}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <User className="h-4 w-4" /> Personal Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{selectedDriver.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                  <span>{selectedDriver.address}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> License Verification
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">License Number (CDL)</span>
                  <span className="font-semibold text-foreground">{selectedDriver.licenseNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Expiry Date</span>
                  <span className="font-semibold text-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {selectedDriver.licenseExpiry}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Driving Experience</span>
                  <span className="font-semibold text-foreground">{selectedDriver.experienceYears} Years</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Award className="h-4 w-4" /> Safety Performance
              </h3>
              <div className="flex items-center gap-4 bg-muted/40 p-3 rounded-lg border">
                <div className="text-3xl font-extrabold text-primary">{selectedDriver.performanceScore}%</div>
                <div className="text-xs text-muted-foreground">
                  Computed based on hours of service, on-time deliveries, and compliance checklists completion.
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertOctagon className="h-4 w-4" /> Emergency Contact
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-semibold text-foreground">{selectedDriver.emergencyContact.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Relationship</span>
                  <span className="font-semibold text-foreground">{selectedDriver.emergencyContact.relationship}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-semibold text-foreground">{selectedDriver.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT DRIVER FORM DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <Card className="w-full max-w-lg shadow-2xl border border-border/60 bg-card">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg">
                  {editingDriverId ? "Edit Driver Profile" : "Register Driver"}
                </CardTitle>
                <CardDescription>
                  Configure compliance, license validation, and emergency profiles
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Rahul Sharma" {...register("name")} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 9876543210" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="Rahul@example.com" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="experienceYears">Years of Experience</Label>
                    <Input id="experienceYears" type="number" placeholder="5" {...register("experienceYears", { valueAsNumber: true })} />
                    {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears.message}</p>}
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="address">Permanent Address</Label>
                  <Input id="address" placeholder="123 Road, GJ" {...register("address")} />
                  {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="licenseNumber">License No (CDL)</Label>
                    <Input id="licenseNumber" placeholder="CDL-12345" {...register("licenseNumber")} />
                    {errors.licenseNumber && <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="licenseExpiry">License Expiry</Label>
                    <Input id="licenseExpiry" type="date" {...register("licenseExpiry")} />
                    {errors.licenseExpiry && <p className="text-xs text-destructive">{errors.licenseExpiry.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input id="joiningDate" type="date" {...register("joiningDate")} />
                    {errors.joiningDate && <p className="text-xs text-destructive">{errors.joiningDate.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="status">Availability Status</Label>
                    <select id="status" {...register("status")} className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-sm focus-visible:outline-none">
                      <option value={DRIVER_STATUSES.AVAILABLE}>Available</option>
                      <option value={DRIVER_STATUSES.IN_TRANSIT}>In Transit</option>
                      <option value={DRIVER_STATUSES.ON_REST}>On Rest</option>
                      <option value={DRIVER_STATUSES.SUSPENDED}>Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Emergency Contact</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input id="emergencyContactName" placeholder="Priya Sharma" {...register("emergencyContactName")} />
                      {errors.emergencyContactName && <p className="text-xs text-destructive">{errors.emergencyContactName.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Input id="emergencyContactRelationship" placeholder="Spouse" {...register("emergencyContactRelationship")} />
                      {errors.emergencyContactRelationship && <p className="text-xs text-destructive">{errors.emergencyContactRelationship.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                      <Input id="emergencyContactPhone" placeholder="+91 9876543211" {...register("emergencyContactPhone")} />
                      {errors.emergencyContactPhone && <p className="text-xs text-destructive">{errors.emergencyContactPhone.message}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 border-t p-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDriverId ? "Save Changes" : "Register"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* VEHICLE ASSIGNMENT MODAL */}
      {isAssignOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Assign Vehicle</CardTitle>
              <CardDescription>Select a vehicle for driver {selectedDriver.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="grid gap-1.5">
                <Label htmlFor="vehicleSelect">Available Fleet</Label>
                <select
                  id="vehicleSelect"
                  defaultValue={selectedDriver.vehicleId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleAssignVehicle(val ? Number(val) : undefined);
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none"
                >
                  <option value="">-- Unassign Vehicle --</option>
                  {vehicles
                    .filter((v) => v.status === "ACTIVE" || v.id === selectedDriver.vehicleId)
                    .map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.licensePlate})
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

      {/* DELETE CONFIRMATION DIALOG */}
      {isDeleteOpen && selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm border border-destructive/30 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                Confirm Removal
              </CardTitle>
              <CardDescription>
                Are you absolutely sure you want to remove driver <strong>{selectedDriver.name}</strong> from registry? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
                Remove
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Drivers;
