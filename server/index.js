import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { connectDb } from './db.js';
import { GroupModel, ItemModel, SettlementModel, UserModel } from './models.js';
import { pickDefined, toGroup, toItem, toSettlement, toUser } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.API_PORT || 3001);

// ensure cors is applied early so preflight requests get handled.
app.use(cors());

// rewrite middleware to strip an accidental double "/api" prefix. in some
// deployment environments the frontend is served under a path that already
// contains "/api" and then our client adds the same prefix again, resulting
// in requests like "/api/api/auth/login" which the express routes don't
// recognise. the regex above in the client attempts to correct this, but
// adding a server‑side fallback ensures we never return 405 for these paths.
app.use((req, res, next) => {
  if (req.url.startsWith('/api/api')) {
    req.url = req.url.replace(/^\/api\/api/, '/api');
  }
  next();
});

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const name = (req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'El nombre es obligatorio.' });
    }

    const regex = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    let userDoc = await UserModel.findOne({ name: regex });

    if (!userDoc) {
      const emailSafe = name.toLowerCase().replace(/\s/g, '');
      userDoc = await UserModel.create({
        _id: uuidv4(),
        name,
        email: `${emailSafe}@ejemplo.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        color: 'bg-purple-500',
        plan: 'free'
      });
    }

    const groupsDoc = await GroupModel.find({ members: userDoc._id });
    const groupIds = groupsDoc.map((g) => g._id);
    const memberIds = [...new Set([userDoc._id, ...groupsDoc.flatMap((g) => g.members)])];
    const [itemsDoc, settlementsDoc, usersDoc] = await Promise.all([
      ItemModel.find({ groupId: { $in: groupIds } }),
      SettlementModel.find({ groupId: { $in: groupIds } }),
      UserModel.find({ _id: { $in: memberIds } })
    ]);

    return res.json({
      user: toUser(userDoc),
      users: usersDoc.map(toUser),
      groups: groupsDoc.map(toGroup),
      items: itemsDoc.map(toItem),
      settlements: settlementsDoc.map(toSettlement)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error iniciando sesión.', error: String(error) });
  }
});

app.get('/api/bootstrap/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userDoc = await UserModel.findById(userId);

    if (!userDoc) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const groupsDoc = await GroupModel.find({ members: userId });
    const groupIds = groupsDoc.map((g) => g._id);
    const memberIds = [...new Set([userDoc._id, ...groupsDoc.flatMap((g) => g.members)])];
    const [itemsDoc, settlementsDoc, usersDoc] = await Promise.all([
      ItemModel.find({ groupId: { $in: groupIds } }),
      SettlementModel.find({ groupId: { $in: groupIds } }),
      UserModel.find({ _id: { $in: memberIds } })
    ]);

    return res.json({
      user: toUser(userDoc),
      users: usersDoc.map(toUser),
      groups: groupsDoc.map(toGroup),
      items: itemsDoc.map(toItem),
      settlements: settlementsDoc.map(toSettlement)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error cargando datos.', error: String(error) });
  }
});

app.patch('/api/users/:userId', async (req, res) => {
  try {
    const updates = pickDefined(req.body || {}, [
      'name',
      'avatar',
      'color',
      'email',
      'phoneNumber',
      'plan',
      'notificationsEnabled',
      'language',
      'theme'
    ]);

    const updated = await UserModel.findByIdAndUpdate(req.params.userId, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    return res.json({ user: toUser(updated) });
  } catch (error) {
    return res.status(500).json({ message: 'Error actualizando usuario.', error: String(error) });
  }
});

app.delete('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await UserModel.findByIdAndDelete(userId);

    const groups = await GroupModel.find({ members: userId });
    for (const group of groups) {
      const members = group.members.filter((memberId) => memberId !== userId);
      const admins = group.admins.filter((adminId) => adminId !== userId);

      if (members.length === 0) {
        await GroupModel.findByIdAndDelete(group._id);
        await ItemModel.deleteMany({ groupId: group._id });
        await SettlementModel.deleteMany({ groupId: group._id });
      } else {
        await GroupModel.findByIdAndUpdate(group._id, { members, admins });
      }
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error eliminando cuenta.', error: String(error) });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { id, name, icon, color, ownerId } = req.body || {};
    if (!id || !name || !icon || !color || !ownerId) {
      return res.status(400).json({ message: 'Datos incompletos para crear grupo.' });
    }

    const groupDoc = await GroupModel.create({
      _id: id,
      name,
      icon,
      color,
      members: [ownerId],
      admins: [ownerId]
    });

    return res.status(201).json({ group: toGroup(groupDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error creando grupo.', error: String(error) });
  }
});

app.patch('/api/groups/:groupId', async (req, res) => {
  try {
    const updates = pickDefined(req.body || {}, ['name', 'icon', 'color', 'members', 'admins']);
    const groupDoc = await GroupModel.findByIdAndUpdate(req.params.groupId, updates, { new: true });
    if (!groupDoc) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    return res.json({ group: toGroup(groupDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error actualizando grupo.', error: String(error) });
  }
});

app.delete('/api/groups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    await GroupModel.findByIdAndDelete(groupId);
    await ItemModel.deleteMany({ groupId });
    await SettlementModel.deleteMany({ groupId });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error eliminando grupo.', error: String(error) });
  }
});

app.post('/api/groups/:groupId/join', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, groupName } = req.body || {};

    if (!userId) {
      return res.status(400).json({ message: 'Falta userId.' });
    }

    let group = await GroupModel.findById(groupId);
    if (!group) {
      group = await GroupModel.create({
        _id: groupId,
        name: groupName || 'Nuevo Grupo',
        members: [userId],
        admins: [],
        icon: '👋',
        color: 'bg-emerald-500'
      });
    } else if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    return res.json({ group: toGroup(group) });
  } catch (error) {
    return res.status(500).json({ message: 'Error uniendo al grupo.', error: String(error) });
  }
});

app.post('/api/groups/:groupId/members/manual', async (req, res) => {
  try {
    const { groupId } = req.params;
    const name = (req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Nombre obligatorio.' });
    }

    const userId = uuidv4();
    const userDoc = await UserModel.create({
      _id: userId,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${name}${userId}`)}`,
      color: 'bg-slate-500',
      plan: 'free'
    });

    const groupDoc = await GroupModel.findById(groupId);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    if (!groupDoc.members.includes(userId)) {
      groupDoc.members.push(userId);
      await groupDoc.save();
    }

    return res.status(201).json({ user: toUser(userDoc), group: toGroup(groupDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error añadiendo miembro.', error: String(error) });
  }
});

app.delete('/api/groups/:groupId/members/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const groupDoc = await GroupModel.findById(groupId);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    groupDoc.members = groupDoc.members.filter((memberId) => memberId !== userId);
    groupDoc.admins = groupDoc.admins.filter((adminId) => adminId !== userId);
    await groupDoc.save();

    return res.json({ group: toGroup(groupDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error eliminando miembro.', error: String(error) });
  }
});

app.post('/api/groups/:groupId/admins/toggle', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body || {};
    const groupDoc = await GroupModel.findById(groupId);
    if (!groupDoc) {
      return res.status(404).json({ message: 'Grupo no encontrado.' });
    }

    if (groupDoc.admins.includes(userId)) {
      groupDoc.admins = groupDoc.admins.filter((id) => id !== userId);
    } else {
      groupDoc.admins.push(userId);
    }
    await groupDoc.save();

    return res.json({ group: toGroup(groupDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error actualizando administradores.', error: String(error) });
  }
});

app.post('/api/items/bulk', async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe enviar items.' });
    }

    const inserted = await ItemModel.insertMany(
      items.map((item) => ({
        _id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        estimatedPrice: item.estimatedPrice,
        checked: Boolean(item.checked),
        assignedTo: item.assignedTo,
        groupId: item.groupId,
        storePrices: item.storePrices || []
      }))
    );

    return res.status(201).json({ items: inserted.map(toItem) });
  } catch (error) {
    return res.status(500).json({ message: 'Error creando items.', error: String(error) });
  }
});

app.patch('/api/items/:itemId', async (req, res) => {
  try {
    const updates = pickDefined(req.body || {}, ['name', 'category', 'quantity', 'estimatedPrice', 'checked', 'assignedTo']);
    const itemDoc = await ItemModel.findByIdAndUpdate(req.params.itemId, updates, { new: true });
    if (!itemDoc) {
      return res.status(404).json({ message: 'Item no encontrado.' });
    }

    return res.json({ item: toItem(itemDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error actualizando item.', error: String(error) });
  }
});

app.delete('/api/items/:itemId', async (req, res) => {
  try {
    await ItemModel.findByIdAndDelete(req.params.itemId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error eliminando item.', error: String(error) });
  }
});

app.post('/api/settlements', async (req, res) => {
  try {
    const { id, fromUserId, toUserId, amount, timestamp, groupId } = req.body || {};
    if (!id || !fromUserId || !toUserId || !amount || !timestamp || !groupId) {
      return res.status(400).json({ message: 'Datos incompletos para registrar pago.' });
    }

    const settlementDoc = await SettlementModel.create({
      _id: id,
      fromUserId,
      toUserId,
      amount,
      timestamp,
      groupId
    });

    return res.status(201).json({ settlement: toSettlement(settlementDoc) });
  } catch (error) {
    return res.status(500).json({ message: 'Error registrando pago.', error: String(error) });
  }
});

// --- FRONTEND SERVING ---

// Servir archivos estáticos desde la carpeta 'dist'
app.use(express.static(path.join(__dirname, '../dist')));

// Fallback para SPA: cualquier ruta que no sea de API sirve el index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  }
});

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API CompraConmigo escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar a MongoDB:', error);
    process.exit(1);
  });
