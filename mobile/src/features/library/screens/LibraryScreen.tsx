import { useCallback } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../../app/providers/AuthProvider";
import { NoteCard } from "../../../components/ui/NoteCard";
import { useNotes } from "../../../hooks/useNotes";
import type { NoteWithFiles } from "../../../types/note";
import type { LibraryStackParamList } from "../../../app/navigation/LibraryStack";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";

type Props = NativeStackScreenProps<LibraryStackParamList, "LibraryHome">;

export function LibraryScreen({ navigation }: Props) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { data: notes = [], isLoading, isRefetching, refetch, error } = useNotes(userId);

  const handleOpenNote = useCallback(
    (note: NoteWithFiles) => {
      navigation.navigate("NoteDetail", { noteId: note.id });
    },
    [navigation]
  );

  const handleRetry = useCallback(
    (note: NoteWithFiles) => {
      navigation.navigate("Upload", { retryNoteId: note.id, title: note.title });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.textPrimary }}>
              Study Library
            </Text>
            <Text style={{ marginTop: spacing.xs, color: colors.textSecondary }}>
              {notes.length} item{notes.length === 1 ? "" : "s"}
            </Text>
          </View>
          <Button
            color={colors.brandPrimary}
            title="Upload"
            onPress={() => navigation.navigate("Upload", {})}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
        ) : error ? (
          <Text style={{ color: colors.error }}>
            {error instanceof Error ? error.message : "Could not load library."}
          </Text>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
            }
            contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.xxl }}
            ListEmptyComponent={
              <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
                <Text style={{ color: colors.textSecondary }}>
                  No study materials yet. Upload your first note or PDF.
                </Text>
                <Button
                  color={colors.brandPrimary}
                  title="Upload material"
                  onPress={() => navigation.navigate("Upload", {})}
                />
              </View>
            }
            renderItem={({ item }) => (
              <NoteCard note={item} onPress={handleOpenNote} onRetry={handleRetry} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
