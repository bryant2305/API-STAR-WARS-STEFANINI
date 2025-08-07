import { Injectable } from '@nestjs/common';
import { DynamoService } from '../dynamo/dynamo.service';
import { CreateCustomDto } from './dto/create-custom.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CustomService {
  private readonly tableName = process.env.DYNAMO_TABLE;

  constructor(private readonly dynamo: DynamoService) {}

  async create(createCustomDto: CreateCustomDto) {
    const newItem = {
      id: uuidv4(),
      fecha_creacion: new Date().toISOString(),
      ...createCustomDto,
    };

    await this.dynamo.putItem(this.tableName, newItem);
    return newItem;
  }
}
