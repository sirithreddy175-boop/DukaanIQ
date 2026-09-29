const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Reusable server-side Hindsight service for DukaanIQ.
//
// All Hindsight API calls live here (imported only by backend functions).
// Credentials are read from backend secrets — never hardcoded, never sent to
// the frontend. The frontend will eventually reach this via db.functions.invoke.
//
// Required secrets (set in dashboard -> environment variables):
//   HINDSIGHT_BASE_URL  e.g. https://api.hindsight.vectorize.io
//   HINDSIGHT_API_KEY    hsk_...
//   HINDSIGHT_BANK_ID    e.g. "Retail Business Memory"
//
// Operations:
//   retain(content, options)  -> store a useful DukaanIQ business memory
//   recall(query, options)   -> retrieve memories relevant to a user question
//   reflect(query, options)  -> generate a contextual answer from stored memories

import { HindsightClient } from "npm:@vectorize-io/hindsight-client@0.10.1";
import { secrets } from "base44:runtime";

const USER_AGENT = "dukaaniq-hindsight/1.0.0";

// Max content size we accept into retain(), to keep writes bounded.
const MAX_CONTENT_CHARS = 20000;

// Hindsight client is constructed lazily so a missing/invalid secret surfaces
// as a handled error (not a module-load boot error).
let _client = null;
let _configuredKey = null;

function getConfig() {
  const baseUrl = (secrets.get("HINDSIGHT_BASE_URL") || "").trim();
  const apiKey = (secrets.get("HINDSIGHT_API_KEY") || "").trim();
  const bankId = (secrets.get("HINDSIGHT_BANK_ID") || "").trim();

  const missing = [];
  if (!baseUrl) missing.push("HINDSIGHT_BASE_URL");
  if (!apiKey) missing.push("HINDSIGHT_API_KEY");
  if (!bankId) missing.push("HINDSIGHT_BANK_ID");
  if (missing.length) {
    throw new HindsightConfigError(
      "Hindsight is not configured. Missing environment variable(s): " +
        missing.join(", ") +
        ". Set them in dashboard -> environment variables."
    );
  }
  return { baseUrl, apiKey, bankId };
}

function getClient() {
  const { baseUrl, apiKey } = getConfig();
  // Rebuild only if not yet built or the key changed (keeps a hot instance honest).
  if (!_client || _configuredKey !== apiKey) {
    _client = new HindsightClient({ baseUrl, apiKey, userAgent: USER_AGENT });
    _configuredKey = apiKey;
  }
  return _client;
}

// Custom config error so functions can map it to a 500 without leaking details.
export class HindsightConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "HindsightConfigError";
    this.statusCode = 500;
  }
}

// Turn any Hindsight SDK / network failure into a normalized error carrying a
// sensible HTTP status. Never rethrows the raw error (it may include the key).
function normalizeError(err) {
  // Hindsight SDK errors carry statusCode + details.
  if (err && typeof err === "object" && typeof err.statusCode !== "undefined") {
    const status = err.statusCode;
    if (status === 401 || status === 403) {
      const e = new Error(
        "Invalid Hindsight API credentials. Verify HINDSIGHT_API_KEY is correct and active."
      );
      e.statusCode = 401;
      e.name = "HindsightAuthError";
      return e;
    }
    if (status === 404) {
      const e = new Error(
        "Hindsight bank not found. Verify HINDSIGHT_BANK_ID matches an existing bank."
      );
      e.statusCode = 404;
      e.name = "HindsightBankError";
      return e;
    }
    if (status === 429 || status === 503) {
      const e = new Error("Hindsight is temporarily at capacity. Please retry shortly.");
      e.statusCode = 503;
      e.name = "HindsightCapacityError";
      return e;
    }
    const e = new Error("Hindsight API error: " + (err.message || "HTTP " + status));
    e.statusCode = 502;
    e.name = "HindsightApiError";
    return e;
  }
  // Network / unknown failure.
  const e = new Error(
    "Hindsight request failed: " + (err && err.message ? err.message : String(err))
  );
  e.statusCode = 502;
  e.name = "HindsightRequestError";
  return e;
}

// retain() — store a useful business memory.
// options: { context?, metadata?, tags?, async? }
export async function retain(content, options = {}) {
  if (typeof content !== "string" || !content.trim()) {
    const e = new Error("retain() requires non-empty string content.");
    e.statusCode = 400;
    throw e;
  }
  if (content.length > MAX_CONTENT_CHARS) {
    const e = new Error(
      "retain() content too long (" + content.length + " > " + MAX_CONTENT_CHARS + " chars)."
    );
    e.statusCode = 400;
    throw e;
  }

  const { bankId } = getConfig();
  const client = getClient();
  try {
    const res = await client.retain(bankId, content, {
      context: options.context,
      metadata: options.metadata,
      tags: options.tags,
      async: options.async === true,
    });
    return {
      success: !!res.success,
      bank_id: res.bank_id,
      items_count: res.items_count || 0,
      async: !!res.async,
      operation_id: res.operation_id || null,
    };
  } catch (err) {
    throw normalizeError(err);
  }
}

// recall() — retrieve memories relevant to a user's question.
// options: { budget?, maxTokens?, tags?, tagsMatch? }
// tags + tagsMatch enable per-user isolation inside the shared bank:
//   tags: ["user:<userId>"], tagsMatch: "any"  -> that user's tagged memories
//                                          PLUS all untagged (demo) memories,
//                                          excluding other users' tagged memories.
export async function recall(query, options = {}) {
  if (typeof query !== "string" || !query.trim()) {
    const e = new Error("recall() requires a non-empty query string.");
    e.statusCode = 400;
    throw e;
  }

  const { bankId } = getConfig();
  const client = getClient();
  try {
    const recallOpts = {
      budget: options.budget || "mid",
      maxTokens: options.maxTokens,
    };
    if (Array.isArray(options.tags) && options.tags.length > 0) {
      recallOpts.tags = options.tags;
      recallOpts.tagsMatch = options.tagsMatch || "any";
    }
    const res = await client.recall(bankId, query, recallOpts);
    const results = Array.isArray(res.results) ? res.results : [];
    return {
      count: results.length,
      results,
      empty: results.length === 0,
    };
  } catch (err) {
    throw normalizeError(err);
  }
}

// reflect() — generate a contextual answer grounded in stored memories.
// options: { budget?, tags?, tagsMatch? }
export async function reflect(query, options = {}) {
  if (typeof query !== "string" || !query.trim()) {
    const e = new Error("reflect() requires a non-empty query string.");
    e.statusCode = 400;
    throw e;
  }

  const { bankId } = getConfig();
  const client = getClient();
  try {
    const reflectOpts = {
      budget: options.budget || "mid",
    };
    if (Array.isArray(options.tags) && options.tags.length > 0) {
      reflectOpts.tags = options.tags;
      reflectOpts.tagsMatch = options.tagsMatch || "any";
    }
    const res = await client.reflect(bankId, query, reflectOpts);
    return {
      text: res.text || "",
    };
  } catch (err) {
    throw normalizeError(err);
  }
}