import {
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { SwapiPerson, SwapiPlanet } from './interfaces/swappi.interface';

@Injectable()
export class SwapiService {
  private readonly logger = new Logger(SwapiService.name);
  private readonly swapiBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.swapiBaseUrl =
      this.configService.get<string>('SWAPI_BASE_URL') ||
      'https://swapi.info/api/people/';
  }

  private async fetchFromSwapi<T>(endpointOrUrl: string): Promise<T> {
    const isFullUrl = endpointOrUrl.startsWith('http');
    const url = isFullUrl
      ? endpointOrUrl
      : `${this.swapiBaseUrl}/${endpointOrUrl}`;

    try {
      const res = await lastValueFrom(this.httpService.get<T>(url));
      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.isAxiosError) {
        this.logger.error(
          `Error de Axios en la petición a ${url}: ${axiosError.message}`,
        );
        if (axiosError.response?.status === 404) {
          throw new NotFoundException(`Recurso no encontrado en: ${url}`);
        }
      } else {
        this.logger.error(`Error inesperado al consumir SWAPI:`, error);
      }

      throw new HttpException(
        'Error al comunicarse con SWAPI',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getPerson(id: number): Promise<SwapiPerson> {
    this.logger.log(`Buscando personaje con ID: ${id}`);
    return this.fetchFromSwapi<SwapiPerson>(`people/${id}`);
  }

  async getPlanet(url: string): Promise<SwapiPlanet> {
    this.logger.log(`Buscando planeta con URL: ${url}`);
    return this.fetchFromSwapi<SwapiPlanet>(url);
  }
}
