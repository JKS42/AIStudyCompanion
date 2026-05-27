export const config = {
  port: Number(process.env.PORT ?? 8787),
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  summaryTimeoutMs: Number(process.env.SUMMARY_TIMEOUT_MS ?? 45000),
  summaryMaxInputChars: Number(process.env.SUMMARY_MAX_INPUT_CHARS ?? 12000)
};

export function assertServerConfig() {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    console.warn(
      "[config] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for /api/ai/summarize."
    );
  }
  if (!config.openaiApiKey) {
    console.warn("[config] OPENAI_API_KEY not set — using fallback summarizer for demos.");
  }
}
