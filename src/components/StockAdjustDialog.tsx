import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';
import type { ProductVariant } from '../types/products';
import { FormDialog } from './FormDialog';
import { FormTextField } from './FormTextField';

interface StockAdjustDialogProps {
  variant: ProductVariant | null;
  onSubmit: (values: { nuevoStock: number; motivo: string | null }) => Promise<void>;
  onCancel: () => void;
}

interface StockAdjustValues {
  nuevoStock: string;
  motivo: string;
}

function StockAdjustContent({ variant, onSubmit, onCancel }: StockAdjustDialogProps & { variant: ProductVariant }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<StockAdjustValues>({ mode: 'onChange', defaultValues: { nuevoStock: '', motivo: '' } });

  return (
    <FormDialog
      visible
      title="Corregir stock"
      submitLabel="Corregir stock"
      isSubmitting={isSubmitting}
      onSubmit={() =>
        handleSubmit((values) =>
          onSubmit({ nuevoStock: Number(values.nuevoStock), motivo: values.motivo.trim() || null }),
        )()
      }
      onDismiss={onCancel}
    >
      <Text variant="bodyMedium">{`Talla ${variant.talla} · ${variant.color} (el sistema indica ${variant.stock} unidades)`}</Text>
      <FormTextField
        control={control}
        name="nuevoStock"
        label="Unidades que realmente tienes"
        keyboardType="number-pad"
        autoFocus
        hint="Cuenta lo que hay en tu almacén y escríbelo aquí. El sistema ajusta la diferencia."
        rules={{
          required: 'Escribe cuántas unidades tienes',
          validate: (value) =>
            (Number.isInteger(Number(value)) && Number(value) >= 0) || 'Debe ser un número entero, 0 o mayor',
        }}
      />
      <FormTextField
        control={control}
        name="motivo"
        label="Motivo"
        placeholder="Ej: Conteo de inventario"
        hint="Opcional."
      />
    </FormDialog>
  );
}

export function StockAdjustDialog({ variant, onSubmit, onCancel }: StockAdjustDialogProps) {
  if (!variant) return null;
  return <StockAdjustContent key={variant.id} variant={variant} onSubmit={onSubmit} onCancel={onCancel} />;
}
