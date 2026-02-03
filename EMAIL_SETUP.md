# Email Setup Instructions

## Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password for "Mail"
   - Use this 16-character password as SMTP_PASS

3. **Update .env file**:
   ```
   SMTP_USER=your_actual_gmail@gmail.com
   SMTP_PASS=your_16_char_app_password
   ADMIN_EMAIL=where_to_receive_leads@gmail.com
   ```

## Option 2: Mailtrap (Testing)

1. Sign up at [mailtrap.io](https://mailtrap.io)
2. Get SMTP credentials from your inbox
3. Update .env:
   ```
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_mailtrap_user
   SMTP_PASS=your_mailtrap_pass
   ```

## Option 3: Other SMTP Providers

Use any SMTP service (SendGrid, AWS SES, etc.) by updating:
- SMTP_HOST
- SMTP_PORT  
- SMTP_USER
- SMTP_PASS

## Testing

After configuration, restart the backend server:
```bash
cd backend
npm run dev
```

Test the contact form - check console for logs if emails don't send.
