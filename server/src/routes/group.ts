import { Router } from 'express';
import Group from '../models/group';

const router = Router();

// CRUD similar to user
router.post('/', async (req, res) => {
  try {
    const group = new Group(req.body);
    const saved = await group.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

router.get('/', async (req, res) => {
  const groups = await Group.find();
  res.json(groups);
});

router.get('/:id', async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.sendStatus(404);
  res.json(group);
});

router.put('/:id', async (req, res) => {
  const updated = await Group.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Group.findByIdAndDelete(req.params.id);
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
});

export default router;
