import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { UploadProgressBar } from "../../../components/ui/UploadProgressBar";
import { formatFileSize } from "../../../constants/upload";
import { useCreateTextNote, useUploadFileNote } from "../../../hooks/useNotes";
import { deleteNote } from "../../../services/notesService";
import type { PickedUpload } from "../../../types/note";
import { pickAudio, pickImage, pickPdfOrAudio } from "../pickers";
import type { LibraryStackParamList } from "../../../app/navigation/LibraryStack";
import { colors } from "../../../theme/colors";
import { radii, spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<LibraryStackParamList, "Upload">;
type UploadMode = "file" | "text";

export function UploadScreen({ navigation, route }: Props) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const retryNoteId = route.params?.retryNoteId;

  const [mode, setMode] = useState<UploadMode>("file");
  const [title, setTitle] = useState(route.params?.title ?? "");
  const [subject, setSubject] = useState("");
  const [rawText, setRawText] = useState("");
  const [pickedFile, setPickedFile] = useState<PickedUpload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const cancelledRef = useRef(false);

  const textNoteMutation = useCreateTextNote(userId);
  const fileNoteMutation = useUploadFileNote(userId);

  const isBusy = textNoteMutation.isPending || fileNoteMutation.isPending;

  function resetProgress() {
    setProgress(0);
    cancelledRef.current = false;
  }

  function handleCancel() {
    cancelledRef.current = true;
    setError("Upload cancelled.");
    setProgress(0);
  }

  async function handlePickPdf() {
    setError(null);
    try {
      const file = await pickPdfOrAudio();
      setPickedFile(file);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch (e) {
      if (e instanceof Error && e.message.includes("cancelled")) return;
      setError(e instanceof Error ? e.message : "Could not pick file.");
    }
  }

  async function handlePickImage() {
    setError(null);
    try {
      const file = await pickImage();
      setPickedFile(file);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch (e) {
      if (e instanceof Error && e.message.includes("cancelled")) return;
      setError(e instanceof Error ? e.message : "Could not pick image.");
    }
  }

  async function handlePickAudio() {
    setError(null);
    try {
      const file = await pickAudio();
      setPickedFile(file);
      if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch (e) {
      if (e instanceof Error && e.message.includes("cancelled")) return;
      setError(e instanceof Error ? e.message : "Could not pick audio.");
    }
  }

  async function handleSubmit() {
    setError(null);
    resetProgress();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      if (mode === "text") {
        await textNoteMutation.mutateAsync({
          title: title.trim(),
          subject: subject.trim() || undefined,
          rawText
        });
      } else {
        if (!pickedFile) {
          setError("Choose a file to upload.");
          return;
        }

        await fileNoteMutation.mutateAsync({
          title: title.trim(),
          subject: subject.trim() || undefined,
          file: pickedFile,
          onProgress: setProgress,
          isCancelled: () => cancelledRef.current
        });
      }

      if (retryNoteId) {
        await deleteNote(retryNoteId).catch(() => undefined);
      }

      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Text style={{ fontSize: 24, fontWeight: "800", color: colors.textPrimary }}>
          Upload study material
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Add PDFs, images, audio, or typed notes to your library.
        </Text>

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {(["file", "text"] as UploadMode[]).map((value) => {
            const selected = mode === value;
            return (
              <Pressable
                key={value}
                onPress={() => setMode(value)}
                style={{
                  flex: 1,
                  padding: spacing.md,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: selected ? colors.brandPrimary : colors.border,
                  backgroundColor: selected ? colors.brandPrimaryMuted : colors.surface,
                  alignItems: "center"
                }}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: selected ? "700" : "500" }}>
                  {value === "file" ? "File upload" : "Typed note"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ gap: spacing.md }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textPrimary }}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Biology chapter 3"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.textPrimary }}>Subject (optional)</Text>
            <TextInput
              value={subject}
              onChangeText={setSubject}
              placeholder="Biology"
              placeholderTextColor={colors.textMuted}
              style={inputStyle}
            />
          </View>

          {mode === "text" ? (
            <View style={{ gap: 6 }}>
              <Text style={{ color: colors.textPrimary }}>Note text</Text>
              <TextInput
                value={rawText}
                onChangeText={setRawText}
                placeholder="Paste or type your notes..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                style={[inputStyle, { minHeight: 160 }]}
              />
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>Choose a file</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                <PickerButton label="PDF" onPress={handlePickPdf} disabled={isBusy} />
                <PickerButton label="Image" onPress={handlePickImage} disabled={isBusy} />
                <PickerButton label="Audio" onPress={handlePickAudio} disabled={isBusy} />
              </View>

              {pickedFile ? (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radii.md,
                    padding: spacing.md,
                    gap: spacing.xs
                  }}
                >
                  <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{pickedFile.name}</Text>
                  <Text style={{ color: colors.textSecondary }}>
                    {pickedFile.mimeType} · {formatFileSize(pickedFile.size)}
                  </Text>
                </View>
              ) : null}
            </View>
          )}

          {isBusy ? (
            <View style={{ gap: spacing.sm }}>
              <UploadProgressBar
                percent={mode === "file" ? progress : 50}
                label={mode === "file" ? "Uploading..." : "Saving note..."}
              />
              {mode === "file" ? (
                <Button color={colors.error} title="Cancel upload" onPress={handleCancel} />
              ) : null}
            </View>
          ) : null}

          {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}

          <Button
            color={colors.brandPrimary}
            title={isBusy ? "Saving..." : "Save to library"}
            onPress={handleSubmit}
            disabled={isBusy}
          />

          {isBusy ? <ActivityIndicator color={colors.brandPrimary} /> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PickerButton({
  label,
  onPress,
  disabled
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radii.md,
        opacity: disabled ? 0.6 : 1
      }}
    >
      <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: colors.border,
  padding: spacing.md,
  borderRadius: radii.md,
  backgroundColor: colors.inputBackground,
  color: colors.textPrimary
};
