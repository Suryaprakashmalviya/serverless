import { Injectable } from "@nestjs/common";
import { DynamoService } from "../../aws/dynamo.service";
import { v4 as uuidv4 } from "uuid";
import { CreateUserInput } from "./user.model";

@Injectable()
export class UserService {
    constructor(private readonly dynamoService: DynamoService) { }

    async create(createUserInput: CreateUserInput) {
        const newUser = {
            id: uuidv4(),
            ...createUserInput,
            createdAt: new Date().toISOString(),
        };
        return this.dynamoService.putUser(newUser);
    }

    async findOne(id: string) {
        return this.dynamoService.getUser(id)
    }

    async findAll() {
        return this.dynamoService.getAllUsers();
    }
}