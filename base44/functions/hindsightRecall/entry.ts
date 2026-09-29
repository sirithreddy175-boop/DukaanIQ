const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Backend function: retrieve Hindsight memories relevant to a user question.
// Invoked from the authenticated frontend via db.functions.invoke('hindsightRecall', {...}).
//
// PER-USER ISOLATION: recall is scoped with tags: ["user:<userId>"], tagsMatch: "any"
// so the user gets their own tagged memories + shared untagged (demo) memories,
// but never another user's tagged memories.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { recall } from "../../shared/hindsight.ts";

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

    // Scope recall to this user's memories + shared demo (untagged) memories.
    const result = await recall(query, {
      budget,
      tags: [`user:${user.id}`, "demo"],
      tagsMatch: "any",
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json(
      { error: error.message || "Hindsight recall failed." },
      { status }
    );
  }
}