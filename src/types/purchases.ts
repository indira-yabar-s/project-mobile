import type { OrderStatus } from './sales';

export interface PurchaseOrderLine {
  id: number;
  varianteId: number;
  varianteDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: number;
  empresaId: number;
  proveedorId: number;
  proveedorRazonSocial: string;
  fechaEmision: string;
  estado: OrderStatus;
  total: number;
  detalles: PurchaseOrderLine[];
}

export interface PurchaseOrderPayload {
  proveedorId: number;
  detalles: { varianteId: number; cantidad: number; precioUnitario: number }[];
}

export interface SupplierPayload {
  ruc: string;
  razonSocial: string;
  telefono: string | null;
  correo: string | null;
}

export interface Supplier {
  id: number;
  ruc: string;
  razonSocial: string;
  telefono: string | null;
  correo: string | null;
}
