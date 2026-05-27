export const FLASHCARDS_PROMPT_VERSION = "flashcards-v1";

export function buildFlashcardMessages(studyText, meta = {}) {
  const count = meta.count ?? 10;
  const titleLine = meta.title ? `Title: ${meta.title}\n` : "";

  return [
    {
      role: "system",
      content: `You create study flashcards from source material.
Return JSON only:
{"cards":[{"front":"string","back":"string"}]}
Rules:
- Create exactly ${count} cards
- Front: concise question or term
- Back: clear answer (1-3 sentences max)
- Cover distinct concepts from the source`
    },
    {
      role: "user",
      content: `${titleLine}Source material:\n\n${studyText}`
    }
  ];
}
