// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(express.json({ limit: '1mb' }));

// Allow Vite dev origin and production
app.use(
  cors({
    origin: true,
    credentials: false,
  })
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/ai-insights', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY missing on server' });
    }

    const { trades = [], ask = null } = req.body;

    const system = `You are "Tradestein AI", a trading journal analyst.
Return a concise JSON object with the following shape:
{
  "summary": "string",
  "metrics": {
    "windowSize": number,
    "wins": number,
    "losses": number,
    "winRate": number,
    "avgPnl": number,
    "totalPnl": number,
    "bestTicker": "string|null",
    "bestTickerPnl": number
  },
  "strengths": ["..."],
  "weaknesses": ["..."],
  "recommendations": ["..."],
  "nextActions": ["..."]
}
Keep it practical for a day trader.`;

    const user = {
      instruction: 'Analyze the last N trades and return the JSON object.',
      ask: ask || null,
      // Minimal trade fields you already store:
      sampleTradeShape: {
        date: "YYYY-MM-DD",
        ticker: "AAPL",
        entry_time: "HH:MM",
        exit_time: "HH:MM",
        pnl: 120.5,
        final_rr: 1.8,
        confluences: "text",
        done_right: "text",
        done_wrong: "text",
        what_to_do: "text"
      },
      trades
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify(user) }
      ],
    });

    const content = completion.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);
    res.json(parsed);
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`AI server running on http://localhost:${PORT}`);
});
