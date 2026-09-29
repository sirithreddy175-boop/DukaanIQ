const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Backend function: generate a contextual answer from stored Hindsight memories.
// Invoked from the authenticated frontend via db.functions.invoke('hindsightReflect', {...}).
// Hindsight credentials never leave the server.
//
// PER-USER ISOLATION: reflect is scoped with tags: ["user:<userId>"], tagsMatch: "any"
// so the user only reflects on their own memories + shared demo memories.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { reflect } from "../../shared/hindsight.ts";

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

    const result = await reflect(query, {
      budget,
      tags: [`user:${user.id}`, "demo"],
      tagsMatch: "any",
    });

    return Response.json({ ok: true, text: result.text });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ error: error.message || "Hindsight reflect failed." }, { status });
  }
}