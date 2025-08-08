import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomDto {
  @ApiProperty({
    description: 'Tipo de la entidad personalizada',
    example: 'vehiculo',
  })
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @ApiProperty({
    description: 'Datos personalizados de la entidad',
    type: 'object',
    example: { nombre: 'X-Wing', modelo: 'T-65B' },
  })
  @IsObject()
  @IsNotEmpty()
  datos: Record<string, any>;
}
