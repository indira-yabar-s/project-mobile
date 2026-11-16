export type UnitOfMeasure = 'UNIDAD' | 'DOCENA' | 'METRO' | 'ROLLO';

export interface Category {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  empresaId: number;
}

export interface CategoryPayload {
  nombre: string;
  descripcion: string | null;
}

export interface Product {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  unidadMedida: UnitOfMeasure;
  precioCompra: number | null;
  precioVenta: number;
  activo: boolean;
  categoriaId: number | null;
  categoriaNombre: string | null;
  empresaId: number;
  stockTotal: number | null;
}

export interface ProductPayload {
  codigo: string;
  nombre: string;
  descripcion: string;
  unidadMedida: UnitOfMeasure;
  precioCompra: number | null;
  precioVenta: number;
  categoriaId: number | null;
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

export interface VariantPayload {
  talla: string;
  color: string;
  sku: string | null;
  stockMinimo: number;
}

export interface StockMovement {
  id: number;
  stockResultante: number | null;
}
