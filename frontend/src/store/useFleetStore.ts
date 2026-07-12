import { create } from "zustand";
import { type VehicleStatus, VEHICLE_STATUSES } from "@/constants";

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
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: number, vehicle: Partial<Vehicle>) => void;
  deleteVehicle: (id: number) => void;
  assignDriver: (vehicleId: number, driverId: number | undefined) => void;
}

export const useFleetStore = create<FleetStore>((set) => ({
  vehicles: [
    {
      id: 1,
      vin: "MB12PRMA1KGD9942",
      licensePlate: "GJ01AB4587",
      name: "Tata Prima",
      make: "Tata",
      model: "Prima 4930.S",
      year: 2021,
      capacity: 25000,
      fuelType: "Diesel",
      purchaseDate: "2021-06-15",
      insuranceExpiry: "2026-08-15",
      fitnessExpiry: "2026-09-20",
      permitExpiry: "2027-01-10",
      currentOdometer: 142050,
      status: VEHICLE_STATUSES.ACTIVE,
      driverId: 1,
      lastService: "2026-06-10",
    },
    {
      id: 2,
      vin: "MB12BENZ1KGD8853",
      licensePlate: "MH12JK4512",
      name: "BharatBenz 3528",
      make: "BharatBenz",
      model: "3528C",
      year: 2022,
      capacity: 28000,
      fuelType: "Diesel",
      purchaseDate: "2022-04-10",
      insuranceExpiry: "2026-07-24",
      fitnessExpiry: "2026-10-15",
      permitExpiry: "2027-04-05",
      currentOdometer: 98120,
      status: VEHICLE_STATUSES.IN_SERVICE,
      driverId: 2,
      lastService: "2026-05-18",
    },
    {
      id: 3,
      vin: "MB12ASHK1KGD1142",
      licensePlate: "RJ14KL7854",
      name: "Ashok Leyland 2820",
      make: "Ashok Leyland",
      model: "2820",
      year: 2020,
      capacity: 22000,
      fuelType: "CNG",
      purchaseDate: "2020-11-05",
      insuranceExpiry: "2026-11-05",
      fitnessExpiry: "2026-07-10",
      permitExpiry: "2026-12-15",
      currentOdometer: 215400,
      status: VEHICLE_STATUSES.MAINTENANCE,
      driverId: undefined,
      lastService: "2026-07-08",
    },
    {
      id: 4,
      vin: "MB12MAHN1KGD5562",
      licensePlate: "DL01AB9999",
      name: "Mahindra Blazo",
      make: "Mahindra",
      model: "Blazo X 35",
      year: 2023,
      capacity: 26000,
      fuelType: "Diesel",
      purchaseDate: "2023-01-20",
      insuranceExpiry: "2027-01-20",
      fitnessExpiry: "2027-01-20",
      permitExpiry: "2027-01-20",
      currentOdometer: 54100,
      status: VEHICLE_STATUSES.OUT_OF_SERVICE,
      driverId: undefined,
      lastService: "2026-03-02",
    }
  ],
  filters: {
    status: "ALL",
    type: "ALL",
    search: "",
  },
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
  })),
  addVehicle: (veh) => set((state) => ({
    vehicles: [...state.vehicles, { ...veh, id: state.vehicles.length + 1 }],
  })),
  updateVehicle: (id, updatedVeh) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...updatedVeh } : v)),
  })),
  deleteVehicle: (id) => set((state) => ({
    vehicles: state.vehicles.filter((v) => v.id !== id),
  })),
  assignDriver: (vehicleId, driverId) => set((state) => ({
    vehicles: state.vehicles.map((v) => (v.id === vehicleId ? { ...v, driverId } : v)),
  })),
}));
