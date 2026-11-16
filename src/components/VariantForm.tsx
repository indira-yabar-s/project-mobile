import { useForm } from 'react-hook-form';
import { FormDialog } from './FormDialog';
import { VariantFields, type VariantFieldValues } from './VariantFields';

interface VariantFormProps {
  visible: boolean;
  onSubmit: (values: { talla: string; color: string; sku: string | null; stockMinimo: number; stockInicial: number }) => Promise<boolean>;
  onCancel: () => void;
}

const EMPTY_VALUES: VariantFieldValues = { talla: '', color: '', sku: '', stockMinimo: '', stockInicial: '' };

function VariantFormContent({ onSubmit, onCancel }: Omit<VariantFormProps, 'visible'>) {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<VariantFieldValues>({ mode: 'onChange', defaultValues: EMPTY_VALUES });

  return (
    <FormDialog
      visible
      title="Nueva variante"
      submitLabel="Agregar variante"
      isSubmitting={isSubmitting}
      onSubmit={() =>
        handleSubmit(async (values) => {
          await onSubmit({
            talla: values.talla.trim(),
            color: values.color.trim(),
            sku: values.sku.trim() || null,
            stockMinimo: values.stockMinimo.trim() === '' ? 0 : Number(values.stockMinimo),
            stockInicial: values.stockInicial.trim() === '' ? 0 : Number(values.stockInicial),
          });
        })()
      }
      onDismiss={onCancel}
    >
      <VariantFields control={control} withInitialStock />
    </FormDialog>
  );
}

export function VariantForm({ visible, onSubmit, onCancel }: VariantFormProps) {
  if (!visible) return null;
  return <VariantFormContent onSubmit={onSubmit} onCancel={onCancel} />;
}
