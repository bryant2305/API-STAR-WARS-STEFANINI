import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DynamoModule } from './modules/dynamo/dynamo.module';
import { FusionModule } from './modules/fusion/fusion.module';
import { CustomModule } from './modules/custom/custom.module';
import { CacheModule } from './modules/cache/cache.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 5,
      },
    ]),
    AuthModule,
    DynamoModule,
    FusionModule,
    CustomModule,
    CacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
