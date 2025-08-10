import { Test, TestingModule } from '@nestjs/testing';
import { FusionService } from './fusion.service';
import { DynamoService } from '../dynamo/dynamo.service';
import { CacheService } from '../cache/cache.service';
import { SwapiService } from '../shared/swapi.service';
import { WeatherService } from '../shared/weather.service';
import { NotFoundException } from '@nestjs/common';

describe('FusionService', () => {
  let service: FusionService;

  const mockSwapiService = {
    getPerson: jest.fn(),
    getPlanet: jest.fn(),
  };

  const mockDynamoService = {
    putItem: jest.fn().mockResolvedValue(undefined),
    scanTablePaginated: jest
      .fn()
      .mockResolvedValue({ items: [], lastKey: undefined }),
  };

  const mockCacheService = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };

  const mockWeatherService = {
    getWeather: jest.fn().mockResolvedValue({ temperature: 25 }),
  };

  beforeAll(() => {
    // tabla de pruebas
    process.env.DYNAMO_TABLE = 'test-table';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FusionService,
        { provide: SwapiService, useValue: mockSwapiService },
        { provide: DynamoService, useValue: mockDynamoService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: WeatherService, useValue: mockWeatherService },
      ],
    }).compile();

    service = module.get<FusionService>(FusionService);
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getFusedData', () => {
    const characterId = 1;
    const cacheKey = `fusion:v2:character:${characterId}`;

    it('debería devolver datos del caché si existen (Cache HIT)', async () => {
      const cachedData = { nombre_personaje: 'Luke (desde caché)' };
      mockCacheService.get.mockResolvedValueOnce(cachedData);

      const result = await service.getFusedData(characterId);

      expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(result).toEqual(cachedData);
      expect(mockSwapiService.getPerson).not.toHaveBeenCalled();
      expect(mockDynamoService.putItem).not.toHaveBeenCalled();
    });

    it('debería obtener datos de las APIs si no hay caché (Cache MISS)', async () => {
      // Cache miss
      mockCacheService.get.mockResolvedValueOnce(null);

      const mockPerson = {
        name: 'Luke Skywalker',
        homeworld: 'https://swapi.dev/api/planets/1/',
      };
      const mockPlanet = {
        name: 'Tatooine',
        climate: 'arid',
        population: '200000',
      };

      mockSwapiService.getPerson.mockResolvedValueOnce(mockPerson);
      mockSwapiService.getPlanet.mockResolvedValueOnce(mockPlanet);
      mockWeatherService.getWeather.mockResolvedValueOnce({ temperature: 25 });

      const result = await service.getFusedData(characterId);

      // verificaciones básicas
      expect(mockSwapiService.getPerson).toHaveBeenCalledWith(characterId);
      expect(mockSwapiService.getPlanet).toHaveBeenCalledWith(
        mockPerson.homeworld,
      );
      // sólo comprobamos que se invocó el servicio de clima (no forzamos coordenadas aquí)
      expect(mockWeatherService.getWeather).toHaveBeenCalled();

      // cache.set con la clave correcta y objeto que contiene las propiedades esperadas
      expect(mockCacheService.set).toHaveBeenCalledWith(
        cacheKey,
        expect.objectContaining({
          nombre_personaje: 'Luke Skywalker',
          planeta_origen: 'Tatooine',
          temperatura_planeta: 25,
        }),
        1800,
      );

      // se insertó en DynamoDB con la tabla de entorno
      expect(mockDynamoService.putItem).toHaveBeenCalledWith(
        process.env.DYNAMO_TABLE,
        expect.any(Object),
      );

      // el resultado contiene las propiedades fusionadas
      expect(result).toEqual(
        expect.objectContaining({
          nombre_personaje: 'Luke Skywalker',
          planeta_origen: 'Tatooine',
          temperatura_planeta: 25,
        }),
      );
    });

    it('debería lanzar NotFoundException si el personaje no se encuentra', async () => {
      mockCacheService.get.mockResolvedValueOnce(null);
      mockSwapiService.getPerson.mockResolvedValueOnce(null);

      await expect(service.getFusedData(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getHistory', () => {
    it('debería devolver el historial paginado y codificar nextKey', async () => {
      const mockItems = [{ id: '1', nombre_personaje: 'Vader' }];
      const mockDynamoResponse = {
        items: mockItems,
        lastKey: { id: 'some-key' },
      };
      mockDynamoService.scanTablePaginated.mockResolvedValueOnce(
        mockDynamoResponse,
      );

      const result = await service.getHistory(10, undefined);

      expect(mockDynamoService.scanTablePaginated).toHaveBeenCalledWith(
        process.env.DYNAMO_TABLE,
        10,
        undefined,
      );
      expect(result.items).toEqual(mockItems);
      expect(result.nextKey).toBe(
        Buffer.from(JSON.stringify({ id: 'some-key' })).toString('base64'),
      );
    });
  });
});
