import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

/**
 * SnsService — publishes domain events to AWS SNS topics.
 *
 * The user-service never calls the email-service directly (tight coupling).
 * Instead it announces "User created" to SNS, which fans out to any
 * subscriber (SQS queues, Lambda, email-service, analytics, etc.).
 */
@Injectable()
export class SnsService {
  private readonly logger = new Logger(SnsService.name);
  private readonly client: SNSClient;
  private readonly userCreatedTopicArn: string;

  constructor() {
    this.userCreatedTopicArn =
      process.env.USER_CREATED_SNS_TOPIC_ARN ?? 'arn:aws:sns:us-east-1:000000000000:UserCreatedTopic';

    this.client = new SNSClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      // Point to serverless-offline-sns when running locally
      ...(process.env.IS_OFFLINE && {
        endpoint: process.env.SNS_ENDPOINT ?? 'http://localhost:4002',
      }),
    });
  }

  /**
   * Publishes a USER_CREATED event to the SNS topic.
   * The email-service (subscribed via SQS) will pick this up and send
   * a welcome email asynchronously — completely decoupled from this request.
   */
  async publishUserCreated(userId: string, email: string): Promise<void> {
    const message = JSON.stringify({
      event: 'USER_CREATED',
      userId,
      email,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Publishing USER_CREATED event for userId=${userId} to topic: ${this.userCreatedTopicArn}`,
    );

    const command = new PublishCommand({
      TopicArn: this.userCreatedTopicArn,
      Message: message,
      Subject: 'USER_CREATED',
      MessageAttributes: {
        event: {
          DataType: 'String',
          StringValue: 'USER_CREATED',
        },
      },
    });

    await this.client.send(command);
    this.logger.log(`USER_CREATED event published successfully for userId=${userId}.`);
  }
}
