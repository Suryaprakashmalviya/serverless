import { Injectable, Logger } from '@nestjs/common';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

/**
 * SecretsService — fetches and caches AWS Secrets Manager values on cold-start.
 *
 * Local Development (IS_OFFLINE=true):
 *   Falls back to the env var BC_WEBHOOK_SECRET so you can test
 *   without real AWS credentials or LocalStack.
 */
@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);
  private readonly client: SecretsManagerClient;

  // In-memory cache — lives for the lifetime of the Lambda container.
  private cachedWebhookSecret: string | null = null;

  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION ?? 'us-east-1',
      // Point to LocalStack when running offline (optional future upgrade)
      ...(process.env.IS_OFFLINE && {
        endpoint: process.env.SECRETS_MANAGER_ENDPOINT ?? 'http://localhost:4566',
      }),
    });
  }

  /**
   * Returns the BigCommerce webhook secret.
   * On the first call it fetches from Secrets Manager (or an env var offline)
   * and caches the result in memory for subsequent invocations in the same container.
   */
  async getWebhookSecret(): Promise<string> {
    if (this.cachedWebhookSecret) {
      this.logger.debug('Returning cached webhook secret.');
      return this.cachedWebhookSecret;
    }

    // ── Offline / local dev fallback ─────────────────────────────────────────
    if (process.env.IS_OFFLINE === 'true') {
      const localSecret = process.env.BC_WEBHOOK_SECRET ?? 'local-dev-secret';
      this.logger.warn(
        `IS_OFFLINE detected — using env var BC_WEBHOOK_SECRET: "${localSecret}"`,
      );
      this.cachedWebhookSecret = localSecret;
      return localSecret;
    }

    // ── Production: fetch from AWS Secrets Manager ───────────────────────────
    const secretId = process.env.AWS_SECRET_NAME ?? 'Prod/BigCommerce/WebhookSecret';
    this.logger.log(`Fetching secret "${secretId}" from AWS Secrets Manager…`);

    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await this.client.send(command);

    if (!response.SecretString) {
      throw new Error(`Secret "${secretId}" has no SecretString value.`);
    }

    this.cachedWebhookSecret = response.SecretString;
    this.logger.log('Webhook secret fetched and cached successfully.');
    return this.cachedWebhookSecret;
  }
}
