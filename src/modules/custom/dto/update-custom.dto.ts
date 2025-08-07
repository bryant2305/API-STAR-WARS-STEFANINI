import { PartialType } from '@nestjs/swagger';
import { CreateCustomDto } from './create-custom.dto';

export class UpdateCustomDto extends PartialType(CreateCustomDto) {}
