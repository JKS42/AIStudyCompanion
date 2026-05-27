import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FlashcardReviewScreen } from "../../features/flashcards/screens/FlashcardReviewScreen";
import { LibraryScreen } from "../../features/library/screens/LibraryScreen";
import { NoteDetailScreen } from "../../features/notes/screens/NoteDetailScreen";
import { QuizPlayScreen } from "../../features/quiz/screens/QuizPlayScreen";
import { QuizResultScreen } from "../../features/quiz/screens/QuizResultScreen";
import { UploadScreen } from "../../features/upload/screens/UploadScreen";
import type { QuizAttemptBreakdown } from "../../types/quiz";

export type LibraryStackParamList = {
  LibraryHome: undefined;
  NoteDetail: { noteId: string };
  QuizPlay: { quizId: string };
  QuizResult: {
    quizId: string;
    quizTitle: string;
    scorePercent: number;
    correctCount: number;
    total: number;
    breakdown: QuizAttemptBreakdown[];
  };
  FlashcardReview: { noteId: string };
  Upload: {
    retryNoteId?: string;
    title?: string;
  };
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export function LibraryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="LibraryHome"
        component={LibraryScreen}
        options={{ title: "Library" }}
      />
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ title: "Note" }}
      />
      <Stack.Screen name="QuizPlay" component={QuizPlayScreen} options={{ title: "Quiz" }} />
      <Stack.Screen
        name="QuizResult"
        component={QuizResultScreen}
        options={{ title: "Results" }}
      />
      <Stack.Screen
        name="FlashcardReview"
        component={FlashcardReviewScreen}
        options={{ title: "Flashcards" }}
      />
      <Stack.Screen name="Upload" component={UploadScreen} options={{ title: "Upload" }} />
    </Stack.Navigator>
  );
}
