import { Injectable, Logger } from "@nestjs/common";
import { DynamoService } from "../../aws/dynamo.service";
import { SnsService } from "../../aws/sns.service";
import { v4 as uuidv4 } from "uuid";
import { CreateUserInput } from "./user.model";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        private readonly dynamoService: DynamoService,
        private readonly snsService: SnsService,
    ) { }

    async create(createUserInput: CreateUserInput) {
        const newUser = {
            id: uuidv4(),
            ...createUserInput,
            createdAt: new Date().toISOString(),
        };

        // 1. Persist to DynamoDB
        const savedUser = await this.dynamoService.putUser(newUser);

        // 2. Publish USER_CREATED event — email-service picks this up via SQS.
        //    Fire-and-forget: we await so errors surface in logs, but we still return the user.
        try {
            await this.snsService.publishUserCreated(savedUser.id, savedUser.email);
        } catch (err) {
            // Don't fail user creation if SNS is unavailable.
            this.logger.error(`Failed to publish USER_CREATED SNS event: ${err}`);
        }

        return savedUser;
    }

    async findOne(id: string) {
        return this.dynamoService.getUser(id)
    }

    async findAll() {
        return this.dynamoService.getAllUsers();
    }
}