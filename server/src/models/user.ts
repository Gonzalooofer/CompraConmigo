import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  color: { type: String, required: true },
  email: { type: String },
  phoneNumber: { type: String },
  plan: { type: String, enum: ['free', 'premium', 'family'], default: 'free' }
}, { timestamps: true });

export default model('User', userSchema);
