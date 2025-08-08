import { Module } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Module({
  providers: [
    {
      provide: 'DYNAMODB_CLIENT',
      useFactory: () => {
        if (process.env.IS_OFFLINE) {
          // Conexión local
          return new DynamoDBClient({
            region: 'us-east-1',
            endpoint: 'http://localhost:8000',
            credentials: {
              accessKeyId: 'MockAccessKeyId',
              secretAccessKey: 'MockSecretAccessKey',
            },
          });
        }
        return new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-east-1',
        });
      },
    },
    {
      provide: DynamoDBDocumentClient,
      inject: ['DYNAMODB_CLIENT'],
      useFactory: (client: DynamoDBClient) => {
        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
  exports: ['DYNAMODB_CLIENT', DynamoDBDocumentClient],
})
export class DynamoModule {}
