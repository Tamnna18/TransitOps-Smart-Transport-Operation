import { create } from "zustand";
import { type TripStatus, TRIP_STATUSES, VEHICLE_STATUSES, DRIVER_STATUSES } from "@/constants";
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
  addTrip: (trip: Omit<Trip, "id" | "timeline" | "status">) => void;
  updateTrip: (id: number, trip: Partial<Trip>) => void;
  deleteTrip: (id: number) => void;
  dispatchTrip: (id: number) => void;
  completeTrip: (id: number, data: { distanceCovered: number; fuelUsed: number; remarks: string; completedTime: string }) => void;
  cancelTrip: (id: number, data: { cancelReason: string; cancelComment: string }) => void;
  duplicateTrip: (id: number) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: [
    {
      id: 1,
      tripNumber: "TO-9942",
      vehicleId: 1,
      driverId: 1,
      origin: "Ahmedabad Hub",
      destination: "Surat Depot",
      departureDate: "2026-07-12",
      departureTime: "08:00",
      estimatedArrivalDate: "2026-07-12",
      estimatedArrivalTime: "11:30",
      cargoType: "Electronics",
      cargoWeight: 8500,
      priority: "HIGH",
      status: TRIP_STATUSES.IN_TRANSIT,
      timeline: [
        { status: TRIP_STATUSES.SCHEDULED, timestamp: "2026-07-11T16:00:00Z", description: "Trip scheduled by Fleet Manager" },
        { status: TRIP_STATUSES.IN_TRANSIT, timestamp: "2026-07-12T08:00:00Z", description: "Vehicle dispatched on route" }
      ],
    },
    {
      id: 2,
      tripNumber: "TO-8853",
      vehicleId: 2,
      driverId: 2,
      origin: "Mumbai Warehouse",
      destination: "Pune Hub",
      departureDate: "2026-07-13",
      departureTime: "06:00",
      estimatedArrivalDate: "2026-07-13",
      estimatedArrivalTime: "13:00",
      cargoType: "Automotive Parts",
      cargoWeight: 12000,
      priority: "MEDIUM",
      status: TRIP_STATUSES.SCHEDULED,
      timeline: [
        { status: TRIP_STATUSES.SCHEDULED, timestamp: "2026-07-12T10:00:00Z", description: "Trip scheduled and resources assigned" }
      ],
    }
  ],
  filters: {
    status: "ALL",
    priority: "ALL",
    search: "",
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  addTrip: (trip) => set((state) => {
    const newId = state.trips.length + 1;
    const newTrip: Trip = {
      ...trip,
      id: newId,
      status: TRIP_STATUSES.SCHEDULED,
      timeline: [
        {
          status: TRIP_STATUSES.SCHEDULED,
          timestamp: new Date().toISOString(),
          description: "Trip created and scheduled on registry"
        }
      ]
    };
    return { trips: [...state.trips, newTrip] };
  }),
  updateTrip: (id, updatedTrip) => set((state) => ({
    trips: state.trips.map((t) => (t.id === id ? { ...t, ...updatedTrip } : t)),
  })),
  deleteTrip: (id) => set((state) => ({
    trips: state.trips.filter((t) => t.id !== id),
  })),
  dispatchTrip: (id) => set((state) => {
    const trips = state.trips.map((t) => {
      if (t.id === id) {
        // Enforce vehicle/driver status mapping
        useFleetStore.getState().updateVehicle(t.vehicleId, { status: VEHICLE_STATUSES.IN_SERVICE });
        useDriverStore.getState().updateDriver(t.driverId, { status: DRIVER_STATUSES.IN_TRANSIT });
        
        return {
          ...t,
          status: TRIP_STATUSES.IN_TRANSIT,
          timeline: [
            ...t.timeline,
            {
              status: TRIP_STATUSES.IN_TRANSIT,
              timestamp: new Date().toISOString(),
              description: "Trip dispatched. Driver and vehicle set to active status."
            }
          ]
        };
      }
      return t;
    });
    return { trips };
  }),
  completeTrip: (id, completedData) => set((state) => {
    const trips = state.trips.map((t) => {
      if (t.id === id) {
        // Enforce vehicle/driver status reset to available
        useFleetStore.getState().updateVehicle(t.vehicleId, { status: VEHICLE_STATUSES.ACTIVE });
        useDriverStore.getState().updateDriver(t.driverId, { status: DRIVER_STATUSES.AVAILABLE });

        return {
          ...t,
          ...completedData,
          status: TRIP_STATUSES.COMPLETED,
          timeline: [
            ...t.timeline,
            {
              status: TRIP_STATUSES.COMPLETED,
              timestamp: new Date().toISOString(),
              description: `Trip completed. Distance: ${completedData.distanceCovered} km, Fuel Used: ${completedData.fuelUsed} L. Remarks: ${completedData.remarks}`
            }
          ]
        };
      }
      return t;
    });
    return { trips };
  }),
  cancelTrip: (id, cancelData) => set((state) => {
    const trips = state.trips.map((t) => {
      if (t.id === id) {
        useFleetStore.getState().updateVehicle(t.vehicleId, { status: VEHICLE_STATUSES.ACTIVE });
        useDriverStore.getState().updateDriver(t.driverId, { status: DRIVER_STATUSES.AVAILABLE });

        return {
          ...t,
          ...cancelData,
          status: TRIP_STATUSES.CANCELLED,
          timeline: [
            ...t.timeline,
            {
              status: TRIP_STATUSES.CANCELLED,
              timestamp: new Date().toISOString(),
              description: `Trip cancelled. Reason: ${cancelData.cancelReason}. Details: ${cancelData.cancelComment}`
            }
          ]
        };
      }
      return t;
    });
    return { trips };
  }),
  duplicateTrip: (id) => set((state) => {
    const sourceTrip = state.trips.find(t => t.id === id);
    if (!sourceTrip) return {};
    
    const newId = state.trips.length + 1;
    const duplicated: Trip = {
      ...sourceTrip,
      id: newId,
      tripNumber: `TO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: TRIP_STATUSES.SCHEDULED,
      timeline: [
        {
          status: TRIP_STATUSES.SCHEDULED,
          timestamp: new Date().toISOString(),
          description: `Duplicated from Trip #${sourceTrip.tripNumber}`
        }
      ],
      distanceCovered: undefined,
      fuelUsed: undefined,
      remarks: undefined,
      completedTime: undefined,
      cancelReason: undefined,
      cancelComment: undefined,
    };
    return { trips: [...state.trips, duplicated] };
  }),
}));
