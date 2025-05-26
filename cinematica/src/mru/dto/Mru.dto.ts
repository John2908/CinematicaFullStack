import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum CalculoMRU {
  VELOCIDAD = 'VELOCIDAD',
  POSICION_FINAL = 'POSICION_FINAL',
  TIEMPO = 'TIEMPO',
}

export class MRUDto {
  @IsOptional()
  @IsString()
  velocidad?: string;  

  @IsOptional()
  @IsString()
  distanciaInicial?: string;

  @IsOptional()
  @IsString()
  distanciaFinal?: string;

  @IsOptional()
  @IsString()
  tiempoInicial?: string;

  @IsOptional()
  @IsString()
  tiempoFinal?: string;

  @IsOptional()
  @IsString()
  posicionInicial?: string;

  @IsOptional()
  @IsString()
  posicionFinal?: string;

  @IsEnum(CalculoMRU, {
    message: 'Tipo de cálculo no válido. Opciones válidas: VELOCIDAD, POSICION_FINAL, TIEMPO',
  })
  tipoCalculo: CalculoMRU;
}
