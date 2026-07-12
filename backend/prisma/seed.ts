import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing records
  await prisma.user.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.dvirLog.deleteMany();
  await prisma.incidentLog.deleteMany();
  await prisma.expenseLog.deleteMany();

  const passwordHash = bcrypt.hashSync("password123", 10);

  // 1. Create Users
  const managerUser = await prisma.user.create({
    data: {
      email: "fleet.manager@transitops.in",
      passwordHash,
      role: "MANAGER",
      name: "Rajesh Patel",
    },
  });

  const safetyUser = await prisma.user.create({
    data: {
      email: "safety.officer@transitops.in",
      passwordHash,
      role: "SAFETY",
      name: "Anjali Sharma",
    },
  });

  const analystUser = await prisma.user.create({
    data: {
      email: "financial.analyst@transitops.in",
      passwordHash,
      role: "ANALYST",
      name: "Nikhil Shah",
    },
  });

  const driverUser1 = await prisma.user.create({
    data: {
      email: "rahul.sharma@transitops.in",
      passwordHash,
      role: "DRIVER",
      name: "Rahul Sharma",
    },
  });

  const driverUser2 = await prisma.user.create({
    data: {
      email: "amit.patel@transitops.in",
      passwordHash,
      role: "DRIVER",
      name: "Amit Patel",
    },
  });

  // 2. Create Drivers
  const d1 = await prisma.driver.create({
    data: {
      id: 1,
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      email: "rahul.sharma@transitops.in",
      address: "SG Highway, Ahmedabad, Gujarat 380054",
      licenseNumber: "GJ01-DL-984210",
      licenseExpiry: "2027-04-12",
      joiningDate: "2019-03-01",
      experienceYears: 7,
      status: "AVAILABLE",
      vehicleId: 1,
      emergencyContactName: "Priya Sharma",
      emergencyContactRelationship: "Spouse",
      emergencyContactPhone: "+91 9876543211",
      performanceScore: 94,
    },
  });

  const d2 = await prisma.driver.create({
    data: {
      id: 2,
      name: "Amit Patel",
      phone: "+91 9825012345",
      email: "amit.patel@transitops.in",
      address: "Andheri East, Mumbai, Maharashtra 400069",
      licenseNumber: "MH12-DL-424242",
      licenseExpiry: "2026-07-28",
      joiningDate: "2022-08-15",
      experienceYears: 4,
      status: "IN_TRANSIT",
      vehicleId: 2,
      emergencyContactName: "Neha Patel",
      emergencyContactRelationship: "Sister",
      emergencyContactPhone: "+91 9825012346",
      performanceScore: 88,
    },
  });

  const d3 = await prisma.driver.create({
    data: {
      id: 3,
      name: "Vikram Singh",
      phone: "+91 9099012345",
      email: "vikram.singh@transitops.in",
      address: "Baner, Pune, Maharashtra 411045",
      licenseNumber: "MH12-DL-030303",
      licenseExpiry: "2028-11-20",
      joiningDate: "2021-01-10",
      experienceYears: 10,
      status: "ON_REST",
      vehicleId: null,
      emergencyContactName: "Karan Singh",
      emergencyContactRelationship: "Brother",
      emergencyContactPhone: "+91 9099012346",
      performanceScore: 99,
    },
  });

  const d4 = await prisma.driver.create({
    data: {
      id: 4,
      name: "Rohit Verma",
      phone: "+91 9876543110",
      email: "rohit.verma@transitops.in",
      address: "Electronic City, Bengaluru, Karnataka 560100",
      licenseNumber: "KA05-DL-505050",
      licenseExpiry: "2026-06-30",
      joiningDate: "2023-05-01",
      experienceYears: 3,
      status: "SUSPENDED",
      vehicleId: null,
      emergencyContactName: "Anjali Verma",
      emergencyContactRelationship: "Spouse",
      emergencyContactPhone: "+91 9876543111",
      performanceScore: 72,
    },
  });

  // 3. Create Vehicles
  await prisma.vehicle.create({
    data: {
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
      status: "ACTIVE",
      driverId: 1,
    },
  });

  await prisma.vehicle.create({
    data: {
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
      status: "IN_SERVICE",
      driverId: 2,
    },
  });

  await prisma.vehicle.create({
    data: {
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
      status: "MAINTENANCE",
      driverId: null,
    },
  });

  await prisma.vehicle.create({
    data: {
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
      status: "OUT_OF_SERVICE",
      driverId: null,
    },
  });

  // 4. Create Trips
  await prisma.trip.create({
    data: {
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
      notes: "High priority delivery",
      status: "IN_TRANSIT",
      timelineJson: JSON.stringify([
        { status: "SCHEDULED", timestamp: "2026-07-11T16:00:00Z", description: "Trip scheduled by Fleet Manager" },
        { status: "IN_TRANSIT", timestamp: "2026-07-12T08:00:00Z", description: "Vehicle dispatched on route" }
      ]),
    },
  });

  await prisma.trip.create({
    data: {
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
      notes: "Standard dispatch",
      status: "SCHEDULED",
      timelineJson: JSON.stringify([
        { status: "SCHEDULED", timestamp: "2026-07-12T10:00:00Z", description: "Trip scheduled and resources assigned" }
      ]),
    },
  });

  // 5. Create MaintenanceLogs
  await prisma.maintenanceLog.create({
    data: {
      id: 1,
      vehicleId: 3,
      serviceType: "Engine Diagnostics",
      description: "Loss of throttle power reported during last route.",
      estimatedCost: 18500,
      scheduledDate: "2026-07-15",
      priority: "HIGH",
      status: "PENDING",
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      id: 2,
      vehicleId: 1,
      serviceType: "Routine Inspection",
      description: "Scheduled 50k oil and filter replacement.",
      estimatedCost: 4500,
      scheduledDate: "2026-07-20",
      priority: "LOW",
      status: "PENDING",
    },
  });

  // 6. Create DvirLogs
  await prisma.dvirLog.create({
    data: {
      id: 1,
      vehicleId: 1,
      driverId: 1,
      date: "2026-07-12",
      status: "PASS",
      remarks: "Brakes, lights, steering and tires check ok.",
    },
  });

  // 7. Create IncidentLogs
  await prisma.incidentLog.create({
    data: {
      id: 1,
      vehicleId: 2,
      driverId: 2,
      date: "2026-07-10",
      description: "Minor bumper scuff during terminal parking.",
      severity: "LOW",
      status: "RESOLVED",
    },
  });

  // 8. Create ExpenseLogs
  await prisma.expenseLog.create({
    data: {
      id: 1,
      date: "2026-07-11",
      vehicleId: 1,
      driverId: 1,
      amount: 8450,
      category: "Fuel",
      volumeLitres: 95,
      location: "HP Petrol Pump, SG Highway, Ahmedabad",
      notes: "Full tank fill-up",
    },
  });

  await prisma.expenseLog.create({
    data: {
      id: 2,
      date: "2026-07-12",
      vehicleId: 1,
      driverId: 1,
      amount: 1450,
      category: "Tolls",
      volumeLitres: null,
      location: "L&T Toll Booth, Ahmedabad-Vadodara Expressway",
      notes: "Expressway toll charges",
    },
  });

  console.log("Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding database: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
