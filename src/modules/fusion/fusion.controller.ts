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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/jwt-auth-guard';
import { ThrottlerByUserGuard } from 'src/auth/throttler-by-user.guard';

@ApiTags('Fusion')
@Controller('fusion')
@UseGuards(JwtGuard, ThrottlerByUserGuard)
export class FusionController {
  constructor(private readonly fusionService: FusionService) {}

  @Get('fusionados/:id')
  @ApiBearerAuth()
  getFusedData(@Param('id', ParseIntPipe) characterId: number) {
    return this.fusionService.getFusedData(characterId);
  }

  @Get('historial')
  @ApiBearerAuth()
  getHistory(
    @Query(new ValidationPipe({ transform: true })) query: HistoryQueryDto,
  ) {
    return this.fusionService.getHistory(query.limit, query.lastKey);
  }
}
