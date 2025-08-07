import { Test, TestingModule } from '@nestjs/testing';
import { FusionController } from './fusion.controller';
import { FusionService } from './fusion.service';

describe('FusionController', () => {
  let controller: FusionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FusionController],
      providers: [FusionService],
    }).compile();

    controller = module.get<FusionController>(FusionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
