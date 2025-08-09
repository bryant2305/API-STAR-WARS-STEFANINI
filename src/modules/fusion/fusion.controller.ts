import {
  Controller,
  Get,
  ValidationPipe,
  Query,
  ParseIntPipe,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FusionService } from './fusion.service';
import { HistoryQueryDto } from './dto/history-query.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/jwt-auth-guard';

@ApiTags('Fusion')
@Controller('fusion')
export class FusionController {
  constructor(private readonly fusionService: FusionService) {}

  @Get('fusionados/:id')
  @UseGuards(JwtGuard)
  getFusedData(@Param('id', ParseIntPipe) characterId: number) {
    return this.fusionService.getFusedData(characterId);
  }

  @Get('historial')
  @UseGuards(JwtGuard)
  getHistory(
    @Query(new ValidationPipe({ transform: true })) query: HistoryQueryDto,
  ) {
    return this.fusionService.getHistory(query.limit, query.lastKey);
  }
}
