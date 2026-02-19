import { Router } from 'express';
import Message from '../models/message';

const router = Router();

// Obtener historial de mensajes de un grupo
router.get('/group/:groupId', async (req, res) => {
  const { groupId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = parseInt(req.query.skip as string) || 0;

  try {
    const messages = await Message.find({ groupId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Revertir orden para mostrar cronológicamente y normalizar ID
    const orderedMessages = messages.reverse().map(m => ({
      ...m,
      id: m._id.toString()
    }));

    res.json(orderedMessages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Crear mensaje (usado para sincronización si socket.io falla)
router.post('/', async (req, res) => {
  const { groupId, userId, userName, userAvatar, content } = req.body;

  if (!groupId || !userId || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const message = new Message({
      groupId,
      userId,
      userName,
      userAvatar,
      content
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Editar mensaje
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, userId } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content required' });
  }

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verificar que el usuario es el autor
    if (message.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    res.json(message);
  } catch (err) {
    console.error('Error editing message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Eliminar mensaje
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Verificar que el usuario es el autor
    if (message.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Message.findByIdAndDelete(id);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
