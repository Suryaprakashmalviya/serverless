import { Args, Mutation, Query, Resolver, ResolveReference } from "@nestjs/graphql";
import { UserService } from "./user.service";
import { CreateUserInput, User } from "./user.model";

@Resolver(()=> User)
export class UserResolver {
    constructor(private readonly userService: UserService){}

    @Query(()=> User, {name: 'user'})
    async getUSer(@Args('id', {type: ()=> String }) id: string) {
        return this.userService.findOne(id)
    }

    @Mutation(()=> User, {name: 'createUser'})
    async createUser(@Args('createUserInput') createUserInput: CreateUserInput){
        return this.userService.create(createUserInput)
    }

    @Query(()=> [User])
    async getAllUsers(){
        return this.userService.findAll()
    }


    @ResolveReference()
    async resolveReference(reference: { __typename: string; id: string }) {
        return this.userService.findOne(reference.id);
    }
}