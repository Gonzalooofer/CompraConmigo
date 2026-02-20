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
    subject: 'CompraConmigo – verifica tu correo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin:0;font-size:28px;">CompraConmigo</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color:#1f2937;">Verifica tu dirección de correo</h2>
          <p style="color:#6b7280;font-size:16px;line-height:1.6;">
            Gracias por registrarte en CompraConmigo. Para completar el proceso de creación de cuenta, introduce el siguiente código en la aplicación:
          </p>
          <p style="font-size:24px;font-weight:bold;color:#10b981;text-align:center;letter-spacing:2px;margin:20px 0;">${code}</p>
          <p style="color:#6b7280;font-size:14px;">Este código expira en 15 minutos.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
            Si no solicitaste este correo, simplemente ignóralo.
          </p>
          <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
            © 2026 CompraConmigo. Compra inteligente, en equipo.
          </p>
        </div>
      </div>
    `,
    text: `Tu código de verificación en CompraConmigo es: ${code}. El código expira en 15 minutos.`
  };
  await transporter.sendMail(mailOptions);
};

export const sendInvitationEmail = async (to: string, groupName: string, inviteLink: string, inviteCode: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: `¡Te invitaron a ${groupName} en CompraConmigo! 🛒`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🛒 CompraConmigo</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #1f2937; margin-top: 0;">¡Te invitaron a un grupo!</h2>
          
          <p style="color: #6b7280; font-size: 16px; line-height: 1.6;">
            Te han invitado a unirte al grupo <strong>${groupName}</strong> en CompraConmigo para compartir listas de compra de forma colaborativa.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #6b7280; margin-bottom: 15px;">Código de invitación:</p>
            <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0; letter-spacing: 2px;">${inviteCode}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Aceptar Invitación
            </a>
          </div>
          
          <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
            Esta invitación expira en 7 días. Si no creaste esta cuenta, puedes ignorar este email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
            © 2024 CompraConmigo. Compra inteligente, en equipo.
          </p>
        </div>
      </div>
    `,
    text: `¡Te invitaron a ${groupName}! ${inviteLink}`
  };
  await transporter.sendMail(mailOptions);
};