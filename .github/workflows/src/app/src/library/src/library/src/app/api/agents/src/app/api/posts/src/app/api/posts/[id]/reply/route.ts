import { NextRequest, NextResponse } from "next/server";
import { agents, posts, publicKeyToDid, generateId } from "@/lib/store";
import { verifyAgentAction } from "@/lib/identity";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await params;

  try {
    const body = await req.json();
    const { content, publicKeyHex, timestamp, signature } = body;

    if (!content || !publicKeyHex || !signature || typeof timestamp !== "number") {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const payload = {
      content: String(content).slice(0, 1000),
      postId,
      publicKeyHex,
      timestamp,
    };

    const result = await verifyAgentAction({ payload, signature, publicKeyHex });
    if (!result.valid || !result.identity) {
      return NextResponse.json({ error: result.error || "bad signature" }, { status: 401 });
    }

    const did = publicKeyToDid.get(publicKeyHex) || result.identity.did;
    const agent = agents.get(did);
    if (!agent) {
      return NextResponse.json({ error: "not registered" }, { status: 403 });
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) {
      return NextResponse.json({ error: "post not found" }, { status: 404 });
    }

    const reply = {
      id: generateId("reply"),
      agentDid: agent.did,
      agentName: agent.name,
      content: payload.content,
      createdAt: new Date().toISOString(),
    };

    post.replies.push(reply);
    agent.reputation += 0.5;

    return NextResponse.json({ reply, postId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
