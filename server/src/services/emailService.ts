import nodemailer from 'nodemailer';
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
  private transporter: nodemailer.Transporter | null = null;

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
    
    if (this.enabled) {
      this.initializeTransporter();
      console.log('✅ Email service configured and ready');
    } else {
      console.warn('⚠️  Email service not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS to enable email notifications.');
    }
  }

  private initializeTransporter(): void {
    try {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: (this.config.port === 465), // true for 465, false for other ports
        auth: {
          user: this.config.user,
          pass: this.config.pass,
        },
      } as any);
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      this.enabled = false;
    }
  }

  async sendSubmissionNotification(
    form: IForm,
    submission: ISubmission,
    ownerEmail: string
  ): Promise<void> {
    if (!this.enabled || !this.transporter) {
      console.log('⚠️  Email service not configured, skipping notification');
      return;
    }

    if (!form.emailNotifications?.enabled) {
      console.log(`Email notifications disabled for form ${form._id}`);
      return;
    }

    try {
      // Verify connection before sending
      if (this.transporter) {
        await this.transporter.verify();
      }
      const { recipients, subject, includeResponses } = form.emailNotifications;
      const recipientEmails = recipients && recipients.length > 0 ? recipients : [ownerEmail];
      
      let htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #ffffff; margin: 0;">📬 New Form Submission</h2>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none;">
              <p>A new submission has been received for your form <strong>"${form.title}"</strong>.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p><strong>📅 Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
              <p><strong>🆔 Submission ID:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${submission._id}</code></p>
      `;

      if (includeResponses && Object.keys(submission.responses).length > 0) {
        htmlContent += `
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 20px; margin-bottom: 12px;">📋 Responses:</h3>
              <table style="width: 100%; border-collapse: collapse;">
        `;
        
        for (const [fieldName, value] of Object.entries(submission.responses)) {
          htmlContent += `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px; font-weight: 600; color: #6b7280; width: 30%; vertical-align: top;">${this.escapeHtml(fieldName)}</td>
                  <td style="padding: 12px; color: #374151;">${this.formatValue(value)}</td>
                </tr>
          `;
        }
        
        htmlContent += `</table>`;
      }

      htmlContent += `
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <div style="background: #f0f9ff; padding: 12px; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <p style="margin: 0; color: #1e40af; font-size: 14px;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/forms/${form._id}" style="color: #2563eb; text-decoration: none; font-weight: 600;">
                    View all submissions in Dashboard →
                  </a>
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated email. Please do not reply to this message.
              </p>
            </div>
          </body>
        </html>
      `;

      // Send the email
      const mailOptions = {
        from: this.config.from,
        to: recipientEmails.join(', '),
        subject: subject || `New submission for "${form.title}"`,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email notification sent successfully:`, {
        messageId: result.messageId,
        to: recipientEmails,
        subject: mailOptions.subject,
      });

    } catch (error) {
      console.error('❌ Failed to send email notification:', error instanceof Error ? error.message : error);
      // Don't throw error to avoid blocking submission
    }
  }

  private escapeHtml(text: string): string {
    const htmlEscapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '<em style="color: #9ca3af;">No response</em>';
    }
    if (Array.isArray(value)) {
      return value.map(v => this.escapeHtml(String(v))).join('<br>');
    }
    if (typeof value === 'object') {
      return '<code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px;">' + 
        this.escapeHtml(JSON.stringify(value, null, 2)) + '</code>';
    }
    return this.escapeHtml(String(value));
  }
}

export const emailService = new EmailService();
