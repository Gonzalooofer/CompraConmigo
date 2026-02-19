import * as brevo from '@getbrevo/brevo';

// Configure Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');

if (!process.env.BREVO_API_KEY) {
  console.warn('warning: BREVO_API_KEY not set; email delivery will fail');
}

export const sendVerificationEmail = async (to: string, code: string) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { 
      name: 'CompraConmigo', 
      email: 'noreply@compraconmigo.com' 
    };
    sendSmtpEmail.subject = 'CompraConmigo – código de verificación';
    sendSmtpEmail.htmlContent = `
      <h2>Código de verificación</h2>
      <p>Tu código es: <strong>${code}</strong></p>
      <p>Este código expira en 15 minutos.</p>
    `;
    sendSmtpEmail.textContent = `Tu código de verificación es: ${code}`;

    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (err) {
    console.error('Brevo email error:', err);
    throw err;
  }
};