import type { OrderStatus, PaymentMethod, SalesChannel } from '../types/sales';

interface Option<T extends string> {
  value: T;
  label: string;
}

export const PAYMENT_METHODS: Option<PaymentMethod>[] = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'PLIN', label: 'Plin' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
];

export const SALES_CHANNELS: Option<SalesChannel>[] = [
  { value: 'TIENDA', label: 'Tienda' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'OTRO', label: 'Otro' },
];

export function labelOf<T extends string>(options: Option<T>[], value: string | null | undefined): string {
  return options.find((option) => option.value === value)?.label ?? value ?? '—';
}

export const ORDER_STATUS_BADGES: Record<OrderStatus, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  COMPLETADA: { variant: 'success', label: 'Completada' },
  PENDIENTE: { variant: 'warning', label: 'Pendiente' },
  ANULADA: { variant: 'danger', label: 'Anulada' },
};
