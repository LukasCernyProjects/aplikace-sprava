import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware'

const router = express.Router()
const prisma = new PrismaClient()

router.use(authenticateToken)

// GET: seznam bytů
router.get('/', async (req: AuthRequest, res) => {
  try {
    const apartments = await prisma.apartment.findMany({
      where: { ownerId: req.user!.userId },
      select: { id: true, address: true, parentId: true }
    })
    console.log('➡️ GET all apartments:', apartments)
    res.json(apartments)
  } catch (err) {
    console.error('❌ Chyba při načítání apartmentů:', err)
    res.status(500).json({ error: 'Nepodařilo se načíst apartmenty.' })
  }
})

// GET: detail bytu s parent/children
// apartmentsRoutes.ts

router.get('/:id', async (req: AuthRequest, res) => {
  const apartmentId = parseInt(req.params.id);
  const userId = req.user!.userId;
  console.log('➡️ GET apartment detail for ID:', apartmentId, 'and user:', userId);

  try {
    const apartment = await prisma.apartment.findFirst({
      where: { id: apartmentId, ownerId: userId },
      include: {
        parent: true,
        children: { select: { id: true, address: true } }
      }
    });

    if (!apartment) {
      console.warn('⚠️ Apartment not found or not owned:', apartmentId);
      return res.status(404).json({ error: 'Nenalezen.' });
    }

    console.log('✅ Detail loaded:', apartment);
    res.json(apartment);
  } catch (err) {
    console.error('❌ Chyba při načítání detailu:', err);
    res.status(500).json({ error: 'Nepodařilo se načíst apartment.' });
  }
});


// POST: nový byt
router.post('/', async (req: AuthRequest, res) => {
  const { address, city, postalCode, parentId } = req.body
  console.log('📥 POST new apartment:', req.body)
  try {
    const apartment = await prisma.apartment.create({
      data: {
        address,
        city,
        postalCode,
        parentId: parentId || null,
        ownerId: req.user!.userId
      }
    })
    res.status(201).json(apartment)
  } catch (err) {
    console.error('❌ Chyba při vytváření apartmentu:', err)
    res.status(500).json({ error: 'Nepodařilo se vytvořit apartment.' })
  }
})

// PUT: aktualizace základních údajů + technické + pojištění
router.put('/:id', async (req: AuthRequest, res) => {
  const apartmentId = parseInt(req.params.id);
  console.log('📥 PUT full update body:', req.body);

  const {
    address, city, postalCode,
    purchasePrice, currentValue, purchaseDate, parentId,
    insuranceAnnualPrice, insuranceNumber, insuranceNote,
    ownershipType, buildingType, buildingConstruction: structure,
    heatingType: heating, area,
    eicCode, eanCode,
    floorNumber: floorLocation,
    totalFloorsAbove: floorsAbove,
    totalFloorsBelow: floorsBelow,
    hasElevator, hasBalcony, hasLoggia, hasTerrace, hasStorage,
    technicalNote
  } = req.body;

  try {
    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!apt || apt.ownerId !== req.user!.userId) {
      return res.status(403).json({ error: 'No permission.' });
    }

    const parsedParentId = parentId ? Number(parentId) : null;
    const parsedDate = purchaseDate ? new Date(purchaseDate) : null;
    console.log('📅 Parsed purchaseDate:', purchaseDate, '->', parsedDate);

    const updated = await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
        address,
        city,
        postalCode,
        purchasePrice: purchasePrice !== undefined ? Number(purchasePrice) : null,
        currentValue: currentValue !== undefined ? Number(currentValue) : null,
        purchaseDate: parsedDate,
        ...(parsedParentId !== null
        ? { parent: { connect: { id: parsedParentId } } }
        : { parent: { disconnect: true } }),
        insuranceAnnualPrice: insuranceAnnualPrice !== undefined ? Number(insuranceAnnualPrice) : null,
        insuranceNumber: insuranceNumber ?? null,
        insuranceNote: insuranceNote ?? null,
        ownershipType: ownershipType ?? null,
        buildingType: buildingType ?? null,
        buildingConstruction: structure ?? null,
        heating: heating ?? null,
        area: area !== undefined ? Number(area) : null,
        eicCode: eicCode ?? null,
        eanCode: eanCode ?? null,
        floorLocation: floorLocation !== undefined ? Number(floorLocation) : null,
        floorsAbove: floorsAbove !== undefined ? Number(floorsAbove) : null,
        floorsBelow: floorsBelow !== undefined ? Number(floorsBelow) : null,
        hasElevator: !!hasElevator,
        hasBalcony: !!hasBalcony,
        hasLoggia: !!hasLoggia,
        hasTerrace: !!hasTerrace,
        hasStorage: !!hasStorage,
        technicalNote: technicalNote ?? null
      }
    });

    console.log('✅ Updated apartment:', updated);
    res.json(updated);
  } catch (err) {
    console.error('❌ Aktualizace selhala:', err);
    res.status(500).json({ error: 'Nepodařilo se aktualizovat.' });
  }
});


// PUT: aktualizace pouze technických info
router.put('/:id/technical', async (req: AuthRequest, res) => {
  const apartmentId = Number(req.params.id)
  console.log('📥 TECHNICAL PUT for ID', apartmentId, 'body:', req.body)

const {
  ownershipType, buildingType, buildingConstruction, heatingType, area,
  eicCode, eanCode, floorNumber, totalFloorsAbove, totalFloorsBelow,
  hasElevator, hasBalcony, hasLoggia, hasTerrace, hasStorage, technicalNote
} = req.body;

  try {
    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId } })
    if (!apt || apt.ownerId !== req.user!.userId) {
      console.error('❌ FORBIDDEN – userId', req.user!.userId, 'apt.ownerId', apt?.ownerId)
      return res.status(403).json({ error: 'Nemáš oprávnění.' })
    }

    const updated = await prisma.apartment.update({
      where: { id: apartmentId },
      data: {
  ownershipType: ownershipType ?? null,
  buildingType: buildingType ?? null,
  buildingConstruction: buildingConstruction ?? null, // ✅
  heatingType: heatingType ?? null,                   // ✅
  area: area ?? null,
  eicCode: eicCode ?? null,
  eanCode: eanCode ?? null,
  floorNumber: floorNumber ?? null,                   // ✅
  totalFloorsAbove: totalFloorsAbove ?? null,         // ✅
  totalFloorsBelow: totalFloorsBelow ?? null,         // ✅
  hasElevator, hasBalcony, hasLoggia, hasTerrace, hasStorage,
  technicalNote: technicalNote ?? null
}

    })

    console.log('✅ Technical saved:', updated)
    res.json(updated)
  } catch (err) {
    console.error('❌ Chyba při technických datech:', err)
    res.status(500).json({ error: 'Nepodařilo se uložit technické informace.' })
  }
})



export default router
