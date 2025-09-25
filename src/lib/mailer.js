import nodemailer from 'nodemailer';

// For this prototype, we'll use a test account from Ethereal.
// In a real application, these would come from environment variables.
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'maddison53@ethereal.email', // Generated Ethereal user
    pass: 'jn7jnAPss4f63QBp6D', // Generated Ethereal password
  },
});

export const sendNotification = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"Bug Tracker" <noreply@bugtracker.com>',
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};