import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller('users')
export class UserController {
    constructor(private readonly userservice: UserService){}

    @Post()
    @UsePipes(new ValidationPipe())
    create(@Body() createUserDto: CreateUserDto){
     return this.userservice.create(createUserDto)
    }

    @Get()
    async findAll(){
        return this.userservice.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string){
        return this.userservice.findOne(id);
    }
}