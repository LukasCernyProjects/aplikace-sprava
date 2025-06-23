import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Získání všech plateb
router.get("/", async (req, res) => {
  const platby = await prisma.platba.findMany({
    include: { najemnik: true }
  });
  res.json(platby);
});

// Přidání nové platby
router.post("/", async (req, res) => {
  const { castka, datum, najemnikId } = req.body;
  try {
    const novaPlatba = await prisma.platba.create({
      data: {
        castka,
        datum: new Date(datum),
        najemnikId
      }
    });
    res.json(novaPlatba);
  } catch (error) {
    res.status(500).json({ error: "Chyba při přidávání platby" });
  }
});

export default router;
