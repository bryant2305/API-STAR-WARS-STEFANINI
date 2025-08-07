import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { CustomService } from './custom.service';
import { CreateCustomDto } from './dto/create-custom.dto';

@Controller('almacenar')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post()
  create(@Body(new ValidationPipe()) createCustomDto: CreateCustomDto) {
    return this.customService.create(createCustomDto);
  }
}
