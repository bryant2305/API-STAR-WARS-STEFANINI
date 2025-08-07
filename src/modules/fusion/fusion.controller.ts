import {
  Controller,
  Get,
  ValidationPipe,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { FusionService } from './fusion.service';
import { HistoryQueryDto } from './dto/history-query.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Fusion')
@Controller('fusion')
export class FusionController {
  constructor(private readonly fusionService: FusionService) {}

  @Get('fusionados/:id')
  getFusedData(@Param('id', ParseIntPipe) characterId: number) {
    return this.fusionService.getFusedData(characterId);
  }

  @Get('historial')
  getHistory(
    @Query(new ValidationPipe({ transform: true })) query: HistoryQueryDto,
  ) {
    return this.fusionService.getHistory(query.limit, query.lastKey);
  }
}
