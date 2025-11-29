import axios from 'axios';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { IWebhook } from '../models/Form';

interface WebhookPayload {
  event: string;
  formId: string;
  submissionId: string;
  timestamp: Date;
  data: any;
}

interface IWebhookLog extends mongoose.Document {
  webhookId: string;
  formId: mongoose.Types.ObjectId;
  event: string;
  status: 'success' | 'failed' | 'retrying';
  attempts: number;
  lastAttemptAt: Date;
  response?: {
    statusCode: number;
    body: string;
  };
  error?: string;
  createdAt: Date;
}

const WebhookLogSchema = new mongoose.Schema<IWebhookLog>(
  {
    webhookId: { type: String, required: true, index: true },
    formId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    event: { type: String, required: true },
    status: {
      type: String,
      enum: ['success', 'failed', 'retrying'],
      required: true,
    },
    attempts: { type: Number, default: 1 },
    lastAttemptAt: { type: Date, default: Date.now },
    response: {
      statusCode: Number,
      body: String,
    },
    error: String,
  },
  { timestamps: true }
);

export const WebhookLog = mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);

class WebhookService {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT = 10000; // 10 seconds

  /**
   * Deliver webhook to all configured endpoints for a form
   */
  async deliverWebhooks(
    formId: mongoose.Types.ObjectId,
    event: string,
    webhooks: IWebhook[],
    payload: WebhookPayload
  ): Promise<void> {
    const activeWebhooks = webhooks.filter(
      wh => wh.enabled && wh.events.includes(event)
    );

    if (activeWebhooks.length === 0) {
      return;
    }

    // Deliver webhooks in parallel (non-blocking)
    const deliveryPromises = activeWebhooks.map(webhook =>
      this.deliverWebhook(webhook, formId, event, payload)
    );

    // Don't await - let them run in background
    Promise.allSettled(deliveryPromises).catch(console.error);
  }

  /**
   * Deliver a single webhook with retry logic
   */
  private async deliverWebhook(
    webhook: IWebhook,
    formId: mongoose.Types.ObjectId,
    event: string,
    payload: WebhookPayload
  ): Promise<void> {
    let attempts = 0;
    let lastError: string | undefined;

    while (attempts < this.MAX_RETRIES) {
      attempts++;

      try {
        const signature = this.generateSignature(payload, webhook.secret);
        
        const response = await axios.post(webhook.url, payload, {
          timeout: this.TIMEOUT,
          headers: {
            'Content-Type': 'application/json',
            'X-FormGen-Event': event,
            'X-FormGen-Signature': signature,
            'User-Agent': 'FormGen-Webhook/1.0',
          },
          validateStatus: () => true, // Don't throw on any status code
        });

        // Log the delivery
        await WebhookLog.create({
          webhookId: webhook.id,
          formId,
          event,
          status: response.status >= 200 && response.status < 300 ? 'success' : 'failed',
          attempts,
          lastAttemptAt: new Date(),
          response: {
            statusCode: response.status,
            body: JSON.stringify(response.data).substring(0, 1000), // Limit log size
          },
        });

        // Success - exit retry loop
        if (response.status >= 200 && response.status < 300) {
          console.log(`Webhook delivered successfully to ${webhook.url}`);
          return;
        }

        lastError = `HTTP ${response.status}: ${response.statusText}`;
        
      } catch (error: any) {
        lastError = error.message;
        console.error(`Webhook delivery attempt ${attempts} failed:`, error.message);
      }

      // Exponential backoff before retry
      if (attempts < this.MAX_RETRIES) {
        const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
        await this.sleep(delay);
      }
    }

    // All retries failed - log final failure
    await WebhookLog.create({
      webhookId: webhook.id,
      formId,
      event,
      status: 'failed',
      attempts,
      lastAttemptAt: new Date(),
      error: lastError,
    });

    console.error(`Webhook delivery failed after ${attempts} attempts: ${lastError}`);
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  private generateSignature(payload: any, secret: string): string {
    if (!secret) {
      return '';
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Verify webhook signature (for incoming webhooks)
   */
  verifySignature(payload: any, signature: string, secret: string): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get webhook logs for a form
   */
  async getWebhookLogs(
    formId: mongoose.Types.ObjectId,
    page: number = 1,
    limit: number = 20
  ): Promise<{ logs: IWebhookLog[]; total: number }> {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      WebhookLog.find({ formId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WebhookLog.countDocuments({ formId }),
    ]);

    return { logs, total };
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(url: string, secret: string): Promise<{ success: boolean; message: string }> {
    try {
      const testPayload: WebhookPayload = {
        event: 'webhook.test',
        formId: 'test-form-id',
        submissionId: 'test-submission-id',
        timestamp: new Date(),
        data: { message: 'This is a test webhook from FormGen AI' },
      };

      const signature = this.generateSignature(testPayload, secret);

      const response = await axios.post(url, testPayload, {
        timeout: this.TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'X-FormGen-Event': 'webhook.test',
          'X-FormGen-Signature': signature,
          'User-Agent': 'FormGen-Webhook/1.0',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: `Webhook test successful (HTTP ${response.status})`,
        };
      }

      return {
        success: false,
        message: `Webhook returned HTTP ${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Webhook test failed: ${error.message}`,
      };
    }
  }
}

export const webhookService = new WebhookService();
