import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// GET all maintenance logs
router.get("/", authenticateToken as any, async (req, res) => {
  try {
    const logs = await prisma.maintenanceLog.findMany();
    return res.json(logs);
  } catch (error) {
    console.error("Fetch maintenance logs error: ", error);
    return res.status(500).json({ error: "Failed to fetch maintenance logs." });
  }
});

// POST create maintenance log
router.post("/", authenticateToken as any, requireRole(["MANAGER", "SAFETY", "DRIVER"]) as any, async (req, res) => {
  const data = req.body;
  try {
    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: Number(data.vehicleId),
        serviceType: data.serviceType,
        description: data.description,
        estimatedCost: Number(data.estimatedCost),
        scheduledDate: data.scheduledDate,
        priority: data.priority || "MEDIUM",
        status: "PENDING",
      },
    });

    // Update vehicle status to MAINTENANCE
    await prisma.vehicle.update({
      where: { id: Number(data.vehicleId) },
      data: { status: "MAINTENANCE" },
    });

    return res.status(201).json(log);
  } catch (error: any) {
    console.error("Create maintenance log error: ", error);
    return res.status(500).json({ error: "Failed to create maintenance log: " + error.message });
  }
});

// PUT resolve maintenance log
router.put("/:id/resolve", authenticateToken as any, requireRole(["MANAGER", "SAFETY"]) as any, async (req, res) => {
  const { id } = req.params;
  const { actualCost } = req.body;
  try {
    const log = await prisma.maintenanceLog.findUnique({ where: { id: Number(id) } });
    if (!log) {
      return res.status(404).json({ error: "Maintenance log not found." });
    }

    const updatedLog = await prisma.maintenanceLog.update({
      where: { id: Number(id) },
      data: { status: "COMPLETED" },
    });

    // Log the actual cost as a vehicle maintenance expense
    await prisma.expenseLog.create({
      data: {
        date: new Date().toISOString().split("T")[0],
        vehicleId: log.vehicleId,
        driverId: 1, // Default to manager/admin index
        amount: Number(actualCost || log.estimatedCost),
        category: "Maintenance",
        volumeLitres: null,
        location: "Service Center",
        notes: `Repair invoice for service log #${log.id} (${log.serviceType})`,
      },
    });

    // Reset vehicle status back to ACTIVE
    const vehicle = await prisma.vehicle.findUnique({ where: { id: log.vehicleId } });
    if (vehicle) {
      const nextStatus = vehicle.driverId ? "IN_SERVICE" : "ACTIVE";
      await prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: nextStatus },
      });
    }

    return res.json(updatedLog);
  } catch (error: any) {
    console.error("Resolve maintenance error: ", error);
    return res.status(500).json({ error: "Failed to resolve maintenance: " + error.message });
  }
});

// GET all DVIR inspections
router.get("/dvir", authenticateToken as any, async (req, res) => {
  try {
    const dvirs = await prisma.dvirLog.findMany();
    return res.json(dvirs);
  } catch (error) {
    console.error("Fetch DVIR logs error: ", error);
    return res.status(500).json({ error: "Failed to fetch DVIR checks." });
  }
});

// POST submit DVIR checklist
router.post("/dvir", authenticateToken as any, requireRole(["MANAGER", "SAFETY", "DRIVER"]) as any, async (req, res) => {
  const data = req.body;
  try {
    const dvir = await prisma.dvirLog.create({
      data: {
        vehicleId: Number(data.vehicleId),
        driverId: Number(data.driverId),
        date: data.date || new Date().toISOString().split("T")[0],
        status: data.status, // PASS or FAIL
        remarks: data.remarks || "",
      },
    });

    // If checklist failed, update vehicle status to OUT_OF_SERVICE
    if (data.status === "FAIL") {
      await prisma.vehicle.update({
        where: { id: Number(data.vehicleId) },
        data: { status: "OUT_OF_SERVICE" },
      });
    }

    return res.status(201).json(dvir);
  } catch (error: any) {
    console.error("Create DVIR error: ", error);
    return res.status(500).json({ error: "Failed to submit DVIR: " + error.message });
  }
});

// GET all incident logs
router.get("/incidents", authenticateToken as any, async (req, res) => {
  try {
    const incidents = await prisma.incidentLog.findMany();
    return res.json(incidents);
  } catch (error) {
    console.error("Fetch incidents error: ", error);
    return res.status(500).json({ error: "Failed to fetch incidents." });
  }
});

// POST submit incident log
router.post("/incidents", authenticateToken as any, requireRole(["MANAGER", "SAFETY", "DRIVER"]) as any, async (req, res) => {
  const data = req.body;
  try {
    const incident = await prisma.incidentLog.create({
      data: {
        vehicleId: Number(data.vehicleId),
        driverId: Number(data.driverId),
        date: data.date || new Date().toISOString().split("T")[0],
        description: data.description,
        severity: data.severity || "LOW",
        status: "UNDER_REVIEW",
      },
    });

    return res.status(201).json(incident);
  } catch (error: any) {
    console.error("Create incident error: ", error);
    return res.status(500).json({ error: "Failed to submit incident: " + error.message });
  }
});

export default router;
