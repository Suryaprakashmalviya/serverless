import { Injectable, Logger } from '@nestjs/common';

export interface UserCreatedEvent {
  event: 'USER_CREATED';
  userId: string;
  email: string;
  timestamp: string;
}

/**
 * EmailService — responsible for sending emails.
 *
 * In this POC we simulate sending by logging.
 * In production you would call AWS SES, SendGrid, Resend, etc. here.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Sends a welcome email to a newly created user.
   * Called by the SQS handler for every USER_CREATED message.
   */
  async sendWelcomeEmail(payload: UserCreatedEvent): Promise<void> {
    this.logger.log(
      `📧 Sending welcome email to ${payload.email} (userId: ${payload.userId})`,
    );

    // ── Simulated email body ──────────────────────────────────────────────────
    const emailBody = `
Hi there,

Welcome to Evolus! 🎉

Your account has been created successfully.
  • User ID  : ${payload.userId}
  • Email    : ${payload.email}
  • Joined at: ${payload.timestamp}

Get started by uploading your profile picture.

Thanks,
The Evolus Team
    `.trim();

    // TODO: Replace with SES / SendGrid call in production
    this.logger.log(`─── Email Body ────────────────────────────────\n${emailBody}`);
    this.logger.log(`✅ Welcome email delivered to ${payload.email}.`);
  }
}
