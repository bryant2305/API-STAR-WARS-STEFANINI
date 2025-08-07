import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateCustomDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsObject()
  @IsNotEmpty()
  datos: Record<string, any>;
}
