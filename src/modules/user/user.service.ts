import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
    private users: (CreateUserDto & { id: number })[] = [];

    create(CreateUserDto: CreateUserDto) {
        const newUser = {id: Date.now(), ...CreateUserDto};
        this.users.push(newUser);
        return newUser;
    }

    findAll(){
        return this.users;
    }
}