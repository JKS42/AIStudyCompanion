import { Pressable, Text, View } from "react-native";
import type { NoteWithFiles } from "../../types/note";
import { formatFileSize } from "../../constants/upload";
import { StatusBadge } from "./StatusBadge";
import { colors } from "../../theme/colors";
import { radii, spacing } from "../../theme/spacing";

const sourceLabels = {
  typed: "Text note",
  pdf: "PDF",
  image: "Image",
  voice: "Audio"
} as const;

type Props = {
  note: NoteWithFiles;
  onPress?: (note: NoteWithFiles) => void;
  onRetry?: (note: NoteWithFiles) => void;
};

export function NoteCard({ note, onPress, onRetry }: Props) {
  const file = note.uploaded_files[0];
  const subtitle =
    note.source_type === "typed"
      ? note.raw_text?.slice(0, 80) ?? "Text note"
      : file
        ? `${sourceLabels[note.source_type]} · ${formatFileSize(file.file_size_bytes)}`
        : sourceLabels[note.source_type];

  const cardStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
  };

  const body = (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.sm }}>
        <Text
          style={{ flex: 1, color: colors.textPrimary, fontSize: 16, fontWeight: "700" }}
          numberOfLines={1}
        >
          {note.title}
        </Text>
        <StatusBadge status={note.status} />
      </View>

      {note.subject ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{note.subject}</Text>
      ) : null}

      <Text style={{ color: colors.textSecondary }} numberOfLines={2}>
        {subtitle}
      </Text>

      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
        {new Date(note.created_at).toLocaleString()}
      </Text>
    </>
  );

  return (
    <View style={cardStyle}>
      {onPress ? <Pressable onPress={() => onPress(note)}>{body}</Pressable> : body}

      {note.status === "failed" && onRetry ? (
        <Pressable onPress={() => onRetry(note)}>
          <Text style={{ color: colors.link, fontWeight: "600" }}>Retry upload</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
