import { Body, Controller, Post } from '@nestjs/common';
import { MRUVDto } from './dto/mruv.dto';
import { MruvService } from './mruv.service';

@Controller('mruv')
export class MruvController {
  constructor(private readonly mruvService: MruvService) {}

  @Post()
  calcular(@Body() dto: MRUVDto) {
    return this.mruvService.calcular(dto);
  }
}



