import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize AWS SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined, // Use IAM role if no credentials provided
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const fromAddress = `${process.env.EMAIL_FROM_NAME || 'Construction360'} <${process.env.EMAIL_FROM_ADDRESS || 'noreply@construction360.com'}>`;
  
  const params = {
    Source: fromAddress,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        ...(text && {
          Text: {
            Data: text,
            Charset: 'UTF-8',
          },
        }),
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    console.log(`Email sent successfully. MessageId: ${response.MessageId}`);
    return response;
  } catch (error) {
    console.error('Failed to send email via AWS SES:', error);
    throw error;
  }
}

export function generatePasswordResetEmail(resetLink: string, userEmail: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 32px;
            text-align: center;
          }
          .logo {
            margin-bottom: 24px;
          }
          h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          p {
            color: #4b5563;
            margin-bottom: 24px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin-bottom: 16px;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .footer {
            margin-top: 32px;
            font-size: 14px;
            color: #6b7280;
          }
          .footer a {
            color: #2563eb;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <p>Hi there,</p>
          <p>We received a request to reset your password for your Construction360 account. Click the button below to create a new password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p style="font-size: 14px; color: #6b7280;">This link will expire in 1 hour for security reasons.</p>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request this password reset, you can safely ignore this email.</p>
          <div class="footer">
            <p>Best regards,<br>The Construction360 Team</p>
            <p>If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}">${resetLink}</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

Hi there,

We received a request to reset your password for your Construction360 account.

Click the link below to create a new password:
${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, you can safely ignore this email.

Best regards,
The Construction360 Team
  `.trim();

  return { html, text };
}