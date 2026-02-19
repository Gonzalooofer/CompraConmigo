import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true }, // Nombre del usuario que envía
  userAvatar: { type: String }, // Avatar del usuario
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  edited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, { timestamps: true });

export default model('Message', messageSchema);
