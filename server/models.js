import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true, trim: true },
    avatar: { type: String, required: true },
    color: { type: String, required: true },
    email: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    plan: { type: String, enum: ['free', 'premium', 'family'], default: 'free' },
    notificationsEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'es' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' }
  },
  { versionKey: false }
);

const groupSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true, trim: true },
    members: { type: [String], default: [] },
    admins: { type: [String], default: [] },
    icon: { type: String, required: true },
    color: { type: String, required: true }
  },
  { versionKey: false }
);

const itemSchema = new mongoose.Schema(
  {
    _id: String,
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    estimatedPrice: { type: Number, required: true },
    checked: { type: Boolean, default: false },
    assignedTo: { type: String, default: undefined },
    groupId: { type: String, required: true },
    storePrices: {
      type: [
        {
          _id: false,
          store: String,
          price: Number
        }
      ],
      default: []
    }
  },
  { versionKey: false }
);

const settlementSchema = new mongoose.Schema(
  {
    _id: String,
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Number, required: true },
    groupId: { type: String, required: true }
  },
  { versionKey: false }
);

export const UserModel = mongoose.model('User', userSchema);
export const GroupModel = mongoose.model('Group', groupSchema);
export const ItemModel = mongoose.model('Item', itemSchema);
export const SettlementModel = mongoose.model('Settlement', settlementSchema);
