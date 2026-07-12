import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// GET all trips
router.get("/", authenticateToken as any, async (req, res) => {
  try {
    const trips = await prisma.trip.findMany();
    // Parse timelineJson string back into object before returning
    const parsedTrips = trips.map((t) => ({
      ...t,
      timeline: JSON.parse(t.timelineJson),
    }));
    return res.json(parsedTrips);
  } catch (error) {
    console.error("Fetch trips error: ", error);
    return res.status(500).json({ error: "Failed to fetch trips." });
  }
});

// POST add trip
router.post("/", authenticateToken as any, requireRole(["MANAGER"]) as any, async (req, res) => {
  const data = req.body;
  try {
    const timeline = [
      {
        status: "SCHEDULED",
        timestamp: new Date().toISOString(),
        description: "Trip scheduled by Fleet Manager.",
      },
    ];

    const newTrip = await prisma.trip.create({
      data: {
        tripNumber: data.tripNumber || `TO-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleId: Number(data.vehicleId),
        driverId: Number(data.driverId),
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate,
        departureTime: data.departureTime,
        estimatedArrivalDate: data.estimatedArrivalDate,
        estimatedArrivalTime: data.estimatedArrivalTime,
        cargoType: data.cargoType,
        cargoWeight: Number(data.cargoWeight),
        priority: data.priority || "MEDIUM",
        notes: data.notes || "",
        status: "SCHEDULED",
        timelineJson: JSON.stringify(timeline),
      },
    });

    return res.status(201).json({
      ...newTrip,
      timeline,
    });
  } catch (error: any) {
    console.error("Create trip error: ", error);
    return res.status(500).json({ error: "Failed to create trip: " + error.message });
  }
});

// PUT update trip (general editing)
router.put("/:id", authenticateToken as any, requireRole(["MANAGER"]) as any, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const existing = await prisma.trip.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return res.status(404).json({ error: "Trip not found." });
    }

    const updated = await prisma.trip.update({
      where: { id: Number(id) },
      data: {
        vehicleId: data.vehicleId !== undefined ? Number(data.vehicleId) : undefined,
        driverId: data.driverId !== undefined ? Number(data.driverId) : undefined,
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate,
        departureTime: data.departureTime,
        estimatedArrivalDate: data.estimatedArrivalDate,
        estimatedArrivalTime: data.estimatedArrivalTime,
        cargoType: data.cargoType,
        cargoWeight: data.cargoWeight !== undefined ? Number(data.cargoWeight) : undefined,
        priority: data.priority,
        notes: data.notes,
        status: data.status,
        timelineJson: data.timeline ? JSON.stringify(data.timeline) : undefined,
      },
    });

    return res.json({
      ...updated,
      timeline: JSON.parse(updated.timelineJson),
    });
  } catch (error: any) {
    console.error("Update trip error: ", error);
    return res.status(500).json({ error: "Failed to update trip: " + error.message });
  }
});

// PUT dispatch trip (triggers transit state locks)
router.put("/:id/dispatch", authenticateToken as any, requireRole(["MANAGER", "DRIVER"]) as any, async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(id) } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    const currentTimeline = JSON.parse(trip.timelineJson);
    const updatedTimeline = [
      ...currentTimeline,
      {
        status: "IN_TRANSIT",
        timestamp: new Date().toISOString(),
        description: "Vehicle dispatched on route.",
      },
    ];

    // Transaction to update trip state, vehicle status, and driver status atomic
    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id: Number(id) },
        data: {
          status: "IN_TRANSIT",
          timelineJson: JSON.stringify(updatedTimeline),
        },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "IN_SERVICE" },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "IN_TRANSIT" },
      }),
    ]);

    return res.json({
      ...updatedTrip,
      timeline: updatedTimeline,
    });
  } catch (error: any) {
    console.error("Dispatch trip error: ", error);
    return res.status(500).json({ error: "Failed to dispatch trip: " + error.message });
  }
});

// PUT complete trip (releases state locks, saves odometer mileage, uses final fuel liters)
router.put("/:id/complete", authenticateToken as any, requireRole(["MANAGER", "DRIVER"]) as any, async (req, res) => {
  const { id } = req.params;
  const { distanceCovered, fuelUsed, remarks, completedTime } = req.body;
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(id) } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    const currentTimeline = JSON.parse(trip.timelineJson);
    const updatedTimeline = [
      ...currentTimeline,
      {
        status: "COMPLETED",
        timestamp: completedTime || new Date().toISOString(),
        description: `Trip completed. Distance covered: ${distanceCovered} km. Remarks: ${remarks}`,
      },
    ];

    // Update vehicle odometer
    const vehicle = await prisma.vehicle.findUnique({ where: { id: trip.vehicleId } });
    const newOdometer = vehicle ? vehicle.currentOdometer + Number(distanceCovered) : undefined;

    // Transaction to close trip, set driver/vehicle free, and log final stats
    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id: Number(id) },
        data: {
          status: "COMPLETED",
          distanceCovered: Number(distanceCovered),
          fuelUsed: Number(fuelUsed),
          remarks: remarks || "",
          completedTime: completedTime || new Date().toISOString(),
          timelineJson: JSON.stringify(updatedTimeline),
        },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: "ACTIVE",
          currentOdometer: newOdometer,
        },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      }),
    ]);

    // Create an automatic fuel log for the completed fuel used
    if (Number(fuelUsed) > 0) {
      await prisma.expenseLog.create({
        data: {
          date: completedTime ? completedTime.split("T")[0] : new Date().toISOString().split("T")[0],
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          amount: Number(fuelUsed) * 98, // Estimated standard fuel price in India: INR 98/L
          category: "Fuel",
          volumeLitres: Number(fuelUsed),
          location: trip.destination,
          notes: `Auto-logged from completed trip #${trip.tripNumber}`,
        },
      });
    }

    return res.json({
      ...updatedTrip,
      timeline: updatedTimeline,
    });
  } catch (error: any) {
    console.error("Complete trip error: ", error);
    return res.status(500).json({ error: "Failed to complete trip: " + error.message });
  }
});

// PUT cancel trip (releases state locks)
router.put("/:id/cancel", authenticateToken as any, requireRole(["MANAGER", "DRIVER"]) as any, async (req, res) => {
  const { id } = req.params;
  const { cancelReason, cancelComment } = req.body;
  try {
    const trip = await prisma.trip.findUnique({ where: { id: Number(id) } });
    if (!trip) {
      return res.status(404).json({ error: "Trip not found." });
    }

    const currentTimeline = JSON.parse(trip.timelineJson);
    const updatedTimeline = [
      ...currentTimeline,
      {
        status: "CANCELLED",
        timestamp: new Date().toISOString(),
        description: `Trip cancelled. Reason: ${cancelReason}. Comment: ${cancelComment}`,
      },
    ];

    // Transaction to cancel trip, set driver/vehicle free
    const [updatedTrip] = await prisma.$transaction([
      prisma.trip.update({
        where: { id: Number(id) },
        data: {
          status: "CANCELLED",
          cancelReason,
          cancelComment,
          timelineJson: JSON.stringify(updatedTimeline),
        },
      }),
      prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "ACTIVE" },
      }),
      prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      }),
    ]);

    return res.json({
      ...updatedTrip,
      timeline: updatedTimeline,
    });
  } catch (error: any) {
    console.error("Cancel trip error: ", error);
    return res.status(500).json({ error: "Failed to cancel trip: " + error.message });
  }
});

export default router;
