import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const najemnici = await prisma.najemnik.findMany({
    include: { nemovitost: true }
  });
  res.json(najemnici);
});

router.post("/", async (req, res) => {
  const { jmeno, email, nemovitostId } = req.body;
  const novyNajemnik = await prisma.najemnik.create({
    data: {
      jmeno,
      email,
      nemovitostId
    }
  });
  res.json(novyNajemnik);
});

export default router;
