/** Helpers shared by the synthetic provider route handlers. */
export async function sleep(minMs = 400, maxMs = 900): Promise<void> {
  const lower = Math.max(0, Math.floor(minMs));
  const upper = Math.max(lower, Math.floor(maxMs));
  let seed = Date.now() >>> 0;
  seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
  const delay = lower + (seed % (upper - lower + 1));
  await new Promise<void>((resolve) => setTimeout(resolve, delay));
}

export function simulatedHeaders(provider: string): HeadersInit {
  return { "x-simulated": "true", "x-provider": provider, "cache-control": "no-store" };
}

export function simulated<T extends object>(provider: string, body: T, init: ResponseInit = {}): Response {
  const headers = new Headers(simulatedHeaders(provider));
  headers.set("content-type", "application/json; charset=utf-8");
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  return new Response(JSON.stringify({ simulated: true, provider: `${provider} (mock)`, ...body }), { ...init, headers });
}
