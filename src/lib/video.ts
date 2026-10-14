/**
 * Turns a YouTube or Vimeo address into a privacy-friendly embed address.
 * Anything else returns null (the page then shows a plain link instead).
 */
export function parseVideoUrl(
  url: string,
): { provider: "youtube" | "vimeo"; id: string; embedUrl: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/^m\./, "");
  const youtubeId = /^[A-Za-z0-9_-]{11}$/;

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "music.youtube.com") {
    let id: string | null = null;
    if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
    else {
      const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
      id = match?.[1] ?? null;
    }
    if (id && youtubeId.test(id)) {
      return { provider: "youtube", id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    return null;
  }

  if (host === "youtu.be") {
    const id = parsed.pathname.slice(1).split("/")[0] ?? "";
    if (youtubeId.test(id)) {
      return { provider: "youtube", id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
    }
    return null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match =
      host === "player.vimeo.com"
        ? parsed.pathname.match(/^\/video\/(\d{1,12})(?:\/|$)/)
        : parsed.pathname.match(/^\/(?:channels\/[^/]+\/)?(\d{1,12})(?:\/|$)/);
    const id = match?.[1];
    if (id)
      return { provider: "vimeo", id, embedUrl: `https://player.vimeo.com/video/${id}?dnt=1` };
    return null;
  }

  return null;
}
