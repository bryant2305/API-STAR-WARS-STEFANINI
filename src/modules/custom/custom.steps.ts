import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { CustomService } from './custom.service';
import { DynamoService } from '../dynamo/dynamo.service';
import { CreateCustomDto } from './dto/create-custom.dto';

const feature = loadFeature('./test/features/custom/custom.feature');

// Mock del DynamoService
const mockDynamoService = {
  putItem: jest.fn(),
};

defineFeature(feature, (test) => {
  let service: CustomService;
  let createDto: CreateCustomDto;
  let result: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomService,
        { provide: DynamoService, useValue: mockDynamoService },
      ],
    }).compile();

    service = module.get<CustomService>(CustomService);
    jest.clearAllMocks();
  });

  test('Creación exitosa de un nuevo dato personalizado', ({
    given,
    when,
    then,
    and,
  }) => {
    given('un DTO con datos válidos para crear un recurso', () => {
      createDto = {
        tipo: 'Prueba BDD',
        datos: [{ clave: 'valor' }],
      };
    });

    when('el servicio intenta crear el recurso', async () => {
      // Simula que putItem no devuelve nada, solo completa la promesa
      mockDynamoService.putItem.mockResolvedValue(undefined);
      result = await service.create(createDto);
    });

    then('el recurso es creado exitosamente', () => {
      expect(result).toBeDefined();
      expect(result.tipo).toBe(createDto.tipo);
      expect(result.datos).toEqual(createDto.datos);
    });

    and('el resultado devuelto contiene un "id" y una "fecha_creacion"', () => {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fecha_creacion');
    });

    and('el servicio de base deatos es invocado para guardar el item', () => {
      expect(mockDynamoService.putItem).toHaveBeenCalled();
    });
  });
});
