import nodemailer from 'nodemailer';
import envConfig from './envConfig';
import { User } from '../entities/User.postgres';

const transporter = nodemailer.createTransport({
  host: envConfig.GMAIL_HOST,
  service: envConfig.GMAIL_SERVICE,
  port: 587,
  secure: true,
  auth: {
    user: envConfig.GMAIL_USER,
    pass: envConfig.GMAIL_PASS
  }
});

export const sendVerificationMail = async (user: User, verificationUrl: string) => {
  const mailOptions = {
    from: envConfig.GMAIL_USER,
    to: user.email,
    subject: 'Verify Your Email',
    html: `Hi ${user.firstName}
    <br>Please click on the following link to verify your email:
    <br><a href="${verificationUrl}">${verificationUrl}</a>
    <br><br>Sincerely,
    <br>The Mosaic Team`
  };
  await transporter.sendMail(mailOptions);
};
