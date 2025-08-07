import { Injectable } from '@nestjs/common';
import { DynamoDBClient, ScanCommandInput } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoService {
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    this.docClient = DynamoDBDocumentClient.from(client);
  }

  async putItem(tableName: string, item: Record<string, any>) {
    await this.docClient.send(
      new PutCommand({
        TableName: tableName,
        Item: item,
      }),
    );
  }

  async getItem(tableName: string, key: Record<string, any>) {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: tableName,
        Key: key,
      }),
    );
    return result.Item;
  }

  async deleteItem(tableName: string, key: Record<string, any>) {
    await this.docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key,
      }),
    );
  }

  async scanTable(tableName: string) {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: tableName,
      }),
    );
    return result.Items;
  }

  async scanTablePaginated<T>(
    tableName: string,
    limit: number,
    lastEvaluatedKey?: Record<string, any>,
  ): Promise<{ items: T[]; lastKey?: Record<string, any> }> {
    const params: ScanCommandInput = {
      TableName: tableName,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const result = await this.docClient.send(new ScanCommand(params));

    return {
      items: result.Items as T[],
      lastKey: result.LastEvaluatedKey,
    };
  }
}
