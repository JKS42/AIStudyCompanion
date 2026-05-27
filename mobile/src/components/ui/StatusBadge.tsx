import { Text, View } from "react-native";
import type { NoteStatus } from "../../types/note";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

const statusConfig: Record<
  NoteStatus,
  { label: string; background: string; foreground: string }
> = {
  processing: {
    label: "Processing",
    background: colors.brandPrimaryMuted,
    foreground: colors.brandPrimary
  },
  uploaded: {
    label: "Uploaded",
    background: "#E0F2FE",
    foreground: colors.info
  },
  ready: {
    label: "Ready",
    background: "#D1FAE5",
    foreground: colors.brandAccent
  },
  failed: {
    label: "Failed",
    background: "#FEE2E2",
    foreground: colors.error
  }
};

type Props = {
  status: NoteStatus;
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: config.background,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radii.sm
      }}
    >
      <Text style={{ color: config.foreground, fontSize: 12, fontWeight: "700" }}>
        {config.label}
      </Text>
    </View>
  );
}
