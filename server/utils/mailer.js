const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const sendEmail = async (options) => {
  console.log('=== EMAIL ATTEMPT ===');
  console.log('To:', options.email);
  console.log('Subject:', options.subject);
  console.log('EMAIL_USER configured:', !!process.env.EMAIL_USER);
  console.log('EMAIL_PASS configured:', !!process.env.EMAIL_PASS);
  
  // Skip email sending if not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured in .env');
    return;
  }

  let transporter;

  try {
    if (process.env.MAIL_METHOD === 'oauth2') {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        process.env.GMAIL_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN
      });

      const accessToken = await oauth2Client.getAccessToken();

      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken.token
        }
      });
    } else {
      // Gmail App Password method (default)
      console.log('Using password auth method...');
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }

    const mailOptions = {
      from: `"Crisis Management System" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<pre>${options.message}</pre>`
    };

    console.log('Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('Error details:', error);
    throw error;
  }
};

module.exports = sendEmail;
