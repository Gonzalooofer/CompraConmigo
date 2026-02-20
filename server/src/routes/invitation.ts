import { Router } from 'express';
import Invitation from '../models/invitation';
import User from '../models/user';
import Group from '../models/group';
import { sendInvitationEmail } from '../utils/mailer';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Enviar invitación a un email
router.post('/send', async (req, res) => {
  const { groupId, toEmail, fromUserId } = req.body;
  
  if (!groupId || !toEmail || !fromUserId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verificar que la invitación no exista ya
    const existing = await Invitation.findOne({ groupId, toEmail, status: 'pending' });
    if (existing) {
      return res.status(409).json({ error: 'Invitation already sent to this email' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Generar código de invitación único
    const inviteCode = uuidv4().substring(0, 8).toUpperCase();

    // Buscar si el email ya está registrado
    const existingUser = await User.findOne({ email: toEmail });

    const invitation = new Invitation({
      groupId,
      fromUserId,
      toEmail,
      toUserId: existingUser?.id,
      inviteCode,
      status: 'pending'
    });

    await invitation.save();

    // Enviar email con invitación
    const inviteLink = `${process.env.FRONTEND_URL || 'https://compraconmigo.ddns.net'}?invite=${inviteCode}`;
    try {
      await sendInvitationEmail(toEmail, group.name, inviteLink, inviteCode);
    } catch (mailErr) {
      console.error('Failed to send invitation email:', mailErr);
      // No fallar si el email no se puede enviar, pero aviso
      return res.status(201).json({ 
        message: 'Invitation created but email delivery failed',
        warning: true,
        inviteCode 
      });
    }

    res.status(201).json({ 
      message: 'Invitation sent',
      inviteCode,
      toEmail
    });
  } catch (err) {
    console.error('Error sending invitation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Aceptar invitación
router.post('/accept/:code', async (req, res) => {
  const { userId } = req.body;
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: 'Invite code required' });
  }

  try {
    const invitation = await Invitation.findOne({ inviteCode: code, status: 'pending' });
    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Verificar que no haya expirado
    if (new Date() > invitation.expiresAt) {
      return res.status(410).json({ error: 'Invitation expired' });
    }

    // Actualizar invitación
    invitation.status = 'accepted';
    invitation.toUserId = userId;
    await invitation.save();

    // Añadir usuario al grupo
    const group = await Group.findById(invitation.groupId);
    if (group && !group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }

    res.json({ 
      message: 'Invitation accepted',
      groupId: invitation.groupId
    });
  } catch (err) {
    console.error('Error accepting invitation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Obtener invitaciones pendientes para un usuario
router.get('/pending/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const invitations = await Invitation.find({
      toUserId: userId,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('groupId', 'name icon color').populate('fromUserId', 'name avatar');

    res.json(invitations);
  } catch (err) {
    console.error('Error fetching invitations:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rechazar invitación
router.post('/reject/:invitationId', async (req, res) => {
  const { invitationId } = req.params;

  try {
    const invitation = await Invitation.findByIdAndUpdate(
      invitationId,
      { status: 'rejected' },
      { new: true }
    );

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({ message: 'Invitation rejected' });
  } catch (err) {
    console.error('Error rejecting invitation:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
