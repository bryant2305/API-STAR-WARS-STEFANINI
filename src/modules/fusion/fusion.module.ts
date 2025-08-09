import { Module } from '@nestjs/common';
import { FusionService } from './fusion.service';
import { FusionController } from './fusion.controller';
import { DynamoService } from '../dynamo/dynamo.service';
import { WeatherService } from '../shared/weather.service';
import { SwapiService } from '../shared/swapi.service';
import { CacheService } from '../cache/cache.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [FusionController],
  providers: [
    FusionService,
    SwapiService,
    WeatherService,
    DynamoService,
    CacheService,
  ],
})
export class FusionModule {}
