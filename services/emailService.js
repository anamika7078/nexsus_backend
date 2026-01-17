const nodemailer = require('nodemailer');
require('dotenv').config();

const sendAdminMail = async (data) => {
    try {
        // Check if SMTP credentials are provided, else log only
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("⚠️ SMTP Credentials missing. Logging email to console instead:");
            console.log(JSON.stringify(data, null, 2));
            return { success: true, mock: true };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"Nexsus Cyber" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.SMTP_USER, // Send to admin
            subject: `New Lead: ${data.name} (${data.type || 'Contact'})`,
            html: `
        <h2>New Lead Received</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.name}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone || 'N/A'}</td></tr>
           <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.type || 'General Inquiry'}</td></tr>
        </table>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendAdminMail };
