import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (
    to: string,
    verificationToken: string
) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    await resend.emails.send({
        from: `TrailPin <${process.env.SENDER_EMAIL}>`,
        to,
        subject: 'Verify your email for TrailPin',
        html: `
      <h1>Welcome to TrailPin!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">Verify Email</a>
    `,
    });
};