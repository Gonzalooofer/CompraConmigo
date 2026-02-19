import { Schema, model } from 'mongoose';

const settlementSchema = new Schema({
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Number, required: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true }
}, { timestamps: true });

export default model('Settlement', settlementSchema);
