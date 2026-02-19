import { Schema, model } from 'mongoose';

const invitationSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toEmail: { type: String, required: true }, // Email del invitado (puede no ser usuario aún)
  toUserId: { type: Schema.Types.ObjectId, ref: 'User' }, // Opcional si ya es usuario
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  inviteCode: { type: String, unique: true }, // Código único para aceptar sin login
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 días
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default model('Invitation', invitationSchema);
