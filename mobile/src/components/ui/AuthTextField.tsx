import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
} & TextInputProps;

export function AuthTextField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...inputProps
}: Props<T>) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: colors.textPrimary }}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor={colors.textMuted}
            style={{
              borderWidth: 1,
              borderColor: error ? colors.error : colors.border,
              padding: spacing.md,
              borderRadius: radii.md,
              backgroundColor: colors.inputBackground,
              color: colors.textPrimary
            }}
            {...inputProps}
          />
        )}
      />
      {error ? <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}
