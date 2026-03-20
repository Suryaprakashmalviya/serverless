import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { DynamoService } from "../../aws/dynamo.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UserService {
    constructor(private readonly dynamoService: DynamoService) { }

    async create(createUserDto: CreateUserDto) {
        const newUser = {
            id: uuidv4(),
            ...createUserDto,
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