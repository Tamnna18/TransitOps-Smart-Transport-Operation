"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret_transitops_token_key_standard_9942";
// Login endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
            return res.status(401).json({ error: "Invalid email or password." });
        }
        // Sign Token
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        }, JWT_SECRET, { expiresIn: "8h" });
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
            },
        });
    }
    catch (error) {
        console.error("Login Error: ", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});
// Register endpoint
router.post("/register", async (req, res) => {
    const { email, password, role, name } = req.body;
    if (!email || !password || !role || !name) {
        return res.status(400).json({ error: "All fields (email, password, role, name) are required." });
    }
    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered." });
        }
        const passwordHash = bcrypt.hashSync(password, 10);
        const newUser = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
                name,
            },
        });
        // Auto-create Driver record if driver role
        if (role === "DRIVER") {
            await prisma.driver.create({
                data: {
                    name,
                    phone: "+91 9876543210",
                    email,
                    address: "SG Highway, Ahmedabad",
                    licenseNumber: "GJ01-DL-" + Math.floor(100000 + Math.random() * 900000),
                    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    joiningDate: new Date().toISOString().split("T")[0],
                    experienceYears: 1,
                    status: "AVAILABLE",
                    emergencyContactName: "Emergency Contact",
                    emergencyContactRelationship: "Friend",
                    emergencyContactPhone: "+91 9876543210",
                },
            });
        }
        // Sign Token
        const token = jwt.sign({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
        }, JWT_SECRET, { expiresIn: "8h" });
        return res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                name: newUser.name,
            },
        });
    }
    catch (error) {
        console.error("Register Error: ", error);
        return res.status(500).json({ error: "Failed to register user." });
    }
});
// Me endpoint
router.get("/me", authMiddleware_1.authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not authenticated." });
    }
    return res.json({ user: req.user });
});
exports.default = router;
