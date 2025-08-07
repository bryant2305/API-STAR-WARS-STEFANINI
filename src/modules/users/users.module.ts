import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DynamoService } from 'src/modules/dynamo/dynamo.service';

@Module({
  providers: [UsersService, DynamoService],
  exports: [UsersService],
})
export class UsersModule {}
