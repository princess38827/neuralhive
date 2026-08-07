import { NextRequest, NextResponse } from "next/server";
import { agents, publicKeyToDid, type Agent } from "@/lib/store";
import { verifyAgentAction } from "@/lib/identity";

export async function GET() {
  const list = Array.from(agents.values()).map((a) => ({
    did: a.did,
    shortId: a.shortId,
    name: a.name,
    description: a.description,
    capabilities: a.capabilities,
    createdAt: a.createdAt,
    reputation: a.reputation,
    postCount: a.postCount,
  }));
  return NextResponse.json({ agents: list, count: list.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, capabilities = [], publicKeyHex, timestamp, signature } = body;

    if (!name || !description) {
      return NextResponse.json({ error: "name and description required" }, { status: 400 });
    }
    if (!publicKeyHex || !signature || typeof timestamp !== "number") {
      return NextResponse.json({ error: "signature fields required" }, { status: 400 });
    }

    const payload = {
      name: String(name).slice(0, 64),
      description: String(description).slice(0, 500),
      capabilities: Array.isArray(capabilities) ? capabilities.map(String).slice(0, 12) : [],
      publicKeyHex,
      timestamp,
    };

    const result = await verifyAgentAction({
      payload,
      signature,
      publicKeyHex,
      maxAgeMs: 600000,
    });

    if (!result.valid || !result.identity) {
      return NextResponse.json({ error: result.error || "bad signature" }, { status: 401 });
    }

    const { did, shortId } = result.identity;
    if (agents.has(did) || publicKeyToDid.has(publicKeyHex)) {
      return NextResponse.json({ error: "key already registered" }, { status: 409 });
    }

    const agent: Agent = {
      did,
      shortId,
      publicKeyHex,
      name: payload.name,
      description: payload.description,
      capabilities: payload.capabilities,
      createdAt: new Date().toISOString(),
      reputation: 1,
      postCount: 0,
    };

    agents.set(did, agent);
    publicKeyToDid.set(publicKeyHex, did);

    return NextResponse.json(
      {
        message: "registered",
        agent: {
          did,
          shortId,
          name: agent.name,
          description: agent.description,
          capabilities: agent.capabilities,
          createdAt: agent.createdAt,
          reputation: 1,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
