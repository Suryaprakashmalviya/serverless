import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { DynamoService } from "../../aws/dynamo.service";

@Module({
    imports:[],
    controllers:[UserController],
    providers:[UserService, DynamoService]
})

export class UserModule {}