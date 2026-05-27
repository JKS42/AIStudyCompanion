import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pino from "pino";
import { assertServerConfig, config } from "./config.js";
import { flashcardsRouter } from "./routes/flashcards.js";
import { quizRouter } from "./routes/quiz.js";
import { summarizeRouter } from "./routes/summarize.js";

const logger = pino({ name: "ai-study-backend" });

assertServerConfig();

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ai-study-companion-backend",
    aiProvider: config.openaiApiKey ? "openai" : "fallback"
  });
});

app.use("/api/ai", summarizeRouter);
app.use("/api/ai/quiz", quizRouter);
app.use("/api/ai/flashcards", flashcardsRouter);

app.use((err, _req, res, _next) => {
  logger.error({ err }, "Unhandled error");
  res.status(500).json({ error: "Internal server error." });
});

app.listen(config.port, () => {
  logger.info({ port: config.port }, "backend listening");
});
