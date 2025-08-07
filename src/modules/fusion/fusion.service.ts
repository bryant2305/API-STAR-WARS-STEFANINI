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
import { planetCoordinates } from 'src/enums/coordanates.enum';

@Injectable()
export class FusionService {
  private readonly tableName = process.env.DYNAMO_TABLE;

  constructor(
    private readonly swapiService: SwapiService,
    private readonly weatherService: WeatherService,
    private readonly dynamo: DynamoService,
  ) {}

  async getFusedData(characterId: number) {
    try {
      // 1. Obtener datos del personaje
      const person = await this.swapiService.getPerson(characterId);
      if (!person) {
        throw new NotFoundException(
          `Personaje con ID ${characterId} no encontrado.`,
        );
      }

      // 2. Obtener datos del planeta
      const planet = await this.swapiService.getPlanet(person.homeworld);
      if (!planet) {
        throw new NotFoundException(
          `Planeta de origen para ${person.name} no encontrado.`,
        );
      }

      // 3. Obtener coordenadas del planeta (simuladas)
      const coords = planetCoordinates[planet.name];
      if (!coords) {
        throw new NotFoundException(
          `Coordenadas para el planeta ${planet.name} no disponibles.`,
        );
      }

      // 4. Obtener datos del clima
      const weather = await this.weatherService.getWeather(
        coords.lat,
        coords.lon,
      );

      // 5. Normalizar y fusionar datos
      const population =
        planet.population === 'unknown' ? 0 : parseInt(planet.population, 10);

      const fusion = {
        id: uuidv4(), // ID único para este registro de fusión
        fecha_creacion: new Date().toISOString(),
        nombre_personaje: person.name,
        planeta_origen: planet.name,
        clima_planeta: planet.climate,
        temperatura_actual: `${weather.temperature} ${weather.temperature_unit}`,
        poblacion_planeta: population,
        id_personaje_swapi: characterId,
      };

      // 6. Almacenar en DynamoDB
      await this.dynamo.putItem(this.tableName, fusion);
      return fusion;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Lanza un error genérico si una de las APIs externas falla
      throw new HttpException(
        'Error al contactar servicios externos',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getHistory(limit = 10, lastKey?: string) {
    // El lastKey desde API Gateway llega como un string, necesitamos convertirlo a objeto si existe.
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

    // Codificamos la siguiente clave para que sea segura en una URL
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
