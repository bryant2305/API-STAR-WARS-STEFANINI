import { PartialType } from '@nestjs/swagger';
import { CreateFusionDto } from './create-fusion.dto';

export class UpdateFusionDto extends PartialType(CreateFusionDto) {}
