"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET all vehicles
router.get("/", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany();
        return res.json(vehicles);
    }
    catch (error) {
        console.error("Fetch vehicles error: ", error);
        return res.status(500).json({ error: "Failed to fetch vehicles." });
    }
});
// POST add vehicle
router.post("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(["MANAGER", "SAFETY"]), async (req, res) => {
    const data = req.body;
    try {
        const newVehicle = await prisma.vehicle.create({
            data: {
                vin: data.vin,
                licensePlate: data.licensePlate,
                name: data.name,
                make: data.make,
                model: data.model,
                year: Number(data.year),
                capacity: Number(data.capacity),
                fuelType: data.fuelType,
                purchaseDate: data.purchaseDate,
                insuranceExpiry: data.insuranceExpiry,
                fitnessExpiry: data.fitnessExpiry,
                permitExpiry: data.permitExpiry,
                currentOdometer: Number(data.currentOdometer),
                status: data.status || "ACTIVE",
                driverId: data.driverId ? Number(data.driverId) : null,
            },
        });
        // If driverId is provided, assign vehicleId to driver too
        if (data.driverId) {
            await prisma.driver.update({
                where: { id: Number(data.driverId) },
                data: { vehicleId: newVehicle.id },
            });
        }
        return res.status(201).json(newVehicle);
    }
    catch (error) {
        console.error("Create vehicle error: ", error);
        return res.status(500).json({ error: "Failed to create vehicle: " + error.message });
    }
});
// PUT update vehicle
router.put("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(["MANAGER", "SAFETY"]), async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const oldVehicle = await prisma.vehicle.findUnique({ where: { id: Number(id) } });
        if (!oldVehicle) {
            return res.status(404).json({ error: "Vehicle not found." });
        }
        const updatedVehicle = await prisma.vehicle.update({
            where: { id: Number(id) },
            data: {
                vin: data.vin,
                licensePlate: data.licensePlate,
                name: data.name,
                make: data.make,
                model: data.model,
                year: data.year !== undefined ? Number(data.year) : undefined,
                capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
                fuelType: data.fuelType,
                purchaseDate: data.purchaseDate,
                insuranceExpiry: data.insuranceExpiry,
                fitnessExpiry: data.fitnessExpiry,
                permitExpiry: data.permitExpiry,
                currentOdometer: data.currentOdometer !== undefined ? Number(data.currentOdometer) : undefined,
                status: data.status,
                driverId: data.driverId !== undefined ? (data.driverId ? Number(data.driverId) : null) : undefined,
            },
        });
        // Handle bidirectional driver assignment changes if driverId updated
        if (data.driverId !== undefined && oldVehicle.driverId !== data.driverId) {
            // Unassign old driver
            if (oldVehicle.driverId) {
                await prisma.driver.update({
                    where: { id: oldVehicle.driverId },
                    data: { vehicleId: null },
                });
            }
            // Assign new driver
            if (data.driverId) {
                await prisma.driver.update({
                    where: { id: Number(data.driverId) },
                    data: { vehicleId: updatedVehicle.id },
                });
            }
        }
        return res.json(updatedVehicle);
    }
    catch (error) {
        console.error("Update vehicle error: ", error);
        return res.status(500).json({ error: "Failed to update vehicle: " + error.message });
    }
});
// DELETE vehicle
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(["MANAGER"]), async (req, res) => {
    const { id } = req.params;
    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(id) } });
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found." });
        }
        // Unassign driver if any before deleting
        if (vehicle.driverId) {
            await prisma.driver.update({
                where: { id: vehicle.driverId },
                data: { vehicleId: null },
            });
        }
        await prisma.vehicle.delete({
            where: { id: Number(id) },
        });
        return res.json({ success: true, message: "Vehicle deleted successfully." });
    }
    catch (error) {
        console.error("Delete vehicle error: ", error);
        return res.status(500).json({ error: "Failed to delete vehicle." });
    }
});
// POST assign driver
router.post("/:id/assign", authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(["MANAGER"]), async (req, res) => {
    const { id } = req.params;
    const { driverId } = req.body; // Can be null/undefined to unassign
    try {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: Number(id) } });
        if (!vehicle) {
            return res.status(404).json({ error: "Vehicle not found." });
        }
        const oldDriverId = vehicle.driverId;
        const updatedVehicle = await prisma.vehicle.update({
            where: { id: Number(id) },
            data: { driverId: driverId ? Number(driverId) : null },
        });
        // Unassign old driver
        if (oldDriverId) {
            await prisma.driver.update({
                where: { id: oldDriverId },
                data: { vehicleId: null },
            });
        }
        // Assign new driver
        if (driverId) {
            await prisma.driver.update({
                where: { id: Number(driverId) },
                data: { vehicleId: Number(id) },
            });
        }
        return res.json(updatedVehicle);
    }
    catch (error) {
        console.error("Assign driver error: ", error);
        return res.status(500).json({ error: "Failed to assign driver." });
    }
});
exports.default = router;
