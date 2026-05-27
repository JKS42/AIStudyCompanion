import { config } from "../config.js";
import { callOpenAIJson } from "../lib/openai.js";
import { validateQuizQuestions } from "../lib/validators.js";
import { QUIZ_PROMPT_VERSION, buildQuizMessages } from "../prompts/quiz-v1.js";

function shuffleOptions(options, correctIndex) {
  const tagged = options.map((text, index) => ({ text, isCorrect: index === correctIndex }));
  for (let i = tagged.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j], tagged[i]];
  }
  const newCorrectIndex = tagged.findIndex((item) => item.isCorrect);
  return {
    options: tagged.map((item) => item.text),
    correctIndex: newCorrectIndex
  };
}

function fallbackQuiz(studyText, difficultyLevel) {
  const sentences = studyText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  const pool = sentences.length >= 4 ? sentences : [studyText.slice(0, 200)];
  const questionCount = Math.min(5, pool.length);
  const questions = [];

  for (let i = 0; i < questionCount; i += 1) {
    const correct = pool[i];
    const distractors = pool.filter((_, idx) => idx !== i).slice(0, 3);
    while (distractors.length < 3) {
      distractors.push(`Unrelated statement ${distractors.length + 1}`);
    }

    const options = [correct, ...distractors].map((s) => s.slice(0, 120));
    const shuffled = shuffleOptions(options, 0);

    questions.push({
      id: `q${i + 1}`,
      prompt:
        difficultyLevel >= 3
          ? `Analyze which statement best reflects the material: "${correct.slice(0, 60)}…"`
          : `Which statement is supported by the study material?`,
      options: shuffled.options,
      correctIndex: shuffled.correctIndex,
      explanation: correct.slice(0, 200)
    });
  }

  return validateQuizQuestions(questions);
}

export async function generateQuizQuestions(studyText, meta = {}) {
  const difficultyLevel = [1, 2, 3].includes(meta.difficultyLevel) ? meta.difficultyLevel : 2;

  if (!config.openaiApiKey) {
    return {
      questions: fallbackQuiz(studyText, difficultyLevel),
      modelUsed: "fallback-local",
      promptVersion: QUIZ_PROMPT_VERSION
    };
  }

  try {
    const messages = buildQuizMessages(studyText, { ...meta, difficultyLevel });
    const { parsed, modelUsed } = await callOpenAIJson(messages);
    const questions = validateQuizQuestions(parsed.questions ?? parsed);
    return { questions, modelUsed, promptVersion: QUIZ_PROMPT_VERSION };
  } catch (error) {
    console.warn("[quiz] OpenAI failed, using fallback:", error.message);
    return {
      questions: fallbackQuiz(studyText, difficultyLevel),
      modelUsed: "fallback-local",
      promptVersion: QUIZ_PROMPT_VERSION
    };
  }
}
