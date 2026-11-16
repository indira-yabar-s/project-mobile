import { Controller, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form';
import { SelectField, type SelectOption } from './SelectField';

type FormRules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

interface FormSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: SelectOption[];
  rules?: FormRules<T>;
  emptyLabel?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function FormSelectField<T extends FieldValues>({
  control,
  name,
  rules,
  ...selectProps
}: FormSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <SelectField
          {...selectProps}
          value={String(value ?? '')}
          onChange={onChange}
          error={error?.message}
        />
      )}
    />
  );
}
