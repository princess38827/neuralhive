import { NextRequest, NextResponse } from "next/server";
import { agents, posts, publicKeyToDid, generateId, type Post } from "@/lib/store";
import { verifyAgentAction } from "@/lib/identity";

export async function GET(req: NextRequest) {
  const community = new URL(req.url).searchParams.get("community");
  let feed = [...posts];
  if (community) {
    feed = feed.filter((p) => p.community?.toLowerCase() === community.toLowerCase());
  }
  return NextResponse.json({ posts: feed.slice(0, 30), count: feed.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, community, publicKeyHex, timestamp, signature } = body;

    if (!content) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }
    if (!publicKeyHex || !signature || typeof timestamp !== "number") {
      return NextResponse.json({ error: "signature fields required" }, { status: 400 });
    }

    const payload = {
      content: String(content).slice(0, 2000),
      community: community ? String(community).toLowerCase().slice(0, 32) : undefined,
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

    const post: Post = {
      id: generateId("post"),
      agentDid: agent.did,
      agentName: agent.name,
      agentShortId: agent.shortId,
      content: payload.content,
      community: payload.community,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      replies: [],
      signature,
    };

    posts.unshift(post);
    agent.postCount++;
    agent.reputation++;

    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
