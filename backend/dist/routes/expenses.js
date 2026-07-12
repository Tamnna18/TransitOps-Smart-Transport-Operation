"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET all expense logs
router.get("/", authMiddleware_1.authenticateToken, async (req, res) => {
    try {
        const expenses = await prisma.expenseLog.findMany();
        return res.json(expenses);
    }
    catch (error) {
        console.error("Fetch expenses error: ", error);
        return res.status(500).json({ error: "Failed to fetch expenses." });
    }
});
// POST add expense log
router.post("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(["MANAGER", "ANALYST", "DRIVER"]), async (req, res) => {
    const data = req.body;
    try {
        const expense = await prisma.expenseLog.create({
            data: {
                date: data.date || new Date().toISOString().split("T")[0],
                vehicleId: Number(data.vehicleId),
                driverId: Number(data.driverId),
                amount: Number(data.amount),
                category: data.category,
                volumeLitres: data.volumeLitres !== undefined && data.volumeLitres !== null ? Number(data.volumeLitres) : null,
                location: data.location,
                notes: data.notes || "",
            },
        });
        return res.status(201).json(expense);
    }
    catch (error) {
        console.error("Create expense error: ", error);
        return res.status(500).json({ error: "Failed to create expense: " + error.message });
    }
});
// DELETE expense log
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.requireRole)(["MANAGER", "ANALYST"]), async (req, res) => {
    const { id } = req.params;
    try {
        const expense = await prisma.expenseLog.findUnique({ where: { id: Number(id) } });
        if (!expense) {
            return res.status(404).json({ error: "Expense not found." });
        }
        await prisma.expenseLog.delete({
            where: { id: Number(id) },
        });
        return res.json({ success: true, message: "Expense deleted successfully." });
    }
    catch (error) {
        console.error("Delete expense error: ", error);
        return res.status(500).json({ error: "Failed to delete expense." });
    }
});
exports.default = router;
