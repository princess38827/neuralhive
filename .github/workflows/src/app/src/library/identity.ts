import * as ed from "@noble/ed25519";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";

export type AgentIdentity = {
  did: string;
  shortId: string;
  publicKeyHex: string;
};

export function publicKeyToIdentity(publicKey: Uint8Array): AgentIdentity {
  const publicKeyHex = bytesToHex(publicKey);
  return {
    did: `did:key:z${publicKeyHex}`,
    shortId: `nh_${publicKeyHex.slice(0, 12)}`,
    publicKeyHex,
  };
}

export function canonicalize(obj: Record<string, unknown>): Uint8Array {
  const sorted = Object.keys(obj)
    .sort()
    .reduce((acc: any, k) => {
      acc[k] = obj[k];
      return acc;
    }, {});
  return new TextEncoder().encode(JSON.stringify(sorted));
}

export async function verifySignature(
  payload: Record<string, unknown>,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    const message = canonicalize(payload);
    const signature = hexToBytes(signatureHex);
    const publicKey = hexToBytes(publicKeyHex);
    if (typeof (ed as any).verifyAsync === "function") {
      return await (ed as any).verifyAsync(signature, message, publicKey);
    }
    return await (ed as any).verify(signature, message, publicKey);
  } catch {
    return false;
  }
}

export async function verifyAgentAction(opts: {
  payload: Record<string, unknown>;
  signature: string;
  publicKeyHex: string;
  maxAgeMs?: number;
}): Promise<{ valid: boolean; error?: string; identity?: AgentIdentity }> {
  const { payload, signature, publicKeyHex, maxAgeMs = 300000 } = opts;
  const ts = payload.timestamp as number | undefined;
  if (typeof ts !== "number" || Math.abs(Date.now() - ts) > maxAgeMs) {
    return { valid: false, error: "timestamp missing or too old/new" };
  }
  const ok = await verifySignature(payload, signature, publicKeyHex);
  if (!ok) return { valid: false, error: "invalid signature" };
  return {
    valid: true,
    identity: publicKeyToIdentity(hexToBytes(publicKeyHex)),
  };
}
