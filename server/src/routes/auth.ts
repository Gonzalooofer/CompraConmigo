import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user';
import { sendVerificationEmail } from '../utils/mailer';

const router = Router();

function makeCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// register new user (name, email, password, phoneNumber, country, city, postalCode)
router.post('/register', async (req, res) => {
  const { name, email, password, phoneNumber, country, city, postalCode } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const code = makeCode();
  const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
      phoneNumber: phoneNumber || undefined,
      country: country || undefined,
      city: city || undefined,
      postalCode: postalCode || undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      color: 'bg-purple-500',
      verified: false,
      verificationCode: code,
      verificationExpires: expires,
      lastCodeSentAt: new Date()
    });
    await user.save();
    let mailWarning = false;
    try {
      await sendVerificationEmail(email, code);
    } catch (mailErr) {
      console.error('email send failure (register)', mailErr);
      mailWarning = true;
      // don't fail registration just because mail failed
    }
    const response: any = { message: 'Verification code sent' };
    if (mailWarning) response.warning = 'failed to send email';
    res.status(201).json(response);
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// login with email + password (generates login code)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user with that email' });
  if (!user.verified) return res.status(403).json({ error: 'Email not verified' });

  const match = await bcrypt.compare(password, user.passwordHash || '');
  if (!match) return res.status(401).json({ error: 'Incorrect password' });

  // If 2FA is enabled, do NOT send verification email now.
  // The frontend will ask for the TOTP code instead.
  if (user.twoFAEnabled) {
    return res.json({
      message: '2FA_REQUIRED',
      userId: user._id,
      twoFAEnabled: true
    });
  }

  // Generate login code
  const code = makeCode();
  user.loginCode = code;
  user.loginCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
  user.lastCodeSentAt = new Date();
  await user.save();

  try {
    await sendVerificationEmail(email, code);
    res.json({ message: 'Login code sent to email', twoFAEnabled: false });
  } catch (mailErr) {
    console.error('email send failure (login)', mailErr);
    res.json({ warning: 'failed to send email', twoFAEnabled: false });
  }
});

// resend verification code (throttled to 60s)
router.post('/resend', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.verified) return res.status(400).json({ error: 'Already verified' });

  const now = new Date();
  if (user.lastCodeSentAt && now.getTime() - user.lastCodeSentAt.getTime() < 60 * 1000) {
    return res.status(429).json({ error: 'Please wait before resending code' });
  }

  const code = makeCode();
  user.verificationCode = code;
  user.verificationExpires = new Date(Date.now() + 15 * 60 * 1000);
  user.lastCodeSentAt = now;
  await user.save();

  try {
    await sendVerificationEmail(email, code);
    res.json({ message: 'Verification code resent' });
  } catch (err) {
    console.error('resend code error', err);
    res.json({ warning: 'failed to send email' });
  }
});

// verify code (registration only)
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
  delete result.passwordHash;
  delete result.verificationCode;
  delete result.verificationExpires;
  delete result.__v;
  delete result.loginCode;
  delete result.loginCodeExpires;
  result.id = result._id || result.id;
  res.json(result);
});

// verify login code
router.post('/verify-login', async (req, res) => {
  const { email, code, rememberMe } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (user.loginCode !== code) {
    return res.status(400).json({ error: 'Invalid login code' });
  }
  if (user.loginCodeExpires && user.loginCodeExpires < new Date()) {
    return res.status(400).json({ error: 'Login code expired' });
  }

  user.loginCode = undefined;
  user.loginCodeExpires = undefined;

  // Generate remember-me token if requested
  let rememberMeToken;
  if (rememberMe) {
    rememberMeToken = require('crypto').randomBytes(32).toString('hex');
    user.rememberMeToken = rememberMeToken;
  }

  await user.save();

  // return normalized/sanitized user
  const result: any = user.toObject();
  delete result.passwordHash;
  delete result.verificationCode;
  delete result.verificationExpires;
  delete result.loginCode;
  delete result.loginCodeExpires;
  delete result.__v;
  result.id = result._id || result.id;

  if (rememberMeToken) {
    result.rememberMeToken = rememberMeToken;
  }

  res.json(result);
});

export default router;

