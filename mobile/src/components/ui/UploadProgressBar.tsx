import { Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

type Props = {
  percent: number;
  label?: string;
};

export function UploadProgressBar({ percent, label }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text> : null}
      <View
        style={{
          height: 8,
          backgroundColor: colors.border,
          borderRadius: radii.sm,
          overflow: "hidden"
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${clamped}%`,
            backgroundColor: colors.brandPrimary
          }}
        />
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{clamped}%</Text>
    </View>
  );
}
