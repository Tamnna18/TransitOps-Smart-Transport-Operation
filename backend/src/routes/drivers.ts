import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// GET all drivers
router.get("/", authenticateToken as any, async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany();
    // Return standard nested structure to match frontend expectations
    const driversWithNestedEmergency = drivers.map((d) => ({
      id: d.id,
      name: d.name,
      phone: d.phone,
      email: d.email,
      address: d.address,
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry,
      joiningDate: d.joiningDate,
      experienceYears: d.experienceYears,
      status: d.status,
      vehicleId: d.vehicleId,
      emergencyContact: {
        name: d.emergencyContactName,
        relationship: d.emergencyContactRelationship,
        phone: d.emergencyContactPhone,
      },
      performanceScore: d.performanceScore,
    }));
    return res.json(driversWithNestedEmergency);
  } catch (error) {
    console.error("Fetch drivers error: ", error);
    return res.status(500).json({ error: "Failed to fetch drivers." });
  }
});

// POST add driver
router.post("/", authenticateToken as any, requireRole(["MANAGER", "SAFETY"]) as any, async (req, res) => {
  const data = req.body;
  try {
    const newDriver = await prisma.driver.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        joiningDate: data.joiningDate,
        experienceYears: Number(data.experienceYears),
        status: data.status || "AVAILABLE",
        vehicleId: data.vehicleId ? Number(data.vehicleId) : null,
        emergencyContactName: data.emergencyContact?.name || data.emergencyContactName || "",
        emergencyContactRelationship: data.emergencyContact?.relationship || data.emergencyContactRelationship || "",
        emergencyContactPhone: data.emergencyContact?.phone || data.emergencyContactPhone || "",
        performanceScore: data.performanceScore !== undefined ? Number(data.performanceScore) : 90,
      },
    });

    // Handle bidirectional vehicle assignment
    if (data.vehicleId) {
      await prisma.vehicle.update({
        where: { id: Number(data.vehicleId) },
        data: { driverId: newDriver.id },
      });
    }

    // Format output
    return res.status(201).json({
      ...newDriver,
      emergencyContact: {
        name: newDriver.emergencyContactName,
        relationship: newDriver.emergencyContactRelationship,
        phone: newDriver.emergencyContactPhone,
      },
    });
  } catch (error: any) {
    console.error("Create driver error: ", error);
    return res.status(500).json({ error: "Failed to create driver: " + error.message });
  }
});

// PUT update driver
router.put("/:id", authenticateToken as any, requireRole(["MANAGER", "SAFETY"]) as any, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const oldDriver = await prisma.driver.findUnique({ where: { id: Number(id) } });
    if (!oldDriver) {
      return res.status(404).json({ error: "Driver not found." });
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        joiningDate: data.joiningDate,
        experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : undefined,
        status: data.status,
        vehicleId: data.vehicleId !== undefined ? (data.vehicleId ? Number(data.vehicleId) : null) : undefined,
        emergencyContactName: data.emergencyContact?.name !== undefined ? data.emergencyContact.name : undefined,
        emergencyContactRelationship: data.emergencyContact?.relationship !== undefined ? data.emergencyContact.relationship : undefined,
        emergencyContactPhone: data.emergencyContact?.phone !== undefined ? data.emergencyContact.phone : undefined,
        performanceScore: data.performanceScore !== undefined ? Number(data.performanceScore) : undefined,
      },
    });

    // Handle bidirectional vehicle assignment changes
    if (data.vehicleId !== undefined && oldDriver.vehicleId !== data.vehicleId) {
      // Unassign old vehicle
      if (oldDriver.vehicleId) {
        await prisma.vehicle.update({
          where: { id: oldDriver.vehicleId },
          data: { driverId: null },
        });
      }
      // Assign new vehicle
      if (data.vehicleId) {
        await prisma.vehicle.update({
          where: { id: Number(data.vehicleId) },
          data: { driverId: updatedDriver.id },
        });
      }
    }

    return res.json({
      ...updatedDriver,
      emergencyContact: {
        name: updatedDriver.emergencyContactName,
        relationship: updatedDriver.emergencyContactRelationship,
        phone: updatedDriver.emergencyContactPhone,
      },
    });
  } catch (error: any) {
    console.error("Update driver error: ", error);
    return res.status(500).json({ error: "Failed to update driver: " + error.message });
  }
});

// DELETE driver
router.delete("/:id", authenticateToken as any, requireRole(["MANAGER"]) as any, async (req, res) => {
  const { id } = req.params;
  try {
    const driver = await prisma.driver.findUnique({ where: { id: Number(id) } });
    if (!driver) {
      return res.status(404).json({ error: "Driver not found." });
    }

    // Unassign vehicle before deleting
    if (driver.vehicleId) {
      await prisma.vehicle.update({
        where: { id: driver.vehicleId },
        data: { driverId: null },
      });
    }

    await prisma.driver.delete({
      where: { id: Number(id) },
    });

    return res.json({ success: true, message: "Driver deleted successfully." });
  } catch (error) {
    console.error("Delete driver error: ", error);
    return res.status(500).json({ error: "Failed to delete driver." });
  }
});

export default router;
