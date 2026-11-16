import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';
import type { Product } from '../types/products';
import { FormDialog } from './FormDialog';
import { FormTextField } from './FormTextField';

interface PriceDialogProps {
  product: Product | null;
  onSubmit: (precioVenta: number) => Promise<void>;
  onCancel: () => void;
}

interface PriceFormValues {
  precioVenta: string;
}

function PriceDialogContent({ product, onSubmit, onCancel }: PriceDialogProps & { product: Product }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PriceFormValues>({
    mode: 'onChange',
    defaultValues: { precioVenta: String(product.precioVenta) },
  });

  return (
    <FormDialog
      visible
      title="Cambiar precio de venta"
      isSubmitting={isSubmitting}
      onSubmit={() => handleSubmit((values) => onSubmit(Number(values.precioVenta)))()}
      onDismiss={onCancel}
    >
      <Text variant="bodyMedium">{product.nombre}</Text>
      <FormTextField
        control={control}
        name="precioVenta"
        label="Nuevo precio (S/)"
        keyboardType="decimal-pad"
        autoFocus
        rules={{
          required: 'El precio es obligatorio',
          validate: (value) => Number(value) > 0 || 'El precio debe ser mayor a 0',
        }}
      />
    </FormDialog>
  );
}

export function PriceDialog({ product, onSubmit, onCancel }: PriceDialogProps) {
  if (!product) return null;
  return <PriceDialogContent key={product.id} product={product} onSubmit={onSubmit} onCancel={onCancel} />;
}
