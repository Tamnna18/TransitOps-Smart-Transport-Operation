import { create } from "zustand";
import { type VehicleStatus } from "@/constants";
import api from "@/services/api";

export interface Vehicle {
  id: number;
  vin: string;
  licensePlate: string;
  name: string;
  make: string;
  model: string;
  year: number;
  capacity: number; // in kg
  fuelType: string;
  purchaseDate: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  permitExpiry: string;
  currentOdometer: number; // in km
  status: VehicleStatus;
  driverId?: number;
  lastService?: string;
  imageUrl?: string;
}

interface FleetStore {
  vehicles: Vehicle[];
  filters: {
    status: string;
    type: string;
    search: string;
  };
  setFilters: (filters: Partial<FleetStore["filters"]>) => void;
  fetchVehicles: () => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<void>;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: number) => Promise<void>;
  assignDriver: (vehicleId: number, driverId: number | undefined) => Promise<void>;
}

export const useFleetStore = create<FleetStore>((set, get) => ({
  vehicles: [],
  filters: {
    status: "ALL",
    type: "ALL",
    search: "",
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  fetchVehicles: async () => {
    try {
      const response = await api.get("/fleet");
      set({ vehicles: response.data });
    } catch (error) {
      console.error("fetchVehicles store error:", error);
    }
  },
  addVehicle: async (veh) => {
    try {
      const response = await api.post("/fleet", veh);
      set({ vehicles: [...get().vehicles, response.data] });
    } catch (error) {
      console.error("addVehicle store error:", error);
      throw error;
    }
  },
  updateVehicle: async (id, updatedVeh) => {
    try {
      const response = await api.put(`/fleet/${id}`, updatedVeh);
      set({
        vehicles: get().vehicles.map((v) => (v.id === id ? response.data : v)),
      });
    } catch (error) {
      console.error("updateVehicle store error:", error);
      throw error;
    }
  },
  deleteVehicle: async (id) => {
    try {
      await api.delete(`/fleet/${id}`);
      set({
        vehicles: get().vehicles.filter((v) => v.id !== id),
      });
    } catch (error) {
      console.error("deleteVehicle store error:", error);
      throw error;
    }
  },
  assignDriver: async (vehicleId, driverId) => {
    try {
      const response = await api.post(`/fleet/${vehicleId}/assign`, { driverId });
      set({
        vehicles: get().vehicles.map((v) => (v.id === vehicleId ? response.data : v)),
      });
    } catch (error) {
      console.error("assignDriver store error:", error);
      throw error;
    }
  },
}));
