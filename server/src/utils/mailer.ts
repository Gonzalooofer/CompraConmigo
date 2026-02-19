import nodemailer from 'nodemailer';

// Gmail SMTP
if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.warn('warning: GMAIL_USER or GMAIL_PASS not set; email delivery will fail');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendVerificationEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: 'CompraConmigo – código de verificación',
    html: `
      <h2>Código de verificación</h2>
      <p>Tu código es: <strong>${code}</strong></p>
      <p>Este código expira en 15 minutos.</p>
    `,
    text: `Tu código de verificación es: ${code}`
  };
  await transporter.sendMail(mailOptions);
};