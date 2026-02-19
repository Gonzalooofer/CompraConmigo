import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/user';

const router = Router();

// Generate TOTP secret and QR code
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).send('User ID required');

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `CompraConmigo (${user.email})`,
      issuer: 'CompraConmigo',
      length: 32
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes
    });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Verify TOTP and enable 2FA
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { userId, secret, code, backupCodes } = req.body;
    if (!userId || !secret || !code || !backupCodes) {
      return res.status(400).send('Missing required fields');
    }

    // Verify TOTP code
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).send('Invalid TOTP code');
    }

    // Save secret and backup codes to user
    const user = await User.findByIdAndUpdate(
      userId,
      {
        totpSecret: secret,
        twoFAEnabled: true,
        backupCodes: backupCodes.map((code: string) => code.toUpperCase())
      },
      { new: true }
    );

    res.json({ message: '2FA enabled successfully', user });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Verify TOTP code during login
router.post('/verify-login', async (req: Request, res: Response) => {
  try {
    const { userId, code, useBackupCode } = req.body;
    if (!userId || !code) {
      return res.status(400).send('Missing required fields');
    }

    const user = await User.findById(userId);
    if (!user || !user.twoFAEnabled || !user.totpSecret) {
      return res.status(401).send('2FA not enabled');
    }

    let isValid = false;

    if (useBackupCode) {
      // Check if code is a valid backup code
      const codeIndex = user.backupCodes.indexOf(code.toUpperCase());
      if (codeIndex !== -1) {
        // Remove used backup code
        user.backupCodes.splice(codeIndex, 1);
        await user.save();
        isValid = true;
      }
    } else {
      // Verify TOTP code
      isValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });
    }

    if (!isValid) {
      return res.status(401).send('Invalid code');
    }

    // Generate remember-me token if requested
    let rememberMeToken;
    if (req.body.rememberMe) {
      rememberMeToken = require('crypto').randomBytes(32).toString('hex');
      user.rememberMeToken = rememberMeToken;
      await user.save();
    }

    res.json({
      message: '2FA verified',
      rememberMeToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color,
        twoFAEnabled: user.twoFAEnabled,
        plan: user.plan
      }
    });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Get backup codes
router.get('/backup-codes', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).send('User ID required');

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found');

    res.json({ backupCodes: user.backupCodes });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Disable 2FA
router.post('/disable', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).send('User ID required');

    await User.findByIdAndUpdate(userId, {
      totpSecret: undefined,
      twoFAEnabled: false,
      backupCodes: [],
      rememberMeToken: undefined
    });

    res.json({ message: '2FA disabled' });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

// Verify remember-me token
router.post('/verify-remember-me', async (req: Request, res: Response) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).send('Missing required fields');
    }

    const user = await User.findById(userId);
    if (!user || user.rememberMeToken !== token) {
      return res.status(401).send('Invalid remember-me token');
    }

    res.json({
      message: 'Remember-me verified',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        color: user.color,
        twoFAEnabled: user.twoFAEnabled,
        plan: user.plan
      }
    });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
