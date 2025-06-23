import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest, authorizeRole } from "../middleware/authMiddleware";
import { sendResetEmail } from '../utils/email';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "tajnyklic";

// Registrace uživatele
router.post("/register", async (req: AuthRequest, res) => {
  const { email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "admin"
      },
    });
    res.status(201).json({ message: "Uživatel vytvořen" });
  } catch (error) {
    res.status(500).json({ error: "Chyba při registraci" });
  }
});

// Přihlášení uživatele
router.post("/login", async (req: AuthRequest, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Neplatné přihlašovací údaje" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: "Neplatné přihlašovací údaje" });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});


router.post("/change-password", authenticateToken, async (req: AuthRequest, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;

  // 🔍 DEBUG logy:
  console.log("🔐 REQ BODY:", { oldPassword, newPassword });
  console.log("🔐 USER ID from token:", userId);

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Všechna pole jsou povinná." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "Uživatel nenalezen." });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Původní heslo je nesprávné." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return res.json({ message: "Heslo bylo úspěšně změněno." });
  } catch (e) {
    console.error("❌ Chyba při změně hesla:", e);
    return res.status(500).json({ error: "Chyba serveru při změně hesla." });
  }
});


// Aktualizace profilu uživatele
router.get("/profile", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(400).json({ error: "Chybějící ID uživatele v tokenu." });
  }

  try {
  console.log("🔍 USER ID from token:", userId); // debug 1

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log("📦 User from DB:", user); // 🔧 debug 2 — výstup z DB

  if (!user) {
    return res.status(404).json({ error: "Uživatel nenalezen." });
  }

  res.json(user);
} catch (error) {
  console.error("❌ Chyba při získávání profilu:", error);
  res.status(500).json({ error: "Chyba při získávání profilu." });
}

});

// Získání seznamu všech uživatelů (pouze pro adminy)
router.get("/users", authenticateToken, authorizeRole(["admin"]), async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    res.json({ users });
  } catch (error) {
    console.error("❌ Chyba při získávání uživatelů:", error);
    res.status(500).json({ error: "Chyba při získávání uživatelů." });
  }
});

// Smazání uživatele (pouze pro adminy)
router.delete("/users/:id", authenticateToken, authorizeRole(["admin"]), async (req: AuthRequest, res) => {
  const targetUserId = parseInt(req.params.id);
  const currentUserId = req.user?.userId;

  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: "Neplatné ID uživatele." });
  }

  if (targetUserId === currentUserId) {
    return res.status(400).json({ error: "Nemůžeš smazat sám sebe." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen." });
    }

    await prisma.user.delete({ where: { id: targetUserId } });

    res.json({ message: "Uživatel byl úspěšně smazán." });
  } catch (error) {
    console.error("❌ Chyba při mazání uživatele:", error);
    res.status(500).json({ error: "Chyba serveru při mazání uživatele." });
  }
});

// Reset hesla uživatele (pouze pro adminy)
router.post("/users/:id/reset-password", authenticateToken, authorizeRole(["admin"]), async (req: AuthRequest, res) => {
  const targetUserId = parseInt(req.params.id);
  const { newPassword } = req.body;

  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: "Neplatné ID uživatele." });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Nové heslo musí mít alespoň 6 znaků." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });

    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Heslo bylo úspěšně resetováno." });
  } catch (error) {
    console.error("❌ Chyba při resetování hesla:", error);
    res.status(500).json({ error: "Chyba serveru při resetování hesla." });
  }
});

// Změna role uživatele (pouze pro adminy)
router.put("/users/:id/role", authenticateToken, authorizeRole(["admin"]), async (req: AuthRequest, res) => {
  const targetUserId = parseInt(req.params.id);
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ error: "Neplatná role. Povolené role jsou 'user' a 'admin'." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });

    res.json({
      message: "Role uživatele byla úspěšně změněna.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Chyba při změně role uživatele:", error);
    res.status(500).json({ error: "Chyba serveru při změně role uživatele." });
  }
});

// Aktivace/Deaktivace uživatelského účtu (pouze pro adminy)
router.put("/users/:id/activate", authenticateToken, authorizeRole(["admin"]), async (req: AuthRequest, res) => {
  const targetUserId = parseInt(req.params.id);
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ error: "Pole 'isActive' musí být typu boolean." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      return res.status(404).json({ error: "Uživatel nenalezen." });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
    });

    res.json({
      message: `Uživatel byl úspěšně ${isActive ? "aktivován" : "deaktivován"}.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Chyba při změně stavu účtu:", error);
    res.status(500).json({ error: "Chyba serveru při změně stavu účtu." });
  }
});

// zmena hesla na email uzivatel

router.post('/forgot-password', async (req: AuthRequest, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Uživatel nenalezen.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);

    res.json({ message: 'E-mail s odkazem pro reset hesla byl odeslán.' });
  } catch (error) {
    console.error('Chyba při žádosti o reset hesla:', error);
    res.status(500).json({ error: 'Chyba serveru.' });
  }
});

// reset hesla uzivate tvorba

router.post('/reset-password', async (req: AuthRequest, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Heslo bylo úspěšně resetováno.' });
  } catch (error) {
    console.error('Chyba při resetu hesla:', error);
    res.status(400).json({ error: 'Neplatný nebo expirovaný token.' });
  }
});

export default router;
