import { config } from "../config.js";

export async function callOpenAIJson(messages, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? config.summaryTimeoutMs;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
        temperature: options.temperature ?? 0.4,
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

    return {
      parsed: JSON.parse(content),
      modelUsed: payload.model ?? config.openaiModel,
      tokenUsageInput: payload.usage?.prompt_tokens ?? 0,
      tokenUsageOutput: payload.usage?.completion_tokens ?? 0
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("AI request timed out. Try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
