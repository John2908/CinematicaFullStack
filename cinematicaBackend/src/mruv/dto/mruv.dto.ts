import { IsOptional, IsEnum, IsString } from "class-validator";

export enum CalculoMRUV {
  POSICION_FINAL = 'posicionFinal',
  VELOCIDAD_FINAL = 'velocidadFinal',
  TIEMPO = 'tiempo',
  ACELERACION = 'aceleracion',
}

export class MRUVDto {
  @IsOptional()
  @IsString()
  posicionInicial?: string;

  @IsOptional()
  @IsString()
  posicionFinal?: string;

  @IsOptional()
  @IsString()
  velocidadInicial?: string;

  @IsOptional()
  @IsString()
  velocidadFinal?: string;

  @IsOptional()
  @IsString()
  tiempoInicial?: string;

  @IsOptional()
  @IsString()
  tiempoFinal?: string;

  @IsOptional()
  @IsString()
  aceleracionInicial?: string;

  @IsOptional()
  @IsString()
  aceleracionFinal?: string;

  @IsEnum(CalculoMRUV, {
    message: 'Tipo de cálculo no válido. Opciones válidas: posicionFinal, velocidadFinal, tiempo, aceleracion',
  })
  tipoCalculo: CalculoMRUV;
}
