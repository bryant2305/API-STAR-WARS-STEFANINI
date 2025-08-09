import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { DynamoService } from 'src/modules/dynamo/dynamo.service';

@Injectable()
export class UsersService {
  private readonly tableName = process.env.USERS_TABLE;

  constructor(private readonly dynamoService: DynamoService) {}

  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const result = await this.dynamoService.queryTable(
      this.tableName,
      'email = :email',
      { ':email': email },
      'email-index',
    );

    return result.length ? (result[0] as User) : undefined;
  }

  async findAll(): Promise<User[]> {
    const rawUsers = await this.dynamoService.scanTable(this.tableName);
    return rawUsers.map((item) => item as User);
  }

  async getUserById(id: string): Promise<User | null> {
    return (await this.dynamoService.getItem(this.tableName, { id })) as User;
  }
}
