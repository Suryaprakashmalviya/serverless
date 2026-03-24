import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { EmailService, UserCreatedEvent } from './email/email.service';

// SQS event types
interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: Record<string, string>;
  messageAttributes: Record<string, unknown>;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

interface SQSEvent {
  Records: SQSRecord[];
}

// Cached NestJS application instance (Lambda container reuse)
let emailService: EmailService | null = null;

async function bootstrap(): Promise<EmailService> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'warn', 'error'],
  });
  return app.get(EmailService);
}

/**
 * SQS Lambda Handler
 *
 * This is the entry point for the evolus-email-service function.
 * AWS Lambda invokes this with an SQSEvent when a message arrives
 * on the WelcomeEmailQueue.
 *
 * Message flow:
 *   createUser (user-service)
 *     → SNS TopicArn: UserCreatedTopic
 *     → SQS Queue:    WelcomeEmailQueue
 *     → This handler (email-service)
 *     → EmailService.sendWelcomeEmail()
 */
export const sqsHandler = async (event: SQSEvent): Promise<void> => {
  const logger = new Logger('SQSHandler');

  // Warm up NestJS once per container (Lambda reuse pattern)
  if (!emailService) {
    logger.log('Cold start — bootstrapping NestJS application context…');
    emailService = await bootstrap();
    logger.log('NestJS application context ready.');
  }

  logger.log(`Processing ${event.Records.length} SQS record(s)…`);

  for (const record of event.Records) {
    logger.log(`Processing SQS message: ${record.messageId}`);

    try {
      // SQS body is the raw SNS notification JSON when SNS→SQS subscription is used
      const snsWrapper = JSON.parse(record.body);

      // SNS wraps the actual message in a "Message" field as a JSON string
      const payload: UserCreatedEvent =
        typeof snsWrapper.Message === 'string'
          ? JSON.parse(snsWrapper.Message)   // SNS → SQS path
          : snsWrapper;                        // Direct SQS path (local testing)

      await emailService.sendWelcomeEmail(payload);
      logger.log(`✅ Record ${record.messageId} processed successfully.`);
    } catch (err) {
      // Logging the error — Lambda will not delete the message from SQS on failure,
      // so the message will be retried or go to the DLQ.
      logger.error(`❌ Failed to process record ${record.messageId}: ${err}`);
      throw err; // Re-throw to signal Lambda to retry
    }
  }
};
