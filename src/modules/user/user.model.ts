import { Directive, Field, ID, InputType, ObjectType } from "@nestjs/graphql";

@ObjectType()
@Directive('@key(fields: "id")')
export class User {

    @Field(() => ID, { description: 'User ID' })
    id: string;

    @Field({ description: 'User Name' })
    name: string;

    @Field({ description: 'User Email' })
    email: string;

    @Field({ description: 'S3 URL of the user profile picture', nullable: true })
    profilePictureUrl?: string;
}

@InputType()
export class CreateUserInput {
    @Field({ description: 'User Name' })
    name: string;

    @Field({ description: 'User Email' })
    email: string;
}