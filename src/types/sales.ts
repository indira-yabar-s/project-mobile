export type OrderStatus = 'COMPLETADA' | 'PENDIENTE' | 'ANULADA';

export type PaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TARJETA' | 'TRANSFERENCIA';

export type SalesChannel = 'TIENDA' | 'WHATSAPP' | 'INSTAGRAM' | 'TIKTOK' | 'OTRO';

export interface SalesOrderLine {
  id: number;
  varianteId: number;
  varianteDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface SalesOrder {
  id: number;
  empresaId: number;
  clienteId: number | null;
  clienteNombre: string | null;
  fechaEmision: string;
  estado: OrderStatus;
  medioPago: PaymentMethod;
  canal: SalesChannel;
  total: number;
  detalles: SalesOrderLine[];
}
