import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

@Injectable()
export class CacheService {
  private readonly tableName = process.env.CACHE_TABLE;
  private readonly docClient: DynamoDBDocumentClient;

  constructor() {
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
    this.docClient = DynamoDBDocumentClient.from(client);
  }

  /**
   * Obtiene un valor del caché de DynamoDB.
   * @param key La clave del caché.
   * @returns El valor cacheado o null si no existe o ha expirado.
   */
  async get<T>(key: string): Promise<T | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id: key },
    });

    try {
      const { Item } = await this.docClient.send(command);
      // DynamoDB TTL elimina los items expirados automáticamente,
      if (Item && Item.ttl > Math.floor(Date.now() / 1000)) {
        return Item.value as T;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener del caché de DynamoDB:', error);
      return null;
    }
  }

  /**
   * Guarda un valor en el caché de DynamoDB con un TTL.
   * @param key La clave del caché.
   * @param value El valor a cachear.
   * @param ttlSeconds El tiempo de vida en segundos.
   */
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const ttl = Math.floor(Date.now() / 1000) + ttlSeconds;
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        id: key,
        value,
        ttl,
      },
    });

    try {
      await this.docClient.send(command);
    } catch (error) {
      console.error('Error al guardar en el caché de DynamoDB:', error);
    }
  }
}
