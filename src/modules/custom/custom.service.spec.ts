import { Test, TestingModule } from '@nestjs/testing';
import { CustomService } from './custom.service';
import { DynamoService } from '../dynamo/dynamo.service';
import { CreateCustomDto } from './dto/create-custom.dto';

// Creamos un mock del DynamoService
const mockDynamoService = {
  putItem: jest.fn(),
};

describe('CustomService', () => {
  let service: CustomService;
  let dynamoService: DynamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomService,
        {
          provide: DynamoService,
          useValue: mockDynamoService,
        },
      ],
    }).compile();

    service = module.get<CustomService>(CustomService);
    dynamoService = module.get<DynamoService>(DynamoService);
  });

  // Limpiamos los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear un nuevo item y devolverlo con un id y fecha', async () => {
      const createCustomDto: CreateCustomDto = {
       tipo: 'Test',
        datos: [{ clave: 'valor1' }, { clave: 'valor2' }],
      };

      // Configuramos el mock para que no haga nada cuando se llame a putItem
      mockDynamoService.putItem.mockResolvedValue(undefined);

      const result = await service.create(createCustomDto);

      // 1. Verificamos que se llamó a putItem
      expect(dynamoService.putItem).toHaveBeenCalled();

      // 2. Verificamos que el resultado tiene las propiedades esperadas
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('fecha_creacion');
      expect(result.tipo).toBe(createCustomDto.tipo);
      expect(result.datos).toEqual(createCustomDto.datos);
    });
  });
});
