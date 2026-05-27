export const SUMMARY_PROMPT_VERSION = "summary-v1";

export function buildSummaryMessages(noteText, meta = {}) {
  const subjectLine = meta.subject ? `Subject: ${meta.subject}\n` : "";
  const titleLine = meta.title ? `Title: ${meta.title}\n` : "";

  return [
    {
      role: "system",
      content: `You are a study assistant. Summarize student notes clearly and accurately.
Return JSON only with this shape:
{"summary":"string","keyPoints":["string",...]}
Rules:
- summary: 2-4 short paragraphs, plain language
- keyPoints: 5-8 concise bullet strings
- Do not invent facts not present in the source text`
    },
    {
      role: "user",
      content: `${titleLine}${subjectLine}Source text:\n\n${noteText}`
    }
  ];
}
