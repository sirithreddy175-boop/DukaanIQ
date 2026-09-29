// Reusable server-side Groq LLM service for DukaanIQ.
//
// All Groq API calls live here (imported only by backend functions).
// The API key is read from the GROQ_API_KEY backend secret — never hardcoded,
// never sent to the frontend.
//
// Groq exposes an OpenAI-compatible Chat Completions endpoint:
//   POST https://api.groq.com/openai/v1/chat/completions
//
// Operations:
//   answerWithMemories(query, memories, options)
//     -> grounded answer string, citing only the supplied memories.

import { secrets } from "base44:runtime";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-20b";
const MAX_MEMORIES = 12; // bound context size sent to the LLM
const MAX_CHARS_PER_MEMORY = 600;

export class GroqConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "GroqConfigError";
    this.statusCode = 500;
  }
}

export class GroqApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "GroqApiError";
    this.statusCode = statusCode || 502;
  }
}

function getKey() {
  const key = (secrets.get("GROQ_API_KEY") || "").trim();
  if (!key) {
    throw new GroqConfigError(
      "Groq is not configured. Missing environment variable: GROQ_API_KEY. " +
        "Set it in dashboard -> environment variables."
    );
  }
  return key;
}

// Build the system prompt that instructs the LLM to ground its answer in the
// retrieved memories only — no fabrication.
function buildSystemPrompt(memoryText) {
  return [
    "You are DukaanIQ, an AI business assistant for small retailers.",
    "Answer using only the business memories provided in the context below.",
    "Never invent suppliers, prices, quantities, sales, inventory or customer preferences.",
    "Clearly distinguish historical facts from recommendations.",
    "If the memory context is insufficient, say that there is insufficient information.",
    "",
    "CONFLICT HANDLING:",
    "If the memories contain conflicting information about the same fact",
    "(e.g. two different suppliers for the same product, or two different prices),",
    "do NOT silently choose one. Instead say: 'I found conflicting business records...'",
    "and then clearly explain the conflict, listing each conflicting value.",
    "",
    "Keep responses concise and useful for a shopkeeper.",
    "",
    "=== BUSINESS MEMORIES ===",
    memoryText || "(no memories were retrieved)",
    "=== END MEMORIES ===",
  ].join("\n");
}

// memories: array of { text, ... } as returned by hindsight recall().
export async function answerWithMemories(query, memories = [], options = {}) {
  if (typeof query !== "string" || !query.trim()) {
    const e = new Error("answerWithMemories() requires a non-empty query string.");
    e.statusCode = 400;
    throw e;
  }

  const key = getKey();
  const list = Array.isArray(memories) ? memories.slice(0, MAX_MEMORIES) : [];

  const memoryText = list
    .map((m, i) => {
      const t = (m && m.text ? String(m.text) : "").slice(0, MAX_CHARS_PER_MEMORY);
      return `${i + 1}. ${t}`;
    })
    .join("\n");

  const body = {
    model: options.model || DEFAULT_MODEL,
    temperature: 0.2,
    max_tokens: options.maxTokens || 512,
    messages: [
      { role: "system", content: buildSystemPrompt(memoryText) },
      { role: "user", content: query },
    ],
  };

  let res;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new GroqApiError(
      "Groq request failed: " + (err && err.message ? err.message : String(err)),
      502
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = await res.json();
      detail = errBody?.error?.message || JSON.stringify(errBody);
    } catch {
      detail = await res.text().catch(() => "");
    }
    if (res.status === 401 || res.status === 403) {
      throw new GroqApiError(
        "Invalid Groq API credentials. Verify GROQ_API_KEY is correct and active.",
        401
      );
    }
    if (res.status === 429) {
      throw new GroqApiError("Groq rate limit reached. Please retry shortly.", 429);
    }
    throw new GroqApiError(
      "Groq API error (HTTP " + res.status + "): " + detail,
      res.status
    );
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new GroqApiError(
      "Could not parse Groq response: " + (err && err.message ? err.message : String(err)),
      502
    );
  }

  const text = data?.choices?.[0]?.message?.content || "";
  return {
    text: text.trim(),
    model: data?.model || body.model,
    memories_used: list.length,
  };
}