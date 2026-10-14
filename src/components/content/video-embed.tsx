import { useState } from "react";

import { parseVideoUrl } from "@/lib/video";

/**
 * Click-to-play video: nothing loads from YouTube or Vimeo until the visitor
 * presses play (privacy page: "videos load only when you press play").
 * Unknown addresses fall back to a plain link.
 */
export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const video = parseVideoUrl(url);

  if (!video) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex border-b border-navy pb-0.5 text-sm font-semibold text-navy hover:border-blue hover:text-blue"
      >
        Watch the video (opens in a new tab)
      </a>
    );
  }

  const provider = video.provider === "youtube" ? "YouTube" : "Vimeo";
  return (
    <div className="relative aspect-video w-full overflow-hidden border border-border bg-navy">
      {playing ? (
        <iframe
          src={`${video.embedUrl}${video.embedUrl.includes("?") ? "&" : "?"}autoplay=1`}
          title={title}
          className="absolute inset-0 size-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex flex-col items-start justify-end gap-2 p-5 text-left text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-light-blue"
        >
          <span className="text-lg font-semibold leading-snug">{title}</span>
          <span className="inline-flex items-center border border-primary-foreground/70 px-3 py-1.5 text-sm font-semibold group-hover:bg-primary-foreground group-hover:text-navy">
            Play video
          </span>
          <span className="text-xs text-primary-foreground/75">
            Loads from {provider} when you press play.
          </span>
        </button>
      )}
    </div>
  );
}
