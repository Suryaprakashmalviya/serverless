import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { UserService } from './modules/user/user.service';
import { DynamoService } from './aws/dynamo.service';
import { UserResolver } from './modules/user/user.resolver';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 }, // Automatically generates the schema in memory based on our decorators
    }),
  ],
  providers: [UserService, DynamoService, UserResolver], // Swapped Controller for Resolver
})
export class AppModule {}
