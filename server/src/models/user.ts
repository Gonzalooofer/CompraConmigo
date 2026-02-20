import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  avatar: { type: String }, // Optional now
  color: { type: String, required: true },
  // email is optional for legacy users; when present it must be unique
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String },
  country: { type: String },
  city: { type: String },
  postalCode: { type: String },
  plan: { type: String, enum: ['free', 'premium', 'family'], default: 'free' },

  // authentication/verification fields
  passwordHash: { type: String },
  verified: { type: Boolean, default: false },
  verificationCode: { type: String },
  verificationExpires: { type: Date },
  lastCodeSentAt: { type: Date },
  loginCode: { type: String },
  loginCodeExpires: { type: Date },

  // 2FA TOTP
  totpSecret: { type: String }, // TOTP secret key
  twoFAEnabled: { type: Boolean, default: false },
  backupCodes: [{ type: String }], // Array of backup codes
  rememberMeToken: { type: String } // Token for "remember me" login
}, { timestamps: true });

export default model('User', userSchema);
