import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, requireRole } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// GET all expense logs
router.get("/", authenticateToken as any, async (req, res) => {
  try {
    const expenses = await prisma.expenseLog.findMany();
    return res.json(expenses);
  } catch (error) {
    console.error("Fetch expenses error: ", error);
    return res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

// POST add expense log
router.post("/", authenticateToken as any, requireRole(["MANAGER", "ANALYST", "DRIVER"]) as any, async (req, res) => {
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
  } catch (error: any) {
    console.error("Create expense error: ", error);
    return res.status(500).json({ error: "Failed to create expense: " + error.message });
  }
});

// DELETE expense log
router.delete("/:id", authenticateToken as any, requireRole(["MANAGER", "ANALYST"]) as any, async (req, res) => {
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
  } catch (error) {
    console.error("Delete expense error: ", error);
    return res.status(500).json({ error: "Failed to delete expense." });
  }
});

export default router;
