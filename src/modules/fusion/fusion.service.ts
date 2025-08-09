import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DynamoService } from '../dynamo/dynamo.service';
import { SwapiService } from '../shared/swapi.service';
import { WeatherService } from '../shared/weather.service';
import { v4 as uuidv4 } from 'uuid';
import { planetCoordinates } from '../../enums/coordanates.enum';
import { CacheService } from '../cache/cache.service'; // Importamos el nuevo servicio

@Injectable()
export class FusionService {
  private readonly tableName = process.env.DYNAMO_TABLE;
  private readonly CACHE_TTL_SECONDS = 1800; // 30 minutos

  constructor(
    private readonly swapiService: SwapiService,
    private readonly weatherService: WeatherService,
    private readonly dynamo: DynamoService,
    private readonly cacheService: CacheService,
  ) {}

  async getFusedData(characterId: number) {
    const cacheKey = `fusion:v2:character:${characterId}`;

    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData) {
      console.log(`Cache HIT para personaje ${characterId} desde DynamoDB.`);
      return cachedData;
    }
    console.log(`Cache Miss para personaje ${characterId}.`);

    // 2) Si no hay caché, obtener datos externos
    try {
      const person = await this.swapiService.getPerson(characterId);
      if (!person) {
        throw new NotFoundException(`Personaje ${characterId} no encontrado.`);
      }

      const planet = await this.swapiService.getPlanet(person.homeworld);
      if (!planet) {
        throw new NotFoundException(`Planeta de ${person.name} no encontrado.`);
      }

      const coords = planetCoordinates[planet.name];
      if (!coords) {
        throw new NotFoundException(
          `Coordenadas no disponibles para ${planet.name}.`,
        );
      }

      const population =
        planet.population === 'unknown' ? 0 : parseInt(planet.population, 10);

      const fusion = {
        id: uuidv4(),
        fecha_creacion: new Date().toISOString(),
        nombre_personaje: person.name,
        planeta_origen: planet.name,
        clima_planeta: planet.climate,
        poblacion_planeta: population,
      };

      // 3) Guardamos en el caché de DynamoDB con un TTL de 30 minutos
      await this.cacheService.set(cacheKey, fusion, this.CACHE_TTL_SECONDS);
      console.log(
        `Cache SET para ${cacheKey} en DynamoDB (TTL ${this.CACHE_TTL_SECONDS}s)`,
      );

      // 4) Guardar el resultado en la tabla principal de datos (tu lógica existente)
      await this.dynamo.putItem(this.tableName, fusion);

      return fusion;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Error al contactar servicios externos:', error);
      throw new HttpException(
        'Error al procesar la solicitud de fusión de datos',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getHistory(limit = 10, lastKey?: string) {
    let parsedKey: Record<string, any> | undefined;
    if (lastKey) {
      try {
        parsedKey = JSON.parse(
          Buffer.from(lastKey, 'base64').toString('utf-8'),
        );
      } catch (error) {
        throw new HttpException(
          'El parámetro lastKey es inválido.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const result = await this.dynamo.scanTablePaginated(
      this.tableName,
      limit,
      parsedKey,
    );

    const nextKey = result.lastKey
      ? Buffer.from(JSON.stringify(result.lastKey)).toString('base64')
      : null;

    return {
      count: result.items.length,
      items: result.items,
      nextKey: nextKey,
    };
  }
}
