import { Router } from 'express';
import User from '../models/user';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// configure multer storage for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();

// helper to remove private fields before sending to client
function sanitizeUser(doc: any) {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.passwordHash;
  delete obj.verificationCode;
  delete obj.verificationExpires;
  delete obj.__v;
  obj.id = obj._id || obj.id;
  return obj;
}

// create
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json(sanitizeUser(saved));
  } catch (err) {
    res.status(400).json({ error: err });
  }
});

// read all
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users.map(u => sanitizeUser(u)));
});

// read one
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.sendStatus(404);
  res.json(sanitizeUser(user));
});

// update
router.put('/:id', async (req, res) => {
  const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(sanitizeUser(updated));
});

// avatar upload
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se ha subido ningún archivo' });
  const relativePath = `/uploads/avatars/${req.file.filename}`;
  const updated = await User.findByIdAndUpdate(req.params.id, { avatar: relativePath }, { new: true });
  if (!updated) return res.sendStatus(404);
  res.json(sanitizeUser(updated));
});

// delete
router.delete('/:id', async (req, res) => {
  const deleted = await User.findByIdAndDelete(req.params.id);
  if (!deleted) return res.sendStatus(404);
  res.sendStatus(204);
});

export default router;
