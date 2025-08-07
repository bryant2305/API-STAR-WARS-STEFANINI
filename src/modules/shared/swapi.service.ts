import {
  Injectable,
  Logger,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import axios, { isAxiosError } from 'axios';

@Injectable()
export class SwapiService {
  private readonly logger = new Logger(SwapiService.name);

  async getPerson(id: number) {
    try {
      this.logger.log(`Buscando personaje con ID: ${id}`);
      const res = await axios.get(`https://swapi.info/api/people/${id}`);
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          `Error de Axios al buscar personaje ${id}: ${error.message}`,
        );
        if (error.response?.status === 404) {
          throw new NotFoundException(
            `El personaje con ID ${id} no fue encontrado en SWAPI.`,
          );
        }
      } else {
        this.logger.error(`Error inesperado al buscar personaje ${id}:`, error);
      }
      throw new HttpException(
        'Error al comunicarse con SWAPI',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getPlanet(url: string) {
    try {
      this.logger.log(`Buscando planeta con URL: ${url}`);
      const res = await axios.get(url);
      return res.data;
    } catch (error) {
      if (isAxiosError(error)) {
        this.logger.error(
          `Error de Axios al buscar planeta ${url}: ${error.message}`,
        );
        if (error.response?.status === 404) {
          throw new NotFoundException(
            `El planeta en la URL ${url} no fue encontrado.`,
          );
        }
      } else {
        this.logger.error(`Error inesperado al buscar planeta ${url}:`, error);
      }
      throw new HttpException(
        'Error al comunicarse con SWAPI',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
