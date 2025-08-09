import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { FusionService } from './fusion.service';
import { SwapiService } from '../shared/swapi.service';
import { DynamoService } from '../dynamo/dynamo.service';
import { CacheService } from '../cache/cache.service';
import { WeatherService } from '../shared/weather.service';

const feature = loadFeature('./test/features/fusion/fusion.feature');

// Mocks para todas las dependencias
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

defineFeature(feature, (test) => {
  let service: FusionService;
  let result: any;
  const characterId = 1;

  beforeAll(() => {
    process.env.DYNAMO_TABLE = 'test-table';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FusionService,
        { provide: SwapiService, useValue: mockSwapiService },
        { provide: DynamoService, useValue: mockDynamoService },
        { provide: CacheService, useValue: mockCacheService },
        { provide: WeatherService, useValue: {} }, // Mock vacío si no se usa directamente
      ],
    }).compile();
    service = module.get<FusionService>(FusionService);
    jest.clearAllMocks();
  });

  test('Obtener datos fusionados cuando existen en caché (Cache HIT)', ({
    given,
    when,
    then,
    and,
  }) => {
    const cachedData = { nombre_personaje: 'Luke (desde caché)' };

    given(
      `que los datos del personaje "${characterId}" existen en el caché`,
      () => {
        mockCacheService.get.mockResolvedValue(cachedData);
      },
    );

    when(
      `solicito los datos fusionados para el personaje "${characterId}"`,
      async () => {
        result = await service.getFusedData(characterId);
      },
    );

    then('el sistema devuelve los datos directamente desde el caché', () => {
      expect(result).toEqual(cachedData);
      expect(mockCacheService.get).toHaveBeenCalledWith(
        `fusion:v2:character:${characterId}`,
      );
    });

    and('no se realizan llamadas a las APIs externas de SWAPI', () => {
      expect(mockSwapiService.getPerson).not.toHaveBeenCalled();
    });
  });

  test('Obtener datos fusionados cuando no existen en caché (Cache MISS)', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      `que los datos del personaje "${characterId}" no existen en el caché`,
      () => {
        mockCacheService.get.mockResolvedValue(null);
      },
    );

    and(
      'las APIs externas de SWAPI devuelven datos válidos para el personaje y su planeta',
      () => {
        mockSwapiService.getPerson.mockResolvedValue({
          name: 'Luke',
          homeworld: 'TatooineURL',
        });
        mockSwapiService.getPlanet.mockResolvedValue({
          name: 'Tatooine',
          climate: 'arid',
          population: '200000',
        });
      },
    );

    when(
      `solicito los datos fusionados para el personaje "${characterId}"`,
      async () => {
        result = await service.getFusedData(characterId);
      },
    );

    then('el sistema obtiene los datos de las APIs externas', () => {
      expect(mockSwapiService.getPerson).toHaveBeenCalledWith(characterId);
      expect(result.nombre_personaje).toBe('Luke');
    });

    and(
      'los datos fusionados se guardan en el caché para futuras solicitudes',
      () => {
        expect(mockCacheService.set).toHaveBeenCalled();
      },
    );

    and('los datos fusionados se guardan en el historial de DynamoDB', () => {
      expect(mockDynamoService.putItem).toHaveBeenCalled();
    });
  });

  test('Obtener el historial de fusiones', ({ given, when, then }) => {
    given('que existen datos en el historial de fusiones', () => {
      mockDynamoService.scanTablePaginated.mockResolvedValue({
        items: [{ id: '1' }],
        lastKey: { id: 'some-key' },
      });
    });

    when('solicito el historial sin un punto de paginación', async () => {
      result = await service.getHistory(10, undefined);
    });

    then(
      'el sistema devuelve una lista de items y una clave para la siguiente página',
      () => {
        expect(result.items).toHaveLength(1);
        expect(result.nextKey).toBeDefined();
      },
    );
  });
});
