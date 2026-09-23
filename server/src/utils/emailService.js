const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTPEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Bhopali Blogs" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Bhopali Blogs - Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #059669;">Welcome to Bhopali Blogs</h2>
        <p>Your 6-digit OTP for email verification is:</p>
        <div style="background: #f1f5f9; padding: 16px; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #059669; text-align: center; border-radius: 6px;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b; margin-top: 20px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};