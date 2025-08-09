import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CustomService } from './custom.service';
import { CreateCustomDto } from './dto/create-custom.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt-auth-guard';

@ApiTags('Custom')
@Controller('almacenar')
export class CustomController {
  constructor(private readonly customService: CustomService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(@Body(new ValidationPipe()) createCustomDto: CreateCustomDto) {
    return this.customService.create(createCustomDto);
  }
}
