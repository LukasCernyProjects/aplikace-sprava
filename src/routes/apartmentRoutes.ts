import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Apartments API endpoint is working!' });
});

export default router;
