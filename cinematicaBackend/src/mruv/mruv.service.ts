import { Injectable, BadRequestException } from '@nestjs/common';
import { MRUVDto, CalculoMRUV } from './dto/mruv.dto';

@Injectable()
export class MruvService {
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

  private convertirAVelocidadMPS(valor: string): number {
    const regex = /^([\d.]+)\s*(m\/s|km\/h|mi\/h|ft\/s)?$/i;
    const match = valor.match(regex);
    if (!match) throw new BadRequestException(`Velocidad inválida: ${valor}`);
    const cantidad = parseFloat(match[1]);
    const unidad = (match[2] || 'm/s').toLowerCase();

    switch (unidad) {
      case 'km/h': return cantidad / 3.6;
      case 'mi/h': return cantidad * 0.44704;
      case 'ft/s': return cantidad * 0.3048;
      case 'm/s': return cantidad;
      default: throw new BadRequestException(`Unidad de velocidad no soportada: ${unidad}`);
    }
  }

  private convertirAAceleracion(valor: string): number {
    const regex = /^([\d.]+)\s*(m\/s²|ft\/s²)?$/i;
    const match = valor.match(regex);
    if (!match) throw new BadRequestException(`Aceleración inválida: ${valor}`);
    const cantidad = parseFloat(match[1]);
    const unidad = (match[2] || 'm/s²').toLowerCase();

    switch (unidad) {
      case 'ft/s²': return cantidad * 0.3048;
      case 'm/s²': return cantidad;
      default: throw new BadRequestException(`Unidad de aceleración no soportada: ${unidad}`);
    }
  }

  calcular(dto: MRUVDto): any {
    const {
      tipoCalculo,
      posicionInicial,
      posicionFinal,
      velocidadInicial,
      velocidadFinal,
      tiempoInicial,
      tiempoFinal,
      aceleracionInicial,
    } = dto;

    const x0 = posicionInicial ? this.convertirADistanciaEnMetros(posicionInicial) : 0;
    const v0 = velocidadInicial ? this.convertirAVelocidadMPS(velocidadInicial) : 0;
    const a = aceleracionInicial ? this.convertirAAceleracion(aceleracionInicial) : 0;
    const t1 = tiempoInicial ? this.convertirATiempoEnSegundos(tiempoInicial) : 0;
    const t2 = tiempoFinal ? this.convertirATiempoEnSegundos(tiempoFinal) : 0;

    const deltaT = t2 - t1;

    switch (tipoCalculo) {
      case CalculoMRUV.POSICION_FINAL:
        const x = x0 + v0 * deltaT + 0.5 * a * Math.pow(deltaT, 2);
        const unidadPosicion = posicionInicial?.match(/[a-zA-Z]+/)?.[0]?.toLowerCase() || 'm';

        let resultadoPosicion = x;
        let sufijoPosicion = 'm';

        switch (unidadPosicion) {
          case 'ft':
            resultadoPosicion = x / 0.3048;
            sufijoPosicion = 'ft';
            break;
          case 'km':
            resultadoPosicion = x / 1000;
            sufijoPosicion = 'km';
            break;
          case 'mi':
            resultadoPosicion = x / 1609.34;
            sufijoPosicion = 'mi';
            break;
          case 'm':
          default:
            resultadoPosicion = x;
            sufijoPosicion = 'm';
            break;
        }

        return { resultado: `${resultadoPosicion.toFixed(2)} ${sufijoPosicion}` };

      case CalculoMRUV.VELOCIDAD_FINAL:
        const v = v0 + a * deltaT;
        const unidadVelocidad = velocidadInicial?.match(/[a-zA-Z\/]+/)?.[0]?.toLowerCase() || 'm/s';

        let resultadoVelocidad = v;
        let sufijoVelocidad = 'm/s';

        switch (unidadVelocidad) {
          case 'ft/s':
            resultadoVelocidad = v / 0.3048;
            sufijoVelocidad = 'ft/s';
            break;
          case 'km/h':
            resultadoVelocidad = v * 3.6;
            sufijoVelocidad = 'km/h';
            break;
          case 'mi/h':
            resultadoVelocidad = v * 2.23694;
            sufijoVelocidad = 'mi/h';
            break;
          case 'm/s':
          default:
            resultadoVelocidad = v;
            sufijoVelocidad = 'm/s';
            break;
        }

        return { resultado: `${resultadoVelocidad.toFixed(2)} ${sufijoVelocidad}` };

      case CalculoMRUV.TIEMPO: {
        const vi = this.convertirAVelocidadMPS(velocidadInicial || '0');
        const vf = this.convertirAVelocidadMPS(velocidadFinal || '0');
        const a = this.convertirAAceleracion(aceleracionInicial || '1');

        if (a === 0) throw new BadRequestException('La aceleración no puede ser cero');
        const t = (vf - vi) / a;
        return { resultado: `${t.toFixed(2)} s` };
      }

      case CalculoMRUV.ACELERACION: {
        const vf_calc = velocidadFinal ? this.convertirAVelocidadMPS(velocidadFinal) : 0; // << Aquí definimos correctamente vf
        const deltaV = vf_calc - v0;
        const a_calc = deltaV / deltaT;

        const unidadVelocidadOriginal = velocidadInicial?.match(/[a-zA-Z\/]+/)?.[0]?.toLowerCase() || 'm/s';

        let resultadoAceleracion = a_calc;
        let sufijoAceleracion = 'm/s²';

        switch (unidadVelocidadOriginal) {
          case 'ft/s':
            resultadoAceleracion = a_calc / 0.3048;
            sufijoAceleracion = 'ft/s²';
            break;
          case 'km/h':
            resultadoAceleracion = a_calc * (3600 / 1000);
            sufijoAceleracion = 'km/h²';
            break;
          case 'mi/h':
            resultadoAceleracion = a_calc * 2.23694;
            sufijoAceleracion = 'mi/h²';
            break;
          case 'm/s':
          default:
            resultadoAceleracion = a_calc;
            sufijoAceleracion = 'm/s²';
            break;
        }

        return { resultado: `${resultadoAceleracion.toFixed(2)} ${sufijoAceleracion}` };
      }
    }
  }
}
