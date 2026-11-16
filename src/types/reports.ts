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

export interface ProductVariant {
  id: number;
  productoId: number;
  productoNombre: string;
  talla: string;
  color: string;
  sku: string;
  stock: number;
  stockMinimo: number;
  activo: boolean;
  stockBajo: boolean;
}

export interface DailySalesPoint {
  label: string;
  total: number;
}
