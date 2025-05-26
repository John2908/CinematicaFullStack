import { Body, Controller, Post } from '@nestjs/common';
import { MruService } from './mru.service';
import { MRUDto } from './dto/Mru.dto';

@Controller('mru')
export class MruController {
  constructor(private readonly mruService: MruService) {}

  @Post()
  calcular(@Body() dto: MRUDto) {
    return this.mruService.calcular(dto);
  }
}

