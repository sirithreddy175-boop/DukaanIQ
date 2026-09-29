const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Backend function: answer a shopkeeper's question by grounding Groq LLM
// output in Hindsight-recalled business memories.
//
// Flow:  Frontend -> askBusiness -> Hindsight recall (user-scoped) -> Groq LLM -> grounded answer
//
// PER-USER ISOLATION: recall is tagged with "user:<userId>" so each shopkeeper
// only retrieves their own memories + shared demo memories, never another user's.
//
// Invoked from the authenticated frontend via:
//   db.functions.invoke('askBusiness', { query })

import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { recall } from "../../shared/hindsight.ts";
import { answerWithMemories } from "../../shared/groq.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const query = body.query;
    if (typeof query !== "string" || !query.trim()) {
      return Response.json(
        { error: "Missing required field: query (non-empty string)." },
        { status: 400 }
      );
    }

    const budget = ["low", "mid", "high"].includes(body.budget) ? body.budget : "mid";

    // 1) Retrieve relevant business memories from Hindsight — scoped to this user.
    let memoryResult;
    try {
      memoryResult = await recall(query, {
        budget,
        tags: [`user:${user.id}`, "demo"],
        tagsMatch: "any",
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return Response.json(
        { error: "Memory retrieval failed: " + (error.message || "unknown error") },
        { status }
      );
    }

    const memories = memoryResult.results || [];

    // 2) If no memories were retrieved, return an honest "not enough info" answer
    //    WITHOUT calling the LLM — no fabrication, no wasted credits.
    if (memoryResult.empty || memories.length === 0) {
      return Response.json({
        ok: true,
        answer:
          "I don't have enough information in your business memory to answer that yet.",
        grounded: false,
        memory_count: 0,
      });
    }

    // 3) Send the memories + question to Groq for a grounded answer.
    let llmResult;
    try {
      llmResult = await answerWithMemories(query, memories, {
        maxTokens: typeof body.maxTokens === "number" ? body.maxTokens : undefined,
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return Response.json(
        { error: "LLM call failed: " + (error.message || "unknown error") },
        { status }
      );
    }

    // 4) Return the grounded answer plus a compact memory trace (no raw secrets).
    return Response.json({
      ok: true,
      answer: llmResult.text,
      grounded: true,
      memory_count: llmResult.memories_used,
      model: llmResult.model,
      memories_preview: memories
        .slice(0, llmResult.memories_used)
        .map((m) => ({
          text: (m.text || "").slice(0, 160),
          score: m.scores?.final ?? null,
        })),
    });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "askBusiness failed." },
      { status }
    );
  }
}