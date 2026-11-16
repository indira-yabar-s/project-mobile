import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';
import type { ProductVariant, VariantPayload } from '../types/products';
import { FormDialog } from './FormDialog';
import { VariantFields, type VariantFieldValues } from './VariantFields';

interface VariantEditDialogProps {
  variant: ProductVariant | null;
  onSubmit: (payload: VariantPayload) => Promise<void>;
  onCancel: () => void;
}

function VariantEditContent({ variant, onSubmit, onCancel }: VariantEditDialogProps & { variant: ProductVariant }) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VariantFieldValues>({
    mode: 'onChange',
    defaultValues: {
      talla: variant.talla,
      color: variant.color,
      sku: variant.sku ?? '',
      stockMinimo: String(variant.stockMinimo ?? 0),
      stockInicial: '',
    },
  });

  return (
    <FormDialog
      visible
      title="Editar variante"
      submitLabel="Guardar cambios"
      isSubmitting={isSubmitting}
      onSubmit={() =>
        handleSubmit((values) =>
          onSubmit({
            talla: values.talla.trim(),
            color: values.color.trim(),
            sku: values.sku.trim() || null,
            stockMinimo: values.stockMinimo.trim() === '' ? 0 : Number(values.stockMinimo),
          }),
        )()
      }
      onDismiss={onCancel}
    >
      <Text variant="bodyMedium">
        Cambia los datos de la variante. Para modificar las unidades usa los botones de stock.
      </Text>
      <VariantFields control={control} />
    </FormDialog>
  );
}

export function VariantEditDialog({ variant, onSubmit, onCancel }: VariantEditDialogProps) {
  if (!variant) return null;
  return <VariantEditContent key={variant.id} variant={variant} onSubmit={onSubmit} onCancel={onCancel} />;
}
