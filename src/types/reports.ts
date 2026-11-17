export type SalesGrouping = 'MEDIO_PAGO' | 'CANAL' | 'CATEGORIA' | 'DIA_SEMANA' | 'HORA';

export type RankingCriterion = 'UNIDADES' | 'GANANCIA';

export interface SalesSummary {
  desde: string;
  hasta: string;
  numeroVentas: number;
  unidadesVendidas: number;
  totalVendido: number;
  costoTotal: number;
  ganancia: number;
  margenPorcentaje: number;
  descuentoTotal: number;
  ticketPromedio: number;
}

export interface GroupedSales {
  grupo: string;
  numeroVentas: number;
  unidades: number;
  total: number;
  porcentajeDelTotal: number;
}

export interface ProductRanking {
  productoId: number;
  codigo: string;
  producto: string;
  categoria: string;
  unidades: number;
  totalVendido: number;
  ganancia: number;
}

export interface DailySalesPoint {
  label: string;
  total: number;
}

export type RestockUrgency = 'AGOTADO' | 'CRITICO' | 'PRONTO' | 'PLANIFICAR';

export interface RestockSuggestion {
  varianteId: number;
  productoId: number;
  codigo: string;
  producto: string;
  talla: string;
  color: string;
  stock: number;
  stockMinimo: number;
  unidadesVendidas: number;
  ventaDiaria: number;
  diasRestantes: number | null;
  fechaAgotamiento: string | null;
  urgencia: RestockUrgency;
  cantidadSugerida: number;
  costoUnitario: number;
  costoEstimado: number;
  ventaEnRiesgoDiaria: number;
  proveedorId: number | null;
  proveedorRazonSocial: string | null;
}
