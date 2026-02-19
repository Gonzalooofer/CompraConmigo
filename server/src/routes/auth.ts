import { Router } from 'express';
import User from '../models/user';
import { sendVerificationEmail } from '../utils/mailer';

const router = Router();

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// register new user (or reject if email already exists)
router.post('/register', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const code = makeCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    const user = new User({
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      color: 'bg-purple-500',
      verified: false,
      verificationCode: code,
      verificationExpires: expires
    });
    await user.save();
    await sendVerificationEmail(email, code);
    res.status(201).json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// request login code for existing user
router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user with that email' });

  const code = makeCode();
  user.verificationCode = code;
  user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  try {
    await sendVerificationEmail(email, code);
    res.json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('login code send error', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// verify code (both registration and login)
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.verificationCode !== code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }
  if (user.verificationExpires && user.verificationExpires < new Date()) {
    return res.status(400).json({ error: 'Verification code expired' });
  }

  user.verified = true;
  user.verificationCode = undefined;
  user.verificationExpires = undefined;
  await user.save();

  // return normalized/sanitized user
  const result: any = user.toObject();
  delete result.verificationCode;
  delete result.verificationExpires;
  delete result.__v;
  result.id = result._id || result.id;
  res.json(result);
});

export default router;
