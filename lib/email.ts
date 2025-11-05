import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendContactEmail({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!process.env.EMAIL_FROM) {
    throw new Error('EMAIL_FROM not configured');
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text
  });
}
