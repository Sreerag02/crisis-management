require('dotenv').config();
const sendEmail = require('./utils/mailer');

// Test email function
const testEmail = async () => {
  console.log('Testing email configuration...\n');
  console.log('EMAIL_USER from .env:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS configured:', !!process.env.EMAIL_PASS);
  
  try {
    await sendEmail({
      email: process.env.EMAIL_USER || 'sreerag2114@gmail.com',
      subject: '🚨 Test Alert - Crisis Management System',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the Crisis Management System.</p>
        <p>If you receive this, email configuration is working correctly!</p>
        <hr/>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('\n✅ Test email sent successfully!');
  } catch (error) {
    console.error('\n❌ Test email failed:', error.message);
    console.error(error);
  }
  
  process.exit(0);
};

testEmail();
