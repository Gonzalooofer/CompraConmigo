import { Router } from 'express';
import Item from '../models/item';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data._id;
    const item = new Item(data);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error saving item:', err);
    res.status(400).json({ error: err });
  }
});

router.get('/', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) return res.sendStatus(404);
  res.json(item);
});

router.put('/:id', async (req, res) => {
  const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Item.findByIdAndDelete(req.params.id);
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
});

export default router;
