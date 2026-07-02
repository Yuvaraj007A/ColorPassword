const nodemailer = require('nodemailer');
const { Resend } = require('resend');

/**
 * Sends a password reset OTP code.
 * Supports Resend API and SMTP as primary channels, with terminal console logging fallback.
 * 
 * @param {string} email - Destination email address
 * @param {string} otp - The 6-digit verification code
 * @returns {Promise<boolean>} - True if sent successfully, false otherwise
 */
const sendOTPEmail = async (email, otp) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Prominently print the OTP code to backend terminal console for manual verification/testing
  console.log('\n==================================================');
  console.log(`[OTP Verification Code]`);
  console.log(`User Email: ${email}`);
  console.log(`OTP Code  : ${otp}`);
  console.log('==================================================\n');

  let sent = false;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #4f46e5; margin: 0;">Color Password Portal</h2>
        <p style="color: #718096; font-size: 14px; margin-top: 4px;">Security & Identity Verification</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #edf2f7; margin-bottom: 24px;" />
      <p style="font-size: 16px; line-height: 24px; color: #4a5568;">Hello,</p>
      <p style="font-size: 16px; line-height: 24px; color: #4a5568;">You requested a password reset. Use the following 6-digit One-Time Password (OTP) to verify your identity:</p>
      <div style="text-align: center; margin: 32px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background-color: #f3f4f6; padding: 12px 24px; border-radius: 8px; border: 1px solid #e5e7eb;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #e53e3e; font-weight: 500;">Note: This OTP is valid for 10 minutes. Do not share this code with anyone.</p>
      <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 24px 0;" />
      <p style="font-size: 12px; color: #a0aec0; text-align: center; margin: 0;">If you did not initiate this request, you can safely ignore this email.</p>
    </div>
  `;

  // 1. Try Nodemailer SMTP first
  if (smtpHost && smtpUser && smtpPass) {
    try {
      console.log('Attempting to send email via SMTP Relay (Nodemailer)...');
      const smtpFromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: smtpPort === '465',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"Color Password Portal" <${smtpFromEmail}>`,
        to: email,
        subject: 'Your One-Time Password (OTP) for Password Reset',
        text: `Your One-Time Password (OTP) to reset your color password is: ${otp}. It is valid for 10 minutes.`,
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent via SMTP to ${email}`);
      sent = true;
    } catch (error) {
      console.error('Error sending email via SMTP:', error);
    }
  }

  // 2. If SMTP failed or is not configured, fallback to Resend API
  if (!sent && resendApiKey) {
    try {
      console.log('Attempting to send email via Resend API (Fallback)...');
      const resend = new Resend(resendApiKey);

      const response = await resend.emails.send({
        from: `Color Password Portal <${resendFromEmail}>`,
        to: email,
        subject: 'Your One-Time Password (OTP) for Password Reset',
        text: `Your One-Time Password (OTP) to reset your color password is: ${otp}. It is valid for 10 minutes.`,
        html: htmlContent,
      });

      if (response.error) {
        console.error('Resend API returned error:', response.error);
      } else {
        console.log(`Email successfully dispatched via Resend to ${email}`);
        sent = true;
      }
    } catch (error) {
      console.error('Error sending email via Resend API:', error);
    }
  }

  if (!sent) {
    console.log('No active email configurations resolved successfully. OTP console fallback logged.');
  }

  return sent;
};

module.exports = {
  sendOTPEmail
};
