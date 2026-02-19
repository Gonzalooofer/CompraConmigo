import { Schema, model } from 'mongoose';

const itemSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  estimatedPrice: { type: Number, default: 0 },
  checked: { type: Boolean, default: false },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group' },
  storePrices: [{ store: String, price: Number }]
}, { timestamps: true });

export default model('Item', itemSchema);
