import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * S3Service — generates pre-signed PUT URLs so the frontend can upload
 * profile pictures directly to S3 without routing through the NestJS API.
 *
 * Flow:
 *   1. Client calls getProfileUploadUrl(userId) via GraphQL.
 *   2. Service returns a temporary signed URL (expires in 3600 s).
 *   3. Client does  PUT <signed-url>  with the image binary as body.
 *   4. S3 accepts the file directly — backend never sees the bytes.
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.S3_PROFILE_BUCKET ?? 'evolus-user-profiles';

    this.client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      // Redirect to LocalStack / serverless-offline-s3 when running locally
      ...(process.env.IS_OFFLINE && {
        endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:4566',
        forcePathStyle: true, // Required for LocalStack
      }),
    });
  }

  /**
   * Generates a pre-signed PUT URL valid for 1 hour.
   * @param userId  The user's ID — used as the S3 object key.
   * @returns A pre-signed URL string the client uses to upload the image.
   */
  async getProfileUploadUrl(userId: string): Promise<string> {
    const key = `profiles/${userId}.jpg`;

    this.logger.log(
      `Generating pre-signed PUT URL for s3://${this.bucket}/${key}`,
    );

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const preSignedUrl = await getSignedUrl(this.client, command, {
      expiresIn: 3600, // 1 hour
    });

    this.logger.log(`Pre-signed URL generated (expires in 3600 s).`);
    return preSignedUrl;
  }
}
