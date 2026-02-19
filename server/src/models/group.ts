import { Schema, model } from 'mongoose';

const groupSchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  icon: { type: String, default: '👋' },
  color: { type: String, default: 'bg-emerald-500' }
}, { timestamps: true });

export default model('Group', groupSchema);
