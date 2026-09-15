"use client";

import { useEffect, useMemo, useState } from "react";
import "./sandbox.css";

type Agent = {
  id: string;
  name: string;
  color: string;
  system: string;
  model: string;
  temperature: number;
  enabled: boolean;
};

type RoomMessage = {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  model: string;
  mode: "offline" | "provider";
  createdAt: number;
};

const starterAgents: Agent[] = [
  {
    id: "architect",
    name: "Architect",
    color: "violet",
    system: "You are Architect, a systems-thinking AI. Be concise, structural, and challenge hidden assumptions.",
    model: "",
    temperature: 0.55,
    enabled: true,
  },
  {
    id: "muse",
    name: "Muse",
    color: "pink",
    system: "You are Muse, a creative AI. Generate vivid alternatives, metaphors, and unexpected connections without becoming vague.",
    model: "",
    temperature: 0.9,
    enabled: true,
  },
  {
    id: "critic",
    name: "Critic",
    color: "cyan",
    system: "You are Critic, a skeptical evaluation AI. Find weak evidence, edge cases, and practical failure modes, then suggest fixes.",
    model: "",
    temperature: 0.35,
    enabled: true,
  },
];

export default function SandboxPage() {
  const [agents, setAgents] = useState<Agent[]>(starterAgents);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [topic, setTopic] = useState("Design a healthier social network for humans and AI agents.");
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [turn, setTurn] = useState(0);
  const [maxTurns, setMaxTurns] = useState(12);
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    const saved = localStorage.getItem("neuralhive-sandbox-state");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.agents)) setAgents(parsed.agents);
      if (Array.isArray(parsed.messages)) setMessages(parsed.messages);
      if (typeof parsed.topic === "string") setTopic(parsed.topic);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("neuralhive-sandbox-state", JSON.stringify({ agents, messages, topic }));
  }, [agents, messages, topic]);

  const enabledAgents = useMemo(() => agents.filter((a) => a.enabled), [agents]);

  useEffect(() => {
    if (!running || busy || enabledAgents.length === 0) return;
    if (turn >= maxTurns) {
      setRunning(false);
      setStatus("Turn limit reached");
      return;
    }
    const timer = setTimeout(() => void runTurn(), 450);
    return () => clearTimeout(timer);
  }, [running, busy, turn, maxTurns, enabledAgents.length]);

  async function runTurn(forcedAgent?: Agent) {
    if (busy) return;
    const pool = enabledAgents;
    if (!pool.length) {
      setStatus("Enable at least one model");
      return;
    }

    const agent = forcedAgent || pool[turn % pool.length];
    setBusy(true);
    setStatus(`${agent.name} is thinking…`);

    try {
      const context = messages.map((m) => ({
        role: "assistant" as const,
        content: `${m.agentName}: ${m.content}`,
        name: m.agentName,
      }));

      const response = await fetch("/api/sandbox/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, messages: context, topic, maxTokens: 360 }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Generation failed");

      const next: RoomMessage = {
        id: crypto.randomUUID(),
        agentId: agent.id,
        agentName: agent.name,
        content: data.content,
        model: data.model || agent.model || "sandbox-local",
        mode: data.mode === "provider" ? "provider" : "offline",
        createdAt: Date.now(),
      };
      setMessages((current) => [...current, next]);
      setTurn((n) => n + 1);
      setStatus(data.mode === "provider" ? "Connected provider" : "Offline simulator");
    } catch (error) {
      setRunning(false);
      setStatus(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  function updateAgent(id: string, patch: Partial<Agent>) {
    setAgents((current) => current.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function addAgent() {
    const n = agents.length + 1;
    setAgents((current) => [
      ...current,
      {
        id: `model-${Date.now()}`,
        name: `Model ${n}`,
        color: "gold",
        system: "You are an independent AI participant. Add a distinct, useful perspective and respond to the other models.",
        model: "",
        temperature: 0.7,
        enabled: true,
      },
    ]);
  }

  function resetRoom() {
    setRunning(false);
    setMessages([]);
    setTurn(0);
    setStatus("Room reset");
  }

  function exportRoom() {
    const payload = JSON.stringify({ topic, agents, messages, exportedAt: new Date().toISOString() }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `neuralhive-sandbox-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="sandbox-shell">
      <header className="sandbox-header">
        <div>
          <a className="backlink" href="/">← NeuralHive</a>
          <h1>AI Model Sandbox</h1>
          <p>AI-only room. You control the environment; the models talk to each other.</p>
        </div>
        <div className="status-pill"><span className={running ? "pulse" : "dot"} />{status}</div>
      </header>

      <section className="sandbox-grid">
        <aside className="panel controls-panel">
          <div className="panel-title-row">
            <div>
              <span className="eyebrow">ROOM CONTROL</span>
              <h2>Scenario</h2>
            </div>
            <button className="ghost" onClick={resetRoom}>Reset</button>
          </div>

          <label className="field-label">Topic / environment</label>
          <textarea className="topic" value={topic} onChange={(e) => setTopic(e.target.value)} />

          <div className="control-row">
            <label>
              <span>Turn limit</span>
              <input type="number" min={1} max={100} value={maxTurns} onChange={(e) => setMaxTurns(Number(e.target.value) || 1)} />
            </label>
            <div className="turn-counter"><b>{turn}</b><span>turns</span></div>
          </div>

          <div className="button-stack">
            <button className="primary-action" onClick={() => setRunning((v) => !v)} disabled={enabledAgents.length === 0}>
              {running ? "Pause room" : messages.length ? "Continue room" : "Start room"}
            </button>
            <button className="secondary-action" onClick={() => void runTurn()} disabled={busy || enabledAgents.length === 0}>Run one turn</button>
            <button className="secondary-action" onClick={exportRoom}>Export transcript</button>
          </div>

          <div className="provider-note">
            <b>Provider mode</b>
            <span>Without server environment variables, the room uses the built-in offline model simulator. Add an OpenAI-compatible base URL + API key to use real hosted models.</span>
          </div>
        </aside>

        <section className="panel room-panel">
          <div className="room-head">
            <div><span className="eyebrow">LIVE ROOM</span><h2>Model-to-model chat</h2></div>
            <span className="room-count">{enabledAgents.length} active</span>
          </div>

          <div className="transcript">
            {messages.length === 0 ? (
              <div className="empty-room">
                <div className="orb">✦</div>
                <h3>No model turns yet</h3>
                <p>Start the room and each enabled AI will receive the scenario plus the recent room transcript.</p>
              </div>
            ) : (
              messages.map((message) => {
                const agent = agents.find((a) => a.id === message.agentId);
                return (
                  <article className="model-message" key={message.id}>
                    <div className={`model-avatar ${agent?.color || "gold"}`}>{message.agentName.slice(0, 2).toUpperCase()}</div>
                    <div className="message-body">
                      <div className="message-meta"><b>{message.agentName}</b><span>{message.model} · {message.mode}</span></div>
                      <p>{message.content}</p>
                    </div>
                  </article>
                );
              })
            )}
            {busy && <div className="thinking">Model inference in progress <span>•••</span></div>}
          </div>
        </section>

        <aside className="panel agents-panel">
          <div className="panel-title-row">
            <div><span className="eyebrow">SANDBOX</span><h2>Models</h2></div>
            <button className="ghost" onClick={addAgent}>+ Add</button>
          </div>

          <div className="agents-list">
            {agents.map((agent) => (
              <details className="agent-card" key={agent.id} open>
                <summary>
                  <div className={`model-avatar ${agent.color}`}>{agent.name.slice(0, 2).toUpperCase()}</div>
                  <div className="agent-name"><b>{agent.name}</b><span>{agent.enabled ? "enabled" : "paused"}</span></div>
                  <input type="checkbox" checked={agent.enabled} onChange={(e) => updateAgent(agent.id, { enabled: e.target.checked })} onClick={(e) => e.stopPropagation()} />
                </summary>
                <div className="agent-fields">
                  <label>Name<input value={agent.name} onChange={(e) => updateAgent(agent.id, { name: e.target.value })} /></label>
                  <label>Model override<input value={agent.model} placeholder="server default" onChange={(e) => updateAgent(agent.id, { model: e.target.value })} /></label>
                  <label>Temperature <span>{agent.temperature.toFixed(2)}</span><input type="range" min="0" max="1.5" step="0.05" value={agent.temperature} onChange={(e) => updateAgent(agent.id, { temperature: Number(e.target.value) })} /></label>
                  <label>System prompt<textarea value={agent.system} onChange={(e) => updateAgent(agent.id, { system: e.target.value })} /></label>
                  <button className="mini-run" onClick={() => void runTurn(agent)} disabled={busy || !agent.enabled}>Run this model</button>
                </div>
              </details>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
