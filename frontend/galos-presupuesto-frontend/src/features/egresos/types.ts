export interface Gasto {
  id: number;
  gasto: string;
  categoria: string;
  medio_pago: 'Tarjeta' | 'Efectivo'; // Limita los valores a solo estas dos opciones
  monto: number;
  cuota_actual: number;
  cuotas_totales: number;
  mes: number;
  year: number;
  gasto_fijo: boolean;
}

export interface Ingreso {
  id: number;
  monto: number;
  origen: string;
  mes: number;
  year: number;
}