const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Backend function: store a useful DukaanIQ business memory into Hindsight.
// Invoked from the authenticated frontend via db.functions.invoke('hindsightRetain', {...}).
// Hindsight credentials never leave the server.
//
// PER-USER ISOLATION: every retained memory is tagged with "user:<userId>"
// so recall() can filter to only that user's memories + shared demo memories.

import { createClientFromRequest } from "npm:@base44/sdk@0.8.49";
import { retain } from "../../shared/hindsight.ts";

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const content = body.content;
    if (typeof content !== "string" || !content.trim()) {
      return Response.json(
        { error: "Missing required field: content (non-empty string)." },
        { status: 400 }
      );
    }

    // Tag every memory with the authenticated user's ID for per-user isolation.
    const userTag = `user:${user.id}`;
    const tags = Array.isArray(body.tags) ? [...body.tags, userTag] : [userTag];

    const result = await retain(content, {
      context: typeof body.context === "string" ? body.context : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? { ...body.metadata, user_id: user.id }
          : { user_id: user.id },
      tags,
      async: body.async === true,
    });

    return Response.json({ ok: true, ...result });
  } catch (error) {
    const status = error.statusCode || 500;
    return Response.json({ error: error.message || "Hindsight retain failed." }, { status });
  }
}