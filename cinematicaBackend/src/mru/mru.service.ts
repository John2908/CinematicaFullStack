import { Injectable, BadRequestException } from '@nestjs/common';
import { MRUDto, CalculoMRU } from './dto/Mru.dto';

@Injectable()
export class MruService {
  private convertirADistanciaEnMetros(valor: string): number {
    const regex = /^([\d.]+)\s*(m|km|mi|ft)?$/i;
    const match = valor.match(regex);
    if (!match) throw new BadRequestException(`Distancia inválida: ${valor}`);
    const cantidad = parseFloat(match[1]);
    const unidad = (match[2] || 'm').toLowerCase();

    switch (unidad) {
      case 'km': return cantidad * 1000;
      case 'mi': return cantidad * 1609.34;
      case 'ft': return cantidad * 0.3048;
      case 'm': return cantidad;
      default: throw new BadRequestException(`Unidad de distancia no soportada: ${unidad}`);
    }
  }

  private convertirATiempoEnSegundos(valor: string): number {
    const regex = /^([\d.]+)\s*(s|min|h)?$/i;
    const match = valor.match(regex);
    if (!match) throw new BadRequestException(`Tiempo inválido: ${valor}`);
    const cantidad = parseFloat(match[1]);
    const unidad = (match[2] || 's').toLowerCase();

    switch (unidad) {
      case 'h': return cantidad * 3600;
      case 'min': return cantidad * 60;
      case 's': return cantidad;
      default: throw new BadRequestException(`Unidad de tiempo no soportada: ${unidad}`);
    }
  }

  private convertirAVelocidadLegible(valorEnMps: number): string {
    return `${valorEnMps.toFixed(2)} m/s`;
  }

  calcular(dto: MRUDto): any {
    const {
      velocidad,
      distanciaInicial,
      distanciaFinal,
      tiempoInicial,
      tiempoFinal,
      posicionInicial,
      posicionFinal,
      tipoCalculo,
    } = dto;

    switch (tipoCalculo) {
      case CalculoMRU.VELOCIDAD: {
        const d1 = this.convertirADistanciaEnMetros(distanciaInicial || posicionInicial || '0');
        const d2 = this.convertirADistanciaEnMetros(distanciaFinal || posicionFinal || '0');
        const t1 = this.convertirATiempoEnSegundos(tiempoInicial || '0');
        const t2 = this.convertirATiempoEnSegundos(tiempoFinal || '0');

        const distancia = d2 - d1;
        const tiempo = t2 - t1;
        if (tiempo === 0) throw new BadRequestException('El tiempo no puede ser cero');
        const velocidad = distancia / tiempo;

        return { resultado: this.convertirAVelocidadLegible(velocidad) };
      }

      case CalculoMRU.POSICION_FINAL: {
        const v = this.convertirAVelocidad(velocidad || '0');
        const x0 = this.convertirADistanciaEnMetros(posicionInicial || distanciaInicial || '0');
        const t1 = this.convertirATiempoEnSegundos(tiempoInicial || '0');
        const t2 = this.convertirATiempoEnSegundos(tiempoFinal || '0');

        const posicionFinal = x0 + v * (t2 - t1);
        return { resultado: `${posicionFinal.toFixed(2)} m` };
      }

      case CalculoMRU.TIEMPO: {
        const d1 = this.convertirADistanciaEnMetros(distanciaInicial || posicionInicial || '0');
        const d2 = this.convertirADistanciaEnMetros(distanciaFinal || posicionFinal || '0');
        const v = this.convertirAVelocidad(velocidad || '0');

        if (v === 0) throw new BadRequestException('La velocidad no puede ser cero');
        const tiempo = (d2 - d1) / v;
        return { resultado: `${tiempo.toFixed(2)} s` };
      }

      default:
        throw new BadRequestException('Tipo de cálculo no soportado');
    }
  }

  private convertirAVelocidad(valor: string): number {
    const regex = /^([\d.]+)\s*(m\/s|km\/h|mi\/h)?$/i;
    const match = valor.match(regex);
    if (!match) throw new BadRequestException(`Velocidad inválida: ${valor}`);
    const cantidad = parseFloat(match[1]);
    const unidad = (match[2] || 'm/s').toLowerCase();

    switch (unidad) {
      case 'km/h': return cantidad / 3.6;
      case 'mi/h': return cantidad * 0.44704;
      case 'm/s': return cantidad;
      default: throw new BadRequestException(`Unidad de velocidad no soportada: ${unidad}`);
    }
  }
}
