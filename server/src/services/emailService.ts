import { IForm } from '../models/Form';
import { ISubmission } from '../models/Submission';

interface EmailConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
}

class EmailService {
  private config: EmailConfig;
  private enabled: boolean;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || 'noreply@formgen.ai',
    };
    
    // Check if email service is configured
    this.enabled = !!(this.config.host && this.config.user && this.config.pass);
    
    if (!this.enabled) {
      console.warn('Email service not configured. Email notifications will be disabled.');
    }
  }

  async sendSubmissionNotification(
    form: IForm,
    submission: ISubmission,
    ownerEmail: string
  ): Promise<void> {
    if (!this.enabled) {
      console.log('Email service not configured, skipping notification');
      return;
    }

    if (!form.emailNotifications?.enabled) {
      return;
    }

    try {
      const { recipients, subject, includeResponses } = form.emailNotifications;
      
      let htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Form Submission</h2>
            <p>A new submission has been received for your form <strong>"${form.title}"</strong>.</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
            <p><strong>Submission ID:</strong> ${submission._id}</p>
      `;

      if (includeResponses) {
        htmlContent += `
            <h3 style="color: #374151; margin-top: 20px;">Responses:</h3>
            <table style="width: 100%; border-collapse: collapse;">
        `;
        
        for (const [fieldName, value] of Object.entries(submission.responses)) {
          htmlContent += `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px; font-weight: bold; color: #6b7280;">${fieldName}</td>
                <td style="padding: 10px;">${this.formatValue(value)}</td>
              </tr>
          `;
        }
        
        htmlContent += `</table>`;
      }

      htmlContent += `
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              View all submissions at: <a href="${process.env.FRONTEND_URL}/dashboard/forms/${form._id}">Dashboard</a>
            </p>
          </body>
        </html>
      `;

      // In a production environment, you would use a service like SendGrid, AWS SES, or nodemailer
      // For now, we'll just log the email
      console.log('Sending email notification:');
      console.log('To:', recipients.length > 0 ? recipients : [ownerEmail]);
      console.log('Subject:', subject || `New submission for "${form.title}"`);
      console.log('Body length:', htmlContent.length);

      // TODO: Implement actual email sending with nodemailer or SendGrid
      // Example with nodemailer:
      /*
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      });

      await transporter.sendMail({
        from: this.config.from,
        to: recipients.length > 0 ? recipients.join(',') : ownerEmail,
        subject: subject || `New submission for "${form.title}"`,
        html: htmlContent,
      });
      */

    } catch (error) {
      console.error('Failed to send email notification:', error);
      // Don't throw error to avoid blocking submission
    }
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '<em>No response</em>';
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }
}

export const emailService = new EmailService();
