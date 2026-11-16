import { Controller, type Control, type FieldValues, type Path, type RegisterOptions } from 'react-hook-form';
import { View } from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

type FormRules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
>;

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> {
  control: Control<T>;
  name: Path<T>;
  rules?: FormRules<T>;
  hint?: string;
}

export function FormTextField<T extends FieldValues>({
  control,
  name,
  rules,
  hint,
  ...inputProps
}: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <View>
          <TextInput
            mode="outlined"
            value={String(value ?? '')}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(error)}
            {...inputProps}
          />
          <HelperText type={error ? 'error' : 'info'} visible={Boolean(error?.message || hint)}>
            {error?.message ?? hint}
          </HelperText>
        </View>
      )}
    />
  );
}
