import express from "express";
import { PrismaClient } from "@prisma/client";
import { ukolSchema, ukolUpdateSchema } from "../validators/ukolValidator";
import { statusSchema } from "../validators/statusValidator";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";


const router = express.Router();
const prisma = new PrismaClient();

// Použijeme middleware authenticateToken pro všechny routy v tomto routeru
router.use(authenticateToken);

// ✅ Získání všech úkolů s možností filtrování podle nájemníka a/nebo stavu
router.get("/", async (req, res) => {
  console.log("🔥 Endpoint GET /api/ukoly zavolán");

  const najemnikId = req.query.najemnikId ? parseInt(req.query.najemnikId as string, 10) : undefined;
  const status = req.query.status as string | undefined;

  console.log("🔎 Přijatý status z query:", status);

  try {
    const ukoly = await prisma.ukol.findMany({
      where: {
        ...(najemnikId !== undefined && { najemnikId }),
        ...(status && { status }),
      },
      include: { najemnik: true },
    });

    res.json(ukoly);
  } catch (error) {
    console.error("❌ Chyba při získávání úkolů:", error);
    res.status(500).json({ error: "Chyba při získávání úkolů" });
  }
});

// Vytvoření nového úkolu s validací
router.post("/", async (req, res) => {
  const parseResult = ukolSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "Neplatná data",
      detail: parseResult.error.errors,
    });
  }

  const { popis, najemnikId, status } = parseResult.data;

  try {
    const novyUkol = await prisma.ukol.create({
      data: {
        popis,
        najemnikId,
        status,
      },
    });
    res.status(201).json(novyUkol);
  } catch (error) {
    console.error("❌ Chyba při vytváření úkolu:", error);
    res.status(500).json({ error: "Chyba při vytváření úkolu" });
  }
});

// Aktualizace úkolu podle ID s validací popisu a/nebo statusu
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parseResult = ukolUpdateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.format() });
  }

  try {
    const existujiciUkol = await prisma.ukol.findUnique({ where: { id } });

    if (!existujiciUkol) {
      return res.status(404).json({ error: `Úkol s ID ${id} neexistuje.` });
    }

    const aktualizovanyUkol = await prisma.ukol.update({
      where: { id },
      data: parseResult.data,
    });

    res.json(aktualizovanyUkol);
  } catch (error) {
    console.error("❌ Chyba při aktualizaci úkolu:", error);
    res.status(500).json({ error: "Chyba při aktualizaci úkolu" });
  }
});

// Změna statusu úkolu podle ID
router.put("/:id/status", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const parseResult = statusSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: "Neplatný formát statusu." });
  }

  const { status } = parseResult.data;

  try {
    const existujiciUkol = await prisma.ukol.findUnique({ where: { id } });

    if (!existujiciUkol) {
      return res.status(404).json({ error: `Úkol s ID ${id} neexistuje.` });
    }

    const aktualizovanyUkol = await prisma.ukol.update({
      where: { id },
      data: { status },
    });

    res.json(aktualizovanyUkol);
  } catch (error) {
    console.error("❌ Chyba při změně statusu úkolu:", error);
    res.status(500).json({ error: "Chyba při změně statusu úkolu" });
  }
});

// ✅ Smazání úkolu podle ID (pouze pro adminy)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  async (req, res) => {
    const id = parseInt(req.params.id, 10);

    try {
      await prisma.ukol.delete({
        where: { id },
      });
      res.json({ message: `Úkol s ID ${id} byl úspěšně smazán.` });
    } catch (error) {
      console.error("❌ Chyba při mazání úkolu:", error);
      res.status(500).json({ error: "Chyba při mazání úkolu" });
    }
  }
);


// ✅ Označení úkolu jako hotový (PATCH)
router.patch("/:id/dokoncit", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const existujiciUkol = await prisma.ukol.findUnique({
      where: { id },
    });

    if (!existujiciUkol) {
      return res.status(404).json({ error: `Úkol s ID ${id} nebyl nalezen.` });
    }

    const dokoncenyUkol = await prisma.ukol.update({
      where: { id },
      data: { status: "hotovo" },
    });

    res.json({
      message: `Úkol s ID ${id} byl označen jako hotový.`,
      ukol: dokoncenyUkol,
    });
  } catch (error) {
    console.error("❌ Chyba při označení úkolu jako hotový:", error);
    res.status(500).json({ error: "Chyba při označení úkolu jako hotový" });
  }
});

// Získání jednoho úkolu podle ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID musí být číslo." });
  }

  try {
    const ukol = await prisma.ukol.findUnique({
      where: { id },
      include: { najemnik: true },
    });

    if (!ukol) {
      return res.status(404).json({ error: `Úkol s ID ${id} nebyl nalezen.` });
    }

    res.json(ukol);
  } catch (error) {
    console.error("❌ Chyba při získávání úkolu podle ID:", error);
    res.status(500).json({ error: "Chyba při získávání úkolu" });
  }
});

export default router;
