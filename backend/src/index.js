import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ai-study-companion-backend" });
});

app.post("/api/ai/summarize", async (req, res) => {
  const { noteText } = req.body ?? {};
  if (!noteText || typeof noteText !== "string") {
    return res.status(400).json({ error: "noteText is required" });
  }

  return res.json({
    summary:
      "This is a placeholder summary endpoint. Replace with provider integration via secure server-side API key.",
    noteLength: noteText.length
  });
});

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`backend listening on ${port}`);
});
