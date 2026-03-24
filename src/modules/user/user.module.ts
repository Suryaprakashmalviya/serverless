import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { DynamoService } from "../../aws/dynamo.service";
import { UserResolver } from "./user.resolver";

@Module({
    imports:[],
    providers:[UserService, DynamoService, UserResolver]
})

export class UserModule {}