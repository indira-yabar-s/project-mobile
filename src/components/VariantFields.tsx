import type { Control } from 'react-hook-form';
import { FormTextField } from './FormTextField';

export interface VariantFieldValues {
  talla: string;
  color: string;
  sku: string;
  stockMinimo: string;
  stockInicial: string;
}

interface VariantFieldsProps {
  control: Control<VariantFieldValues>;
  withInitialStock?: boolean;
}

const isNonNegativeInteger = (value: string) => Number.isInteger(Number(value)) && Number(value) >= 0;

export function VariantFields({ control, withInitialStock = false }: VariantFieldsProps) {
  return (
    <>
      <FormTextField
        control={control}
        name="talla"
        label="Talla"
        placeholder="Ej: M"
        rules={{ required: 'La talla es obligatoria' }}
      />
      <FormTextField
        control={control}
        name="color"
        label="Color"
        placeholder="Ej: Negro"
        rules={{ required: 'El color es obligatorio' }}
      />
      <FormTextField control={control} name="sku" label="SKU" placeholder="Opcional" autoCapitalize="characters" />
      <FormTextField
        control={control}
        name="stockMinimo"
        label="Stock mínimo"
        placeholder="0"
        keyboardType="number-pad"
        hint="Avisa cuando el stock llegue a este valor."
        rules={{
          validate: (value) =>
            value.trim() === '' || isNonNegativeInteger(value) || 'Debe ser un número entero, 0 o mayor',
        }}
      />
      {withInitialStock ? (
        <FormTextField
          control={control}
          name="stockInicial"
          label="Stock inicial"
          placeholder="0"
          keyboardType="number-pad"
          hint="Opcional. Unidades que ya tienes."
          rules={{
            validate: (value) =>
              value.trim() === '' || isNonNegativeInteger(value) || 'Debe ser un número entero, 0 o mayor',
          }}
        />
      ) : null}
    </>
  );
}
