import { create } from "zustand";
import { type DriverStatus } from "@/constants";
import api from "@/services/api";

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
  fetchDrivers: () => Promise<void>;
  addDriver: (driver: Omit<Driver, "id">) => Promise<void>;
  updateDriver: (id: number, driver: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: number) => Promise<void>;
  assignVehicle: (driverId: number, vehicleId: number | undefined) => Promise<void>;
}

export const useDriverStore = create<DriverStore>((set, get) => ({
  drivers: [],
  filters: {
    status: "ALL",
    search: "",
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  fetchDrivers: async () => {
    try {
      const response = await api.get("/drivers");
      set({ drivers: response.data });
    } catch (error) {
      console.error("fetchDrivers store error:", error);
    }
  },
  addDriver: async (dr) => {
    try {
      const response = await api.post("/drivers", dr);
      set({ drivers: [...get().drivers, response.data] });
    } catch (error) {
      console.error("addDriver store error:", error);
      throw error;
    }
  },
  updateDriver: async (id, updatedDr) => {
    try {
      const response = await api.put(`/drivers/${id}`, updatedDr);
      set({
        drivers: get().drivers.map((d) => (d.id === id ? response.data : d)),
      });
    } catch (error) {
      console.error("updateDriver store error:", error);
      throw error;
    }
  },
  deleteDriver: async (id) => {
    try {
      await api.delete(`/drivers/${id}`);
      set({
        drivers: get().drivers.filter((d) => d.id !== id),
      });
    } catch (error) {
      console.error("deleteDriver store error:", error);
      throw error;
    }
  },
  assignVehicle: async (driverId, vehicleId) => {
    try {
      // In the backend, we assign via the vehicle assignment API endpoint
      if (vehicleId) {
        await api.post(`/fleet/${vehicleId}/assign`, { driverId });
      } else {
        // If unassigning, find the current vehicle assigned to this driver and unassign it
        const currentDriverObj = get().drivers.find((d) => d.id === driverId);
        if (currentDriverObj && currentDriverObj.vehicleId) {
          await api.post(`/fleet/${currentDriverObj.vehicleId}/assign`, { driverId: null });
        }
      }
      // Refresh both stores to keep state aligned
      await get().fetchDrivers();
    } catch (error) {
      console.error("assignVehicle store error:", error);
      throw error;
    }
  },
}));
