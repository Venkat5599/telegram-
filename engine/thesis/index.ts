import { config } from "../../shared/config.ts";

// OpenAI-compatible chat completion. Works with the aicredits gateway,
// DeepSeek native, or any /v1/chat/completions endpoint.
// Set LLM_BASE_URL + LLM_MODEL + DEEPSEEK_API_KEY in .env.

export interface SignalEvidence {
  type: "rwa_flow" | "rotation" | "anomaly";
  asset?: string;
  summary: string; // raw numeric facts the detector found
  data: Record<string, unknown>;
}

export interface Thesis {
  thesis: string;
  confidence: number; // 0-100
}

const SYSTEM = `You are Veritas, an on-chain intelligence analyst for the Mantle network.
You turn raw smart-money / RWA-LST flow evidence into a sharp, investor-grade thesis.
Rules:
- 2 sentences max. No hype, no emojis, no hedging filler.
- Cite the actual numbers from the evidence.
- End with the actionable implication for a professional investor.
- Output STRICT JSON: {"thesis": string, "confidence": number 0-100}.`;

export async function generateThesis(ev: SignalEvidence): Promise<Thesis> {
  const key = config.deepseekApiKey;
  if (!key) {
    return { thesis: ev.summary, confidence: 50 }; // graceful fallback
  }

  const res = await fetch(`${config.llmBaseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: config.llmModel,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Signal type: ${ev.type}\nAsset: ${
            ev.asset ?? "n/a"
          }\nEvidence: ${ev.summary}\nData: ${JSON.stringify(ev.data)}`,
        },
      ],
      temperature: 0.4,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM ${res.status}: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const raw = json.choices?.[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(raw) as Thesis;
    let conf = parsed.confidence ?? 50;
    if (conf > 0 && conf <= 1) conf *= 100; // some models return 0-1 scale
    return {
      thesis: parsed.thesis ?? ev.summary,
      confidence: Math.max(0, Math.min(100, Math.round(conf))),
    };
  } catch {
    return { thesis: raw.slice(0, 280), confidence: 50 };
  }
}
