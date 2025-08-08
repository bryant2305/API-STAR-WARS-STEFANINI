import { Test, TestingModule } from '@nestjs/testing';
import { FusionService } from './fusion.service';
import { SwapiService } from '../shared/swapi.service';
import { WeatherService } from '../shared/weather.service';
import { DynamoService } from '../dynamo/dynamo.service';
import { CacheService } from '../cache/cache.service';
import { NotFoundException } from '@nestjs/common';

// Arrange: Mocks para todas las dependencias externas
const mockSwapiService = {
  getPerson: jest.fn(),
  getPlanet: jest.fn(),
};
const mockDynamoService = {
  putItem: jest.fn(),
  scanTablePaginated: jest.fn(),
};
const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('FusionService', () => {
  let service: FusionService;

  beforeAll(() => {
    // Set environment variables for the test
    process.env.DYNAMO_TABLE = 'test-table';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FusionService,
        { provide: SwapiService, useValue: mockSwapiService },
        { provide: DynamoService, useValue: mockDynamoService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: WeatherService, useValue: {} },
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
      mockCacheService.get.mockResolvedValue(cachedData);

      const result = await service.getFusedData(characterId);

      expect(result).toEqual(cachedData);
      expect(mockCacheService.get).toHaveBeenCalledWith(cacheKey);
      expect(mockSwapiService.getPerson).not.toHaveBeenCalled();
      expect(mockDynamoService.putItem).not.toHaveBeenCalled();
    });

    it('debería obtener datos de las APIs si no hay caché (Cache MISS)', async () => {
      const mockPerson = {
        name: 'Luke Skywalker',
        homeworld: 'https://swapi.dev/api/planets/1/',
      };
      const mockPlanet = {
        name: 'Tatooine',
        climate: 'arid',
        population: '200000',
      };
      mockCacheService.get.mockResolvedValue(null);
      mockSwapiService.getPerson.mockResolvedValue(mockPerson);
      mockSwapiService.getPlanet.mockResolvedValue(mockPlanet);

      const result = (await service.getFusedData(characterId)) as any;

      expect(mockSwapiService.getPerson).toHaveBeenCalledWith(characterId);
      expect(mockSwapiService.getPlanet).toHaveBeenCalledWith(
        mockPerson.homeworld,
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(
        cacheKey,
        expect.any(Object),
        1800,
      );
      expect(mockDynamoService.putItem).toHaveBeenCalled();
      expect(result.nombre_personaje).toBe('Luke Skywalker');
      expect(result.planeta_origen).toBe('Tatooine');
    });

    it('debería lanzar NotFoundException si el personaje no se encuentra', async () => {
      mockCacheService.get.mockResolvedValue(null);
      mockSwapiService.getPerson.mockResolvedValue(null);

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
      mockDynamoService.scanTablePaginated.mockResolvedValue(
        mockDynamoResponse,
      );

      const result = await service.getHistory(10, undefined);

      expect(mockDynamoService.scanTablePaginated).toHaveBeenCalledWith(
        'test-table',
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
