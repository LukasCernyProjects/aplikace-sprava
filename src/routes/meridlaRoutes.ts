import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Získání všech měřidel
router.get("/", async (req, res) => {
  try {
    const meridla = await prisma.meridlo.findMany({
      include: { najemnik: true },
    });
    res.json(meridla);
  } catch (error) {
    res.status(500).json({ error: "Chyba při získávání měřidel" });
  }
});

// Přidání nového měřidla
router.post("/", async (req, res) => {
  const { typ, hodnota, najemnikId } = req.body;
  try {
    const noveMeridlo = await prisma.meridlo.create({
      data: {
        typ,
        hodnota,
        najemnikId,
      },
    });
    res.status(201).json(noveMeridlo);
  } catch (error) {
    res.status(500).json({ error: "Chyba při vytváření měřidla" });
  }
});

// Aktualizace měřidla podle ID
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { typ, hodnota } = req.body;

  try {
    const aktualizovaneMeridlo = await prisma.meridlo.update({
      where: { id },
      data: {
        typ,
        hodnota,
      },
    });
    res.json(aktualizovaneMeridlo);
  } catch (error) {
    res.status(500).json({ error: "Chyba při aktualizaci měřidla" });
  }
});

// Smazání měřidla
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    await prisma.meridlo.delete({
      where: { id },
    });
    res.json({ message: `Měřidlo s ID ${id} bylo úspěšně smazáno.` });
  } catch (error) {
    console.error("Chyba při mazání měřidla:", error);
    res.status(500).json({ error: "Chyba při mazání měřidla" });
  }
});


export default router;
