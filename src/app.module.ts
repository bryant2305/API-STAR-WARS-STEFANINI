import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DynamoModule } from './modules/dynamo/dynamo.module';
import { FusionModule } from './modules/fusion/fusion.module';
import { CustomModule } from './modules/custom/custom.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    // AuthModule,
    AuthModule,
    DynamoModule,
    FusionModule,
    CustomModule,
    // EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
