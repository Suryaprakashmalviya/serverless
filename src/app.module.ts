import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { DynamoService } from './aws/dynamo.service';

@Module({
  imports: [UserModule],
  controllers: [AppController],
  providers: [AppService, DynamoService],
})
export class AppModule { }  
