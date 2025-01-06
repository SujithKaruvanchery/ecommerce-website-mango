const nodemailer = require('nodemailer');

// Set up email transport (using Gmail for example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send password reset email
exports.sendResetPasswordEmail = (email, resetUrl) => {
  const mailOptions = {
    to: email,
    subject: 'Password Reset Request',
    html: `Click <a href="${resetUrl}">here</a> to reset your password.`,
  };

  return transporter.sendMail(mailOptions);
};
