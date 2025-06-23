import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Získat všechny nemovitosti
router.get("/", async (req, res) => {
  const nemovitosti = await prisma.nemovitost.findMany();
  res.json(nemovitosti);
});

// Přidat novou nemovitost
router.post("/", async (req, res) => {
  const { nazev, adresa } = req.body;
  try {
    const novaNemovitost = await prisma.nemovitost.create({
      data: { nazev, adresa }
    });
    res.json(novaNemovitost);
  } catch (err) {
    res.status(500).json({ error: "Chyba při vytváření nemovitosti" });
  }
});

export default router;
