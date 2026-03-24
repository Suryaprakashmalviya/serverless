import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: { federation: 2 }, // Auto-generates schema from decorators
    }),
    UserModule, // All user-domain providers (UserService, DynamoService, SecretsService, S3Service, SnsService) are scoped here
  ],
})
export class AppModule {}
