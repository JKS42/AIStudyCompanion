import { config } from "../config.js";
import { SUMMARY_PROMPT_VERSION, buildSummaryMessages } from "../prompts/summary-v1.js";
import { truncateText } from "./noteContent.js";

function parseSummaryJson(raw) {
  const parsed = JSON.parse(raw);
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";
  const keyPoints = Array.isArray(parsed.keyPoints)
    ? parsed.keyPoints.filter((p) => typeof p === "string" && p.trim()).map((p) => p.trim())
    : [];

  if (!summary) {
    throw new Error("Model returned an empty summary.");
  }

  return { summaryText: summary, keyPoints };
}

function fallbackSummary(noteText) {
  const sentences = noteText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const summary =
    sentences.slice(0, 3).join(" ") ||
    `${noteText.slice(0, 400)}${noteText.length > 400 ? "…" : ""}`;

  const keyPoints = sentences.slice(0, 6).map((s) => s.replace(/\s+/g, " "));

  return {
    summaryText: summary,
    keyPoints: keyPoints.length ? keyPoints : [noteText.slice(0, 120)],
    modelUsed: "fallback-local",
    tokenUsageInput: Math.ceil(noteText.length / 4),
    tokenUsageOutput: Math.ceil(summary.length / 4),
    promptVersion: SUMMARY_PROMPT_VERSION
  };
}

async function callOpenAI(messages) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.summaryTimeoutMs);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.openaiModel,
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`AI provider error (${response.status}): ${body.slice(0, 200)}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI provider returned an empty response.");

    const parsed = parseSummaryJson(content);

    return {
      ...parsed,
      modelUsed: payload.model ?? config.openaiModel,
      tokenUsageInput: payload.usage?.prompt_tokens ?? 0,
      tokenUsageOutput: payload.usage?.completion_tokens ?? 0,
      promptVersion: SUMMARY_PROMPT_VERSION
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Summary generation timed out. Try again with shorter notes.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateSummary(noteText, meta = {}) {
  const input = truncateText(noteText, config.summaryMaxInputChars);

  if (!config.openaiApiKey) {
    return fallbackSummary(input);
  }

  try {
    const messages = buildSummaryMessages(input, meta);
    return await callOpenAI(messages);
  } catch (error) {
    console.warn("[summarize] OpenAI failed, using fallback:", error.message);
    return fallbackSummary(input);
  }
}
