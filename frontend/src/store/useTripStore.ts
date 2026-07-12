import { create } from "zustand";
import { type TripStatus } from "@/constants";
import api from "@/services/api";
import { useFleetStore } from "./useFleetStore";
import { useDriverStore } from "./useDriverStore";

export interface TripTimelineEvent {
  status: TripStatus;
  timestamp: string;
  description: string;
}

export interface Trip {
  id: number;
  tripNumber: string;
  vehicleId: number;
  driverId: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  estimatedArrivalDate: string;
  estimatedArrivalTime: string;
  cargoType: string;
  cargoWeight: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  notes?: string;
  status: TripStatus;
  timeline: TripTimelineEvent[];
  // Completed metrics
  distanceCovered?: number;
  fuelUsed?: number;
  remarks?: string;
  completedTime?: string;
  // Cancelled metrics
  cancelReason?: string;
  cancelComment?: string;
}

interface TripStore {
  trips: Trip[];
  filters: {
    status: string;
    priority: string;
    search: string;
  };
  setFilters: (filters: Partial<TripStore["filters"]>) => void;
  fetchTrips: () => Promise<void>;
  addTrip: (trip: Omit<Trip, "id" | "timeline" | "status">) => Promise<void>;
  updateTrip: (id: number, trip: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: number) => Promise<void>;
  dispatchTrip: (id: number) => Promise<void>;
  completeTrip: (id: number, data: { distanceCovered: number; fuelUsed: number; remarks: string; completedTime: string }) => Promise<void>;
  cancelTrip: (id: number, data: { cancelReason: string; cancelComment: string }) => Promise<void>;
  duplicateTrip: (id: number) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  filters: {
    status: "ALL",
    priority: "ALL",
    search: "",
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  fetchTrips: async () => {
    try {
      const response = await api.get("/trips");
      set({ trips: response.data });
    } catch (error) {
      console.error("fetchTrips store error:", error);
    }
  },
  addTrip: async (trip) => {
    try {
      const response = await api.post("/trips", trip);
      set({ trips: [...get().trips, response.data] });
    } catch (error) {
      console.error("addTrip store error:", error);
      throw error;
    }
  },
  updateTrip: async (id, updatedTrip) => {
    try {
      const response = await api.put(`/trips/${id}`, updatedTrip);
      set({
        trips: get().trips.map((t) => (t.id === id ? response.data : t)),
      });
    } catch (error) {
      console.error("updateTrip store error:", error);
      throw error;
    }
  },
  deleteTrip: async (id) => {
    try {
      await api.delete(`/trips/${id}`);
      set({
        trips: get().trips.filter((t) => t.id !== id),
      });
    } catch (error) {
      console.error("deleteTrip store error:", error);
      throw error;
    }
  },
  dispatchTrip: async (id) => {
    try {
      const response = await api.put(`/trips/${id}/dispatch`);
      set({
        trips: get().trips.map((t) => (t.id === id ? response.data : t)),
      });
      // Synchronize vehicle and driver stores in frontend
      await useFleetStore.getState().fetchVehicles();
      await useDriverStore.getState().fetchDrivers();
    } catch (error) {
      console.error("dispatchTrip store error:", error);
      throw error;
    }
  },
  completeTrip: async (id, completedData) => {
    try {
      const response = await api.put(`/trips/${id}/complete`, completedData);
      set({
        trips: get().trips.map((t) => (t.id === id ? response.data : t)),
      });
      // Synchronize vehicle and driver stores in frontend
      await useFleetStore.getState().fetchVehicles();
      await useDriverStore.getState().fetchDrivers();
    } catch (error) {
      console.error("completeTrip store error:", error);
      throw error;
    }
  },
  cancelTrip: async (id, cancelData) => {
    try {
      const response = await api.put(`/trips/${id}/cancel`, cancelData);
      set({
        trips: get().trips.map((t) => (t.id === id ? response.data : t)),
      });
      // Synchronize vehicle and driver stores in frontend
      await useFleetStore.getState().fetchVehicles();
      await useDriverStore.getState().fetchDrivers();
    } catch (error) {
      console.error("cancelTrip store error:", error);
      throw error;
    }
  },
  duplicateTrip: async (id) => {
    try {
      const sourceTrip = get().trips.find(t => t.id === id);
      if (!sourceTrip) return;

      const duplicatedParams = {
        vehicleId: sourceTrip.vehicleId,
        driverId: sourceTrip.driverId,
        origin: sourceTrip.origin,
        destination: sourceTrip.destination,
        departureDate: sourceTrip.departureDate,
        departureTime: sourceTrip.departureTime,
        estimatedArrivalDate: sourceTrip.estimatedArrivalDate,
        estimatedArrivalTime: sourceTrip.estimatedArrivalTime,
        cargoType: sourceTrip.cargoType,
        cargoWeight: sourceTrip.cargoWeight,
        priority: sourceTrip.priority,
        notes: `Duplicated from Trip #${sourceTrip.tripNumber}`,
      };

      const response = await api.post("/trips", duplicatedParams);
      set({ trips: [...get().trips, response.data] });
    } catch (error) {
      console.error("duplicateTrip store error:", error);
      throw error;
    }
  },
}));
