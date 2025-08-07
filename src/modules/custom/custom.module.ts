import { Module } from '@nestjs/common';
import { CustomService } from './custom.service';
import { CustomController } from './custom.controller';
import { DynamoService } from '../dynamo/dynamo.service';

@Module({
  imports: [CustomModule],
  controllers: [CustomController],
  providers: [CustomService, DynamoService],
})
export class CustomModule {}
