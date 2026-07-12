import { create } from "zustand";
import { type DriverStatus, DRIVER_STATUSES } from "@/constants";

export interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string;
  joiningDate: string;
  experienceYears: number;
  status: DriverStatus;
  vehicleId?: number;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  performanceScore?: number;
}

interface DriverStore {
  drivers: Driver[];
  filters: {
    status: string;
    search: string;
  };
  setFilters: (filters: Partial<DriverStore["filters"]>) => void;
  addDriver: (driver: Omit<Driver, "id">) => void;
  updateDriver: (id: number, driver: Partial<Driver>) => void;
  deleteDriver: (id: number) => void;
  assignVehicle: (driverId: number, vehicleId: number | undefined) => void;
}

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [
    {
      id: 1,
      name: "John Doe",
      phone: "+1-555-0199",
      email: "john.doe@transitops.com",
      address: "123 Trucker Way, Queens, NY 11101",
      licenseNumber: "NY-DL-984210",
      licenseExpiry: "2027-04-12",
      joiningDate: "2019-03-01",
      experienceYears: 7,
      status: DRIVER_STATUSES.AVAILABLE,
      vehicleId: 1,
      emergencyContact: {
        name: "Jane Doe",
        relationship: "Spouse",
        phone: "+1-555-0198",
      },
      performanceScore: 94,
    },
    {
      id: 2,
      name: "Jack Sparrow",
      phone: "+1-555-0242",
      email: "jack.sparrow@transitops.com",
      address: "42 Pirate Cove, Brooklyn, NY 11201",
      licenseNumber: "NY-DL-424242",
      licenseExpiry: "2026-07-28",
      joiningDate: "2022-08-15",
      experienceYears: 4,
      status: DRIVER_STATUSES.IN_TRANSIT,
      vehicleId: 2,
      emergencyContact: {
        name: "Gibbs Sparrow",
        relationship: "Brother",
        phone: "+1-555-0243",
      },
      performanceScore: 88,
    },
    {
      id: 3,
      name: "Bruce Banner",
      phone: "+1-555-0303",
      email: "bruce.banner@transitops.com",
      address: "Gamma Lab Rd, Princeton, NJ 08540",
      licenseNumber: "NJ-DL-030303",
      licenseExpiry: "2028-11-20",
      joiningDate: "2021-01-10",
      experienceYears: 10,
      status: DRIVER_STATUSES.ON_REST,
      vehicleId: undefined,
      emergencyContact: {
        name: "Betty Banner",
        relationship: "Sister",
        phone: "+1-555-0304",
      },
      performanceScore: 99,
    },
    {
      id: 4,
      name: "Walter White",
      phone: "+1-555-0505",
      email: "walter.white@transitops.com",
      address: "308 Negra Arroyo Lane, Albuquerque, NM 87104",
      licenseNumber: "NM-DL-505050",
      licenseExpiry: "2026-06-30",
      joiningDate: "2023-05-01",
      experienceYears: 3,
      status: DRIVER_STATUSES.SUSPENDED,
      vehicleId: undefined,
      emergencyContact: {
        name: "Skyler White",
        relationship: "Spouse",
        phone: "+1-555-0506",
      },
      performanceScore: 72,
    }
  ],
  filters: {
    status: "ALL",
    search: "",
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  addDriver: (dr) => set((state) => ({
    drivers: [...state.drivers, { ...dr, id: state.drivers.length + 1 }],
  })),
  updateDriver: (id, updatedDr) => set((state) => ({
    drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...updatedDr } : d)),
  })),
  deleteDriver: (id) => set((state) => ({
    drivers: state.drivers.filter((d) => d.id !== id),
  })),
  assignVehicle: (driverId, vehicleId) => set((state) => ({
    drivers: state.drivers.map((d) => (d.id === driverId ? { ...d, vehicleId } : d)),
  })),
}));
