import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { DynamoService } from "../../aws/dynamo.service";
import { UserResolver } from "./user.resolver";
import { SecretsService } from "../../aws/secrets.service";
import { S3Service } from "../../aws/s3.service";
import { SnsService } from "../../aws/sns.service";

@Module({
    imports: [],
    providers: [
        UserService,
        DynamoService,
        UserResolver,
        SecretsService,
        S3Service,
        SnsService,
    ],
})
export class UserModule {}