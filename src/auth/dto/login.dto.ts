import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'Damaris@gmail.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Admin123' })
  password: string;
}
