import { config } from "../config.js";
import { callOpenAIJson } from "../lib/openai.js";
import {
  FLASHCARDS_PROMPT_VERSION,
  buildFlashcardMessages
} from "../prompts/flashcards-v1.js";

function validateCards(raw, expectedCount) {
  if (!Array.isArray(raw)) {
    throw new Error("Flashcards must be an array.");
  }

  const cards = raw
    .map((item, index) => {
      const front = typeof item.front === "string" ? item.front.trim() : "";
      const back = typeof item.back === "string" ? item.back.trim() : "";
      if (!front || !back) {
        throw new Error(`Flashcard ${index + 1} is missing front or back text.`);
      }
      return { front, back };
    })
    .slice(0, expectedCount);

  if (cards.length < 3) {
    throw new Error("At least 3 flashcards are required.");
  }

  return cards;
}

function fallbackFlashcards(studyText, count) {
  const sentences = studyText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const pool = sentences.length ? sentences : [studyText.slice(0, 300)];
  const cards = [];

  for (let i = 0; i < Math.min(count, pool.length); i += 1) {
    const sentence = pool[i];
    cards.push({
      front: `What is the key idea in: "${sentence.slice(0, 50)}…"?`,
      back: sentence.slice(0, 220)
    });
  }

  return validateCards(cards, count);
}

export async function generateFlashcards(studyText, meta = {}) {
  const count = Math.min(20, Math.max(3, Number(meta.count) || 10));

  if (!config.openaiApiKey) {
    return {
      cards: fallbackFlashcards(studyText, count),
      modelUsed: "fallback-local",
      promptVersion: FLASHCARDS_PROMPT_VERSION
    };
  }

  try {
    const messages = buildFlashcardMessages(studyText, { ...meta, count });
    const { parsed, modelUsed } = await callOpenAIJson(messages);
    const cards = validateCards(parsed.cards ?? parsed, count);
    return { cards, modelUsed, promptVersion: FLASHCARDS_PROMPT_VERSION };
  } catch (error) {
    console.warn("[flashcards] OpenAI failed, using fallback:", error.message);
    return {
      cards: fallbackFlashcards(studyText, count),
      modelUsed: "fallback-local",
      promptVersion: FLASHCARDS_PROMPT_VERSION
    };
  }
}
