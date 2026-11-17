export type OrderMode = 'sale' | 'purchase';

export interface OrderLine {
  key: string;
  productoId: string;
  varianteId: string;
  cantidad: string;
  precioUnitario: string;
  stock: number | null;
}

export interface OrderLineErrors {
  productoId?: string;
  varianteId?: string;
  cantidad?: string;
  precioUnitario?: string;
}

let keyCounter = 0;

export function createLineKey(): string {
  keyCounter += 1;
  return `line-${keyCounter}`;
}

export function createEmptyLine(): OrderLine {
  return { key: createLineKey(), productoId: '', varianteId: '', cantidad: '1', precioUnitario: '', stock: null };
}

export function createPrefilledLine(values: {
  productoId: number;
  varianteId: number;
  cantidad: number;
  precioUnitario: number;
}): OrderLine {
  return {
    key: createLineKey(),
    productoId: String(values.productoId),
    varianteId: String(values.varianteId),
    cantidad: String(values.cantidad),
    precioUnitario: values.precioUnitario > 0 ? String(values.precioUnitario) : '',
    stock: null,
  };
}

export function validateLine(line: OrderLine, mode: OrderMode): OrderLineErrors {
  const errors: OrderLineErrors = {};

  if (!line.productoId) errors.productoId = 'Elige un producto';
  if (!line.varianteId) errors.varianteId = 'Elige una variante';

  const amount = Number(line.cantidad);
  if (line.cantidad.trim() === '') {
    errors.cantidad = 'Obligatoria';
  } else if (!Number.isInteger(amount) || amount < 1) {
    errors.cantidad = 'Entero mayor a 0';
  } else if (mode === 'sale' && line.stock !== null && amount > line.stock) {
    errors.cantidad = `Solo hay ${line.stock}`;
  }

  if (line.precioUnitario.trim() === '') {
    errors.precioUnitario = 'Obligatorio';
  } else if (!(Number(line.precioUnitario) > 0)) {
    errors.precioUnitario = 'Debe ser mayor a 0';
  }

  return errors;
}

export function hasErrors(errors: OrderLineErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getLineSubtotal(line: OrderLine): number {
  return (Number(line.cantidad) || 0) * (Number(line.precioUnitario) || 0);
}

export function getOrderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + getLineSubtotal(line), 0);
}
