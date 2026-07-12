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
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul.sharma@transitops.in",
      address: "SG Highway, Ahmedabad, Gujarat 380054",
      licenseNumber: "GJ01-DL-984210",
      licenseExpiry: "2027-04-12",
      joiningDate: "2019-03-01",
      experienceYears: 7,
      status: DRIVER_STATUSES.AVAILABLE,
      vehicleId: 1,
      emergencyContact: {
        name: "Priya Sharma",
        relationship: "Spouse",
        phone: "+91 9876543211",
      },
      performanceScore: 94,
    },
    {
      id: 2,
      name: "Amit Patel",
      phone: "+91 9825012345",
      email: "amit.patel@transitops.in",
      address: "Andheri East, Mumbai, Maharashtra 400069",
      licenseNumber: "MH12-DL-424242",
      licenseExpiry: "2026-07-28",
      joiningDate: "2022-08-15",
      experienceYears: 4,
      status: DRIVER_STATUSES.IN_TRANSIT,
      vehicleId: 2,
      emergencyContact: {
        name: "Neha Patel",
        relationship: "Sister",
        phone: "+91 9825012346",
      },
      performanceScore: 88,
    },
    {
      id: 3,
      name: "Vikram Singh",
      phone: "+91 9099012345",
      email: "vikram.singh@transitops.in",
      address: "Baner, Pune, Maharashtra 411045",
      licenseNumber: "MH12-DL-030303",
      licenseExpiry: "2028-11-20",
      joiningDate: "2021-01-10",
      experienceYears: 10,
      status: DRIVER_STATUSES.ON_REST,
      vehicleId: undefined,
      emergencyContact: {
        name: "Karan Singh",
        relationship: "Brother",
        phone: "+91 9099012346",
      },
      performanceScore: 99,
    },
    {
      id: 4,
      name: "Rohit Verma",
      phone: "+91 9876543110",
      email: "rohit.verma@transitops.in",
      address: "Electronic City, Bengaluru, Karnataka 560100",
      licenseNumber: "KA05-DL-505050",
      licenseExpiry: "2026-06-30",
      joiningDate: "2023-05-01",
      experienceYears: 3,
      status: DRIVER_STATUSES.SUSPENDED,
      vehicleId: undefined,
      emergencyContact: {
        name: "Anjali Verma",
        relationship: "Spouse",
        phone: "+91 9876543111",
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
