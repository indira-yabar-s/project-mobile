import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';
import type { ProductVariant } from '../types/products';
import { FormDialog } from './FormDialog';
import { FormTextField } from './FormTextField';

interface StockEntryDialogProps {
  variant: ProductVariant | null;
  onSubmit: (values: { cantidad: number; motivo: string | null }) => Promise<void>;
  onCancel: () => void;
}

interface StockEntryValues {
  cantidad: string;
  motivo: string;
}

function StockEntryContent({ variant, onSubmit, onCancel }: StockEntryDialogProps & { variant: ProductVariant }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<StockEntryValues>({ mode: 'onChange', defaultValues: { cantidad: '', motivo: '' } });

  return (
    <FormDialog
      visible
      title="Registrar entrada de stock"
      submitLabel="Registrar entrada"
      isSubmitting={isSubmitting}
      onSubmit={() =>
        handleSubmit((values) =>
          onSubmit({ cantidad: Number(values.cantidad), motivo: values.motivo.trim() || null }),
        )()
      }
      onDismiss={onCancel}
    >
      <Text variant="bodyMedium">{`Talla ${variant.talla} · ${variant.color} (stock actual: ${variant.stock})`}</Text>
      <FormTextField
        control={control}
        name="cantidad"
        label="Cantidad"
        keyboardType="number-pad"
        autoFocus
        rules={{
          required: 'La cantidad es obligatoria',
          validate: (value) =>
            (Number.isInteger(Number(value)) && Number(value) >= 1) || 'La cantidad debe ser un entero mayor a 0',
        }}
      />
      <FormTextField control={control} name="motivo" label="Motivo" placeholder="Ej: Compra inicial" hint="Opcional." />
    </FormDialog>
  );
}

export function StockEntryDialog({ variant, onSubmit, onCancel }: StockEntryDialogProps) {
  if (!variant) return null;
  return <StockEntryContent key={variant.id} variant={variant} onSubmit={onSubmit} onCancel={onCancel} />;
}
