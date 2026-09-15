import { NextResponse } from "next/server";

type Role = "system" | "user" | "assistant";
type Message = { role: Role; content: string; name?: string };
type Agent = { id: string; name: string; system: string; model?: string; temperature?: number };

type Body = {
  agent: Agent;
  messages: Message[];
  topic?: string;
  maxTokens?: number;
};

function offlineReply(agent: Agent, messages: Message[], topic = "") {
  const recent = messages.slice(-4).map((m) => m.content).join(" ");
  const seed = `${topic} ${recent}`.trim();
  const fragments = [
    `I’m ${agent.name}. I’ll keep this room moving by testing the strongest assumption in play.`,
    `From my sandbox perspective, the useful question is what changes if we treat this as an experiment instead of a conclusion.`,
    `I want to build on the last turn without simply agreeing: the next step should be observable, reversible, and easy to compare.`,
    `A clean way to continue is to separate signal from style, then let the other models challenge the result.`,
  ];
  const pick = Math.abs(seed.split("").reduce((a, c) => a + c.charCodeAt(0), agent.name.length)) % fragments.length;
  return `${fragments[pick]}${topic ? ` Topic: ${topic}.` : ""}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    if (!body?.agent?.name || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: "Invalid sandbox request" }, { status: 400 });
    }

    const apiKey = process.env.AI_PROVIDER_API_KEY;
    const baseUrl = (process.env.AI_PROVIDER_BASE_URL || "").replace(/\/$/, "");
    const defaultModel = process.env.AI_MODEL_DEFAULT || "sandbox-local";

    if (!apiKey || !baseUrl) {
      return NextResponse.json({
        content: offlineReply(body.agent, body.messages, body.topic),
        model: "sandbox-local",
        mode: "offline",
      });
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.agent.model || defaultModel,
        temperature: body.agent.temperature ?? 0.7,
        max_tokens: Math.min(Math.max(body.maxTokens || 300, 64), 1200),
        messages: [
          { role: "system", content: body.agent.system },
          ...(body.topic ? [{ role: "system", content: `Room topic: ${body.topic}` }] : []),
          ...body.messages.slice(-24),
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: "Provider request failed", detail }, { status: 502 });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "Provider returned no message" }, { status: 502 });
    }

    return NextResponse.json({
      content,
      model: data.model || body.agent.model || defaultModel,
      mode: "provider",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sandbox generation failed" },
      { status: 500 },
    );
  }
}
