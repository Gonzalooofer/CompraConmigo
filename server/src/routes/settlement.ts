import { Router } from 'express';
import Settlement from '../models/settlement';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const s = new Settlement(req.body);
    const saved = await s.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

router.get('/', async (req, res) => {
  const data = await Settlement.find();
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const s = await Settlement.findById(req.params.id);
  if (!s) return res.sendStatus(404);
  res.json(s);
});

router.put('/:id', async (req, res) => {
  const updated = await Settlement.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Settlement.findByIdAndDelete(req.params.id);
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
});

export default router;
