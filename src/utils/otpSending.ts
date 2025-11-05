import { InternalError } from '@Pick2Me/shared';
import { sendMail } from './nodeMailer';

export const sendOtp = async (email: string, name: string, otp: string) => {
  try {
    const subject = 'Otp Verification';
    const text = `Hello ${name},\n\nThank you for registering with Pick2Me!, your OTP is ${otp}\n\nHave a nice day!!!`;
    await sendMail(email, subject, text);
  } catch (error) {
    throw InternalError('something went wrong');
  }
};
