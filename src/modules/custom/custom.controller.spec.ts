import { Test, TestingModule } from '@nestjs/testing';
import { CustomController } from './custom.controller';
import { CustomService } from './custom.service';
import { CreateCustomDto } from './dto/create-custom.dto';

// Mock del CustomService
const mockCustomService = {
  create: jest.fn((dto) => {
    return {
      id: 'un-uuid-aleatorio',
      fecha_creacion: new Date().toISOString(),
      ...dto,
    };
  }),
};

describe('CustomController', () => {
  let controller: CustomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomController],
      providers: [
        {
          provide: CustomService,
          useValue: mockCustomService,
        },
      ],
    }).compile();

    controller = module.get<CustomController>(CustomController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a customService.create y devolver el resultado', async () => {
      const dto: CreateCustomDto = {
        tipo: 'Test',
        datos: [{ clave: 'valor1' }, { clave: 'valor2' }],
      };
      const result = await controller.create(dto);

      // Verificamos que el método create del servicio fue llamado con el DTO correcto
      expect(mockCustomService.create).toHaveBeenCalledWith(dto);

      // Verificamos que el resultado devuelto es el esperado
      expect(result).toEqual({
        id: expect.any(String),
        fecha_creacion: expect.any(String),
        ...dto,
      });
    });
  });
});
