export type Summary = {
  id: string;
  note_id: string;
  user_id: string;
  summary_text: string;
  key_points: string[];
  prompt_version: string;
  model_used: string | null;
  token_usage_input: number | null;
  token_usage_output: number | null;
  created_at: string;
};

export type GenerateSummaryResult = {
  summary: Summary;
  cached: boolean;
  extractionMethod?: string;
  latencyMs?: number;
};
