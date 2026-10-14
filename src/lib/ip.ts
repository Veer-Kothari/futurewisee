/**
 * The address a rate limit is counted against. IPv4 (and IPv4-mapped IPv6)
 * stays as it is. IPv6 is reduced to its /64 network: one connection
 * usually controls a whole /64, so counting single addresses would let a
 * script rotate through them and never hit a limit.
 */
export function rateLimitAddress(raw: string): string {
  const value =
    raw
      .trim()
      .toLowerCase()
      .replace(/^\[|\]$/g, "")
      .split("%")[0] ?? "";
  if (!value) return "unknown";

  const mapped = value.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped?.[1]) return mapped[1];
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return value;
  if (!value.includes(":") || !/^[0-9a-f:.]+$/.test(value)) return value.slice(0, 100);

  const [head = "", tail = ""] = value.split("::", 2) as [string?, string?];
  const headParts = head ? head.split(":") : [];
  const tailParts = value.includes("::") ? (tail ? tail.split(":") : []) : [];
  const missing = value.includes("::") ? 8 - headParts.length - tailParts.length : 0;
  const groups = [...headParts, ...Array<string>(Math.max(missing, 0)).fill("0"), ...tailParts];
  if (groups.length < 4) return value.slice(0, 100);
  const prefix = groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, "") || "0")
    .join(":");
  return `${prefix}::/64`;
}
