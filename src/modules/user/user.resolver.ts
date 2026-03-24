import { Args, Mutation, Query, Resolver, ResolveReference } from "@nestjs/graphql";
import { UserService } from "./user.service";
import { CreateUserInput, User } from "./user.model";
import { S3Service } from "../../aws/s3.service";

@Resolver(() => User)
export class UserResolver {
    constructor(
        private readonly userService: UserService,
        private readonly s3Service: S3Service,
    ) {}

    @Query(() => User, { name: 'user' })
    async getUser(@Args('id', { type: () => String }) id: string) {
        return this.userService.findOne(id);
    }

    @Mutation(() => User, { name: 'createUser' })
    async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
        return this.userService.create(createUserInput);
    }

    @Query(() => [User])
    async getAllUsers() {
        return this.userService.findAll();
    }

    /**
     * Returns a pre-signed S3 URL the client uses to upload a profile picture directly.
     * The frontend does:  PUT <url>  with the image binary — backend never handles the bytes.
     * Expires in 3600 seconds (1 hour).
     */
    @Query(() => String, { name: 'getProfileUploadUrl' })
    async getProfileUploadUrl(
        @Args('userId', { type: () => String }) userId: string,
    ): Promise<string> {
        return this.s3Service.getProfileUploadUrl(userId);
    }

    @ResolveReference()
    async resolveReference(reference: { __typename: string; id: string }) {
        return this.userService.findOne(reference.id);
    }
}